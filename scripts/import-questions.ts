import { db } from "../server/db";
import { subjects, topics, questions } from "../shared/schema";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

interface TSVQuestion {
  id: string;
  level: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct: string;
  explanation: string;
  hints: string;
  concepts: string;
}

function parseTSV(content: string): TSVQuestion[] {
  const lines = content.trim().split('\n');
  const headers = lines[0].split('\t');
  
  const questions: TSVQuestion[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t');
    if (values.length < 8) continue;
    
    questions.push({
      id: values[0] || '',
      level: parseInt(values[1]) || 1,
      question: values[2] || '',
      optionA: values[3] || '',
      optionB: values[4] || '',
      optionC: values[5] || '',
      optionD: values[6] || '',
      correct: values[7] || 'A',
      explanation: values[8] || '',
      hints: values[9] || '',
      concepts: values[10] || '',
    });
  }
  
  return questions;
}

async function importQuestions(
  subjectName: string,
  topicName: string,
  tsvPath: string
) {
  console.log(`Importing questions for ${subjectName} > ${topicName}...`);
  
  const content = fs.readFileSync(tsvPath, 'utf-8');
  const parsedQuestions = parseTSV(content);
  
  console.log(`Parsed ${parsedQuestions.length} questions from TSV`);
  
  let [subject] = await db.select().from(subjects).where(eq(subjects.name, subjectName));
  if (!subject) {
    console.log(`Creating subject: ${subjectName}`);
    [subject] = await db.insert(subjects).values({ name: subjectName, icon: '📐' }).returning();
  }
  console.log(`Subject ID: ${subject.id}`);
  
  let [topic] = await db.select().from(topics).where(eq(topics.name, topicName));
  if (!topic) {
    console.log(`Creating topic: ${topicName}`);
    [topic] = await db.insert(topics).values({ 
      subjectId: subject.id, 
      name: topicName 
    }).returning();
  }
  console.log(`Topic ID: ${topic.id}`);
  
  let inserted = 0;
  let skipped = 0;
  
  for (const q of parsedQuestions) {
    try {
      await db.insert(questions).values({
        topicId: topic.id,
        level: q.level,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correct,
        explanation: q.explanation,
        hint: q.hints,
      });
      inserted++;
    } catch (error: any) {
      if (error.code === '23505') {
        skipped++;
      } else {
        console.error(`Error inserting question ${q.id}:`, error.message);
      }
    }
  }
  
  console.log(`Import complete: ${inserted} inserted, ${skipped} skipped`);
}

async function main() {
  const tsvFile = process.argv[2];
  const subjectName = process.argv[3] || 'Math';
  const topicName = process.argv[4] || 'Integers';
  
  if (!tsvFile) {
    console.log('Usage: npx tsx scripts/import-questions.ts <tsv-file> [subject] [topic]');
    console.log('Example: npx tsx scripts/import-questions.ts attached_assets/ch01_integers.tsv Math Integers');
    process.exit(1);
  }
  
  const fullPath = path.resolve(tsvFile);
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    process.exit(1);
  }
  
  await importQuestions(subjectName, topicName, fullPath);
  process.exit(0);
}

main().catch(console.error);
