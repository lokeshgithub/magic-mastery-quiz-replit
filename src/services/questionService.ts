import type { Question, QuestionBank, Subject } from '@/types/quiz';
import * as XLSX from 'xlsx';
import {
  fetchSubjects,
  fetchTopics,
  fetchQuestions,
  validateAnswer as apiValidateAnswer,
  createSubject,
  createTopic,
  deleteTopic,
  createQuestions,
  deleteQuestionsByTopic,
  logUsage,
  fetchQuestionSummary,
  DBSubject,
  DBTopic,
  DBQuestion,
} from '@/lib/api';

function shuffleOptions(options: string[]): { shuffledOptions: string[]; shuffleMap: number[] } {
  const indices = options.map((_, i) => i);
  
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  
  const shuffledOptions = indices.map(i => options[i]);
  const shuffleMap = indices;
  
  return { shuffledOptions, shuffleMap };
}

const answerCache = new Map<string, { correctIndex: number; explanation: string }>();

export async function fetchAllQuestions(): Promise<QuestionBank> {
  const bank: QuestionBank = {};

  try {
    const [subjects, topics, questions] = await Promise.all([
      fetchSubjects(),
      fetchTopics(),
      fetchQuestions(),
    ]);

    if (questions.length === 0) {
      console.error('No questions fetched from database');
      return bank;
    }
    
    console.log(`Fetched ${questions.length} questions from database`);

    const subjectMap = new Map<string, DBSubject>(
      subjects.map(s => [s.id, s])
    );
    const topicMap = new Map<string, DBTopic>(
      topics.map(t => [t.id, t])
    );

    answerCache.clear();

    for (const q of questions) {
      const topic = topicMap.get(q.topicId);
      if (!topic) continue;

      const subject = subjectMap.get(topic.subjectId);
      if (!subject) continue;

      const subjectKey = subject.name.toLowerCase() as Subject;
      const topicName = topic.name;

      if (!bank[subjectKey]) {
        bank[subjectKey] = {};
      }
      if (!bank[subjectKey][topicName]) {
        bank[subjectKey][topicName] = [];
      }

      const originalCorrectIndex = q.correctAnswer.toUpperCase().charCodeAt(0) - 65;

      const originalOptions = [q.optionA, q.optionB, q.optionC, q.optionD];
      const { shuffledOptions, shuffleMap } = shuffleOptions(originalOptions);

      const shuffledCorrectIndex = shuffleMap.findIndex(origIdx => origIdx === originalCorrectIndex);

      answerCache.set(q.id, {
        correctIndex: shuffledCorrectIndex,
        explanation: q.explanation || '',
      });

      const hint = q.hint || undefined;

      bank[subjectKey][topicName].push({
        id: q.id,
        level: q.level,
        question: q.question,
        options: shuffledOptions,
        correct: shuffledCorrectIndex,
        explanation: q.explanation || '',
        concepts: [],
        hint,
        shuffleMap,
      });
    }

    console.log(`Loaded ${questions.length} questions into memory for instant validation`);
    return bank;
  } catch (error) {
    console.error('Error fetching questions:', error);
    return bank;
  }
}

export function validateAnswerLocal(
  questionId: string,
  selectedAnswer: number
): { isCorrect: boolean; correctIndex: number; explanation: string } | null {
  const cached = answerCache.get(questionId);
  if (!cached) return null;
  
  return {
    isCorrect: selectedAnswer === cached.correctIndex,
    correctIndex: cached.correctIndex,
    explanation: cached.explanation,
  };
}

export function logAnswerToServer(
  questionId: string,
  selectedAnswer: number,
  isCorrect: boolean
): void {
  logUsage({
    actionType: 'answer_validation',
    details: { questionId, selectedAnswer, isCorrect },
    estimatedCost: '0.0001',
  }).catch(() => {});
}

export async function validateAnswer(
  questionId: string,
  selectedAnswer: number
): Promise<{ isCorrect: boolean; correctIndex: number; explanation: string }> {
  const localResult = validateAnswerLocal(questionId, selectedAnswer);
  if (localResult) {
    logAnswerToServer(questionId, selectedAnswer, localResult.isCorrect);
    return localResult;
  }

  return apiValidateAnswer(questionId, selectedAnswer);
}

export async function checkDuplicateQuestions(
  topicId: string,
  questions: Array<{ question: string }>
): Promise<Set<string>> {
  const allQuestions = await fetchQuestions();
  const topicQuestions = allQuestions.filter(q => q.topicId === topicId);

  const existingSet = new Set<string>(
    topicQuestions.map(q => q.question.trim().toLowerCase())
  );

  return existingSet;
}

export async function deleteTopicQuestions(topicId: string): Promise<{ success: boolean; error?: string; count?: number }> {
  try {
    const result = await deleteQuestionsByTopic(topicId);
    return { success: true, count: result.count };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteAllQuestionData(options: { keepSubjects?: boolean } = {}): Promise<{ 
  success: boolean; 
  error?: string; 
  deletedQuestions?: number;
  deletedTopics?: number;
  deletedSubjects?: number;
}> {
  try {
    const [allQuestions, allTopics] = await Promise.all([
      fetchQuestions(),
      fetchTopics(),
    ]);

    let deletedQuestionsCount = 0;
    for (const topic of allTopics) {
      const result = await deleteQuestionsByTopic(topic.id);
      deletedQuestionsCount += result.count;
    }

    let deletedTopicsCount = 0;
    for (const topic of allTopics) {
      await deleteTopic(topic.id);
      deletedTopicsCount++;
    }

    return { 
      success: true, 
      deletedQuestions: deletedQuestionsCount,
      deletedTopics: deletedTopicsCount,
      deletedSubjects: 0,
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteTopicById(topicId: string): Promise<{ 
  success: boolean; 
  error?: string; 
  deletedQuestions?: number;
}> {
  try {
    const result = await deleteQuestionsByTopic(topicId);
    await deleteTopic(topicId);

    return { 
      success: true, 
      deletedQuestions: result.count,
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export const BLUEPRINT_TOPICS: Record<string, string[]> = {
  'Math': [
    'Integers', 'Rational Numbers', 'Fractions', 'Decimals',
    'Exponents and Powers', 'Ratio and Proportion', 'Unitary Methods',
    'Percentages', 'Profit and Loss', 'Simple Interest',
    'Algebraic Expressions', 'Linear Equations', 'Set Concepts',
    'Lines and Angles', 'Triangles', 'Pythagoras Theorem', 'Congruence',
    'Symmetry', 'Perimeter and Area', 'Mensuration', 'Quadrilaterals',
    'Circles', 'Constructions', 'Data Handling', 'Probability',
  ],
  'Physics': [
    'Motion', 'Force', 'Gravitation', 'Work and Energy', 'Sound',
    'Light', 'Electricity', 'Magnetism', 'Heat',
  ],
  'Chemistry': [
    'Matter', 'Atoms and Molecules', 'Chemical Reactions', 'Acids and Bases',
    'Metals and Non-metals', 'Carbon Compounds', 'Periodic Table',
  ],
};

const TOPIC_NAME_MAP: Record<string, string> = {
  'integers': 'Integers',
  'rationalnumbers': 'Rational Numbers',
  'rational numbers': 'Rational Numbers',
  'fractions': 'Fractions',
  'decimals': 'Decimals',
  'decimal fractions': 'Decimals',
  'exponentsandpowers': 'Exponents and Powers',
  'exponents and powers': 'Exponents and Powers',
  'exponents': 'Exponents and Powers',
  'ratioandprop': 'Ratio and Proportion',
  'ratio and prop': 'Ratio and Proportion',
  'ratio and proportion': 'Ratio and Proportion',
  'unitarymethods': 'Unitary Methods',
  'unitary methods': 'Unitary Methods',
  'unitary method': 'Unitary Methods',
  'percentages': 'Percentages',
  'percent and percentage': 'Percentages',
  'profitandloss': 'Profit and Loss',
  'profit and loss': 'Profit and Loss',
  'profit loss and discount': 'Profit and Loss',
  'simpleinterest': 'Simple Interest',
  'simple interest': 'Simple Interest',
  'algebraicexpressions': 'Algebraic Expressions',
  'algebraic expressions': 'Algebraic Expressions',
  'algebraic_expressions': 'Algebraic Expressions',
  'fundamental concepts': 'Algebraic Expressions',
  'probability': 'Probability',
  'linearequations': 'Linear Equations',
  'linear equations': 'Linear Equations',
  'simple linear equations': 'Linear Equations',
  'setconcepts': 'Set Concepts',
  'set concepts': 'Set Concepts',
  'sets': 'Set Concepts',
  'linesandangles': 'Lines and Angles',
  'lines and angles': 'Lines and Angles',
  'triangles': 'Triangles',
  'pythagorastheorem': 'Pythagoras Theorem',
  'pythagoras theorem': 'Pythagoras Theorem',
  'symmetry': 'Symmetry',
  'perimeter and area': 'Perimeter and Area',
  'perimeterandarea': 'Perimeter and Area',
  'congruence': 'Congruence',
  'congruent triangles': 'Congruence',
  'datahandling': 'Data Handling',
  'data handling': 'Data Handling',
  'mensuration': 'Mensuration',
  'quadrilaterals': 'Quadrilaterals',
  'circles': 'Circles',
  'constructions': 'Constructions',
};

export function parseTopicFromName(rawName: string): { topic: string; level: number | null } {
  let name = rawName.trim();
  let extractedLevel: number | null = null;
  
  name = name.replace(/\.(csv|tsv|txt|xlsx|xls)$/i, '');
  
  const levelPatterns = [
    /\s*level\s*[-_]?\s*(\d+)\s*$/i,
    /\s*l(\d+)\s*$/i,
    /\s*lvl\s*[-_]?\s*(\d+)\s*$/i,
    /\s*[-_]\s*(\d+)\s*$/,
  ];
  
  for (const pattern of levelPatterns) {
    const match = name.match(pattern);
    if (match) {
      extractedLevel = parseInt(match[1], 10);
      name = name.replace(pattern, '').trim();
      break;
    }
  }
  
  name = name.replace(/^(ch(apter)?[\d]+[a-z]?[-_\s]*)/i, '');
  name = name.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  
  const normalized = normalizeTopicName(name);
  
  return { topic: normalized, level: extractedLevel };
}

export function findBlueprintMatch(inputTopic: string, subject: string): string | null {
  const blueprintTopics = BLUEPRINT_TOPICS[subject] || BLUEPRINT_TOPICS['Math'];
  const normalizedInput = inputTopic.toLowerCase().replace(/\s+/g, '');
  
  for (const topic of blueprintTopics) {
    if (topic.toLowerCase() === inputTopic.toLowerCase()) {
      return topic;
    }
  }
  
  for (const topic of blueprintTopics) {
    const normalizedTopic = topic.toLowerCase().replace(/\s+/g, '');
    if (normalizedTopic === normalizedInput) {
      return topic;
    }
  }
  
  for (const topic of blueprintTopics) {
    const normalizedTopic = topic.toLowerCase().replace(/\s+/g, '');
    if (normalizedInput.includes(normalizedTopic) || normalizedTopic.includes(normalizedInput)) {
      return topic;
    }
  }
  
  return null;
}

export function normalizeTopicName(rawName: string): string {
  let name = rawName.trim();
  
  name = name.replace(/^(ch(apter)?[\d]+[a-z]?[-_\s]*)/i, '');
  name = name.replace(/[-_\s]*(master|final|backup|copy|v\d+|version\d*|draft|new|old|updated|edited|revised)[-_\s]*/gi, ' ');
  name = name.replace(/[_-]+/g, ' ');
  name = name.replace(/\s+/g, ' ').trim();
  
  const lowerName = name.toLowerCase();
  const noSpaceName = lowerName.replace(/\s+/g, '');
  
  if (TOPIC_NAME_MAP[lowerName]) {
    return TOPIC_NAME_MAP[lowerName];
  }
  if (TOPIC_NAME_MAP[noSpaceName]) {
    return TOPIC_NAME_MAP[noSpaceName];
  }
  
  name = name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/(interest|numbers|expressions|equations|handling|methods|concepts|theorem|angles|triangles|proportion|powers)/gi, ' $1')
    .replace(/\s+/g, ' ')
    .trim();
  
  name = name
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => {
      const lowerWord = word.toLowerCase();
      if (['and', 'or', 'of', 'the', 'in', 'on', 'at', 'to', 'for'].includes(lowerWord)) {
        return lowerWord;
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
  
  if (name.length > 0) {
    name = name.charAt(0).toUpperCase() + name.slice(1);
  }
  
  const processedLower = name.toLowerCase();
  if (TOPIC_NAME_MAP[processedLower]) {
    return TOPIC_NAME_MAP[processedLower];
  }
  
  return name;
}

export async function findMatchingTopic(
  subjectId: string, 
  rawTopicName: string
): Promise<{ id: string; name: string } | null> {
  const normalizedInput = normalizeTopicName(rawTopicName).toLowerCase();
  
  const topics = await fetchTopics();
  const subjectTopics = topics.filter(t => t.subjectId === subjectId);
  
  for (const topic of subjectTopics) {
    const normalizedExisting = normalizeTopicName(topic.name).toLowerCase();
    if (normalizedExisting === normalizedInput) {
      return topic;
    }
  }
  
  return null;
}

function sanitizeDbError(error: { message?: string } | null): string {
  if (!error?.message) return 'Database operation failed';
  const msg = error.message.toLowerCase();
  if (msg.includes('duplicate') || msg.includes('unique')) return 'Item already exists';
  if (msg.includes('foreign key')) return 'Invalid reference - related item not found';
  if (msg.includes('not-null') || msg.includes('null value')) return 'Missing required field';
  if (msg.includes('violates check')) return 'Invalid data format';
  if (msg.includes('permission denied') || msg.includes('rls')) return 'Permission denied';
  return 'Database operation failed';
}

export async function uploadQuestionsFromCSV(
  subjectName: string,
  topicName: string,
  questions: Array<{
    level: number;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    explanation: string;
    hint?: string;
  }>,
  options: { replaceExisting?: boolean } = {}
): Promise<{ success: boolean; error?: string; count?: number; skipped?: number; normalizedTopicName?: string; blueprintMatch?: boolean }> {
  try {
    const { topic: parsedTopic, level: filenameLevel } = parseTopicFromName(topicName);
    
    const blueprintMatch = findBlueprintMatch(parsedTopic, subjectName);
    const normalizedTopicName = blueprintMatch || normalizeTopicName(parsedTopic);
    
    const subjects = await fetchSubjects();
    let subject = subjects.find(s => s.name === subjectName);

    if (!subject) {
      subject = await createSubject({ name: subjectName });
    }

    let topic = await findMatchingTopic(subject.id, topicName);
    
    if (!topic) {
      topic = await createTopic({ subjectId: subject.id, name: normalizedTopicName });
    }

    if (options.replaceExisting) {
      await deleteQuestionsByTopic(topic.id);
    }

    const existingQuestions = await checkDuplicateQuestions(topic.id, questions);
    
    const questionsToInsert = questions
      .filter(q => !existingQuestions.has(q.question.trim().toLowerCase()))
      .map(q => ({
        topicId: topic.id,
        level: filenameLevel !== null ? filenameLevel : q.level,
        question: q.question.trim(),
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer.toUpperCase(),
        explanation: q.explanation || '',
        hint: q.hint || undefined,
      }));

    const skipped = questions.length - questionsToInsert.length;

    if (questionsToInsert.length > 0) {
      await createQuestions(questionsToInsert);
    }

    return { 
      success: true, 
      count: questionsToInsert.length,
      skipped,
      normalizedTopicName,
      blueprintMatch: !!blueprintMatch,
    };
  } catch (error) {
    console.error('Error uploading questions:', error);
    return { success: false, error: sanitizeDbError(error as { message?: string }) };
  }
}

export async function parseCSVContent(
  content: string,
  delimiter: string = ','
): Promise<Array<{
  level: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  hint?: string;
}>> {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());
  
  const colMap = {
    level: headers.findIndex(h => h.includes('level') || h === 'difficulty'),
    question: headers.findIndex(h => h.includes('question') || h === 'q'),
    optionA: headers.findIndex(h => h === 'a' || h === 'option_a' || h === 'optiona'),
    optionB: headers.findIndex(h => h === 'b' || h === 'option_b' || h === 'optionb'),
    optionC: headers.findIndex(h => h === 'c' || h === 'option_c' || h === 'optionc'),
    optionD: headers.findIndex(h => h === 'd' || h === 'option_d' || h === 'optiond'),
    correctAnswer: headers.findIndex(h => h.includes('correct') || h.includes('answer') || h === 'key'),
    explanation: headers.findIndex(h => h.includes('explanation') || h.includes('explain')),
    hint: headers.findIndex(h => h.includes('hint')),
  };
  
  const questions = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map(v => v.trim());
    
    const question = colMap.question >= 0 ? values[colMap.question] : '';
    if (!question) continue;
    
    questions.push({
      level: colMap.level >= 0 ? parseInt(values[colMap.level]) || 1 : 1,
      question,
      optionA: colMap.optionA >= 0 ? values[colMap.optionA] || '' : '',
      optionB: colMap.optionB >= 0 ? values[colMap.optionB] || '' : '',
      optionC: colMap.optionC >= 0 ? values[colMap.optionC] || '' : '',
      optionD: colMap.optionD >= 0 ? values[colMap.optionD] || '' : '',
      correctAnswer: colMap.correctAnswer >= 0 ? values[colMap.correctAnswer] || 'A' : 'A',
      explanation: colMap.explanation >= 0 ? values[colMap.explanation] || '' : '',
      hint: colMap.hint >= 0 ? values[colMap.hint] : undefined,
    });
  }
  
  return questions;
}

export async function parseExcelContent(
  data: ArrayBuffer
): Promise<Array<{
  level: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string;
  hint?: string;
}>> {
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(firstSheet);
  
  const questions = rows.map(row => {
    const findCol = (patterns: string[]): string => {
      for (const pattern of patterns) {
        const key = Object.keys(row).find(k => k.toLowerCase().includes(pattern.toLowerCase()));
        if (key) return String(row[key] || '');
      }
      return '';
    };
    
    return {
      level: parseInt(String(findCol(['level', 'difficulty']))) || 1,
      question: findCol(['question', 'q']),
      optionA: findCol(['option_a', 'optiona', 'a']) || String(row['A'] || row['a'] || ''),
      optionB: findCol(['option_b', 'optionb', 'b']) || String(row['B'] || row['b'] || ''),
      optionC: findCol(['option_c', 'optionc', 'c']) || String(row['C'] || row['c'] || ''),
      optionD: findCol(['option_d', 'optiond', 'd']) || String(row['D'] || row['d'] || ''),
      correctAnswer: findCol(['correct', 'answer', 'key']) || 'A',
      explanation: findCol(['explanation', 'explain']),
      hint: findCol(['hint']) || undefined,
    };
  }).filter(q => q.question);
  
  return questions;
}

export async function getQuestionSummary(): Promise<{
  subjects: Array<{ name: string; topics: Array<{ name: string; id: string; count: number }> }>;
  totalQuestions: number;
}> {
  return fetchQuestionSummary();
}
