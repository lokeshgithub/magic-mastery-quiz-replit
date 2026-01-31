const API_BASE = '';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, data: unknown) => 
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  patch: <T>(endpoint: string, data: unknown) => 
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) => 
    request<T>(endpoint, { method: 'DELETE' }),
};

export interface DBSubject {
  id: string;
  name: string;
  icon: string | null;
  createdAt: string;
}

export interface DBTopic {
  id: string;
  name: string;
  subjectId: string;
  createdAt: string;
}

export interface DBQuestion {
  id: string;
  topicId: string;
  level: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation: string | null;
  hint: string | null;
  createdAt: string;
}

export interface DBProfile {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  totalStars: number;
  topicsMastered: number;
  questionsAnswered: number;
  currentStreak: number;
  longestStreak: number;
  grade: number;
  createdAt: string;
  updatedAt: string;
}

export interface DBAdaptiveResult {
  id: string;
  userId: string | null;
  sessionId: string | null;
  subject: string;
  topics: string[];
  totalQuestions: number;
  correctAnswers: number;
  skillScore: string;
  skillTier: string;
  highestLevelReached: number;
  averageTimePerQuestion: string;
  durationSeconds: number;
  topicPerformance: unknown[];
  questionResults: unknown[];
  createdAt: string;
}

export interface DBPracticeSchedule {
  id: string;
  userId: string;
  topicName: string;
  subject: string;
  nextPracticeDate: string;
  intervalDays: number;
  easeFactor: string;
  reviewCount: number;
  lastPracticed: string | null;
  lastPerformance: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ValidateAnswerResponse {
  isCorrect: boolean;
  correctIndex: number;
  explanation: string;
}

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  avatarUrl: string | null;
  skillScore: number;
  skillTier: string;
  highestLevel: number;
  accuracy: number;
  challengesCompleted: number;
  bestResultDate: string;
}

export async function fetchSubjects(): Promise<DBSubject[]> {
  return api.get('/api/subjects');
}

export async function fetchTopics(): Promise<DBTopic[]> {
  return api.get('/api/topics');
}

export async function fetchQuestions(): Promise<DBQuestion[]> {
  return api.get('/api/questions');
}

export async function validateAnswer(questionId: string, selectedAnswer: number): Promise<ValidateAnswerResponse> {
  return api.post('/api/validate-answer', { questionId, selectedAnswer });
}

export async function fetchLeaderboard(subject?: string, limit = 50): Promise<LeaderboardEntry[]> {
  const params = new URLSearchParams();
  if (subject) params.append('subject', subject);
  params.append('limit', limit.toString());
  return api.get(`/api/leaderboard?${params}`);
}

export async function fetchProfile(userId: string): Promise<DBProfile | null> {
  try {
    return await api.get(`/api/profiles/${userId}`);
  } catch (e) {
    return null;
  }
}

export async function createProfile(data: {
  userId: string;
  displayName: string;
  grade?: number;
}): Promise<DBProfile> {
  return api.post('/api/profiles', data);
}

export async function updateProfile(userId: string, data: Partial<DBProfile>): Promise<DBProfile> {
  return api.patch(`/api/profiles/${userId}`, data);
}

export async function hasRole(userId: string, role: 'admin' | 'user'): Promise<boolean> {
  const response = await api.get<{ hasRole: boolean }>(`/api/has-role/${userId}/${role}`);
  return response.hasRole;
}

export async function createAdaptiveResult(data: unknown): Promise<{ id: string }> {
  return api.post('/api/adaptive-results', data);
}

export async function fetchAdaptiveResults(userId: string): Promise<DBAdaptiveResult[]> {
  return api.get(`/api/adaptive-results/${userId}`);
}

export async function fetchPracticeSchedules(userId: string): Promise<DBPracticeSchedule[]> {
  return api.get(`/api/practice-schedules/${userId}`);
}

export async function upsertPracticeSchedule(data: {
  userId: string;
  topicName: string;
  subject: string;
  nextPracticeDate?: string;
  intervalDays?: number;
  easeFactor?: string;
  reviewCount?: number;
  lastPracticed?: string;
  lastPerformance?: number;
}): Promise<DBPracticeSchedule> {
  return api.post('/api/practice-schedules', data);
}

export async function fetchSeenFunElements(userId: string): Promise<string[]> {
  return api.get(`/api/seen-fun-elements/${userId}`);
}

export async function markFunElementSeen(userId: string, elementId: string): Promise<void> {
  await api.post('/api/seen-fun-elements', { userId, elementId });
}

export async function createSubject(data: { name: string; icon?: string }): Promise<DBSubject> {
  return api.post('/api/subjects', data);
}

export async function createTopic(data: { subjectId: string; name: string }): Promise<DBTopic> {
  return api.post('/api/topics', data);
}

export async function deleteTopic(id: string): Promise<void> {
  await api.delete(`/api/topics/${id}`);
}

export async function createQuestions(data: Array<{
  topicId: string;
  level: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  explanation?: string;
  hint?: string;
}>): Promise<DBQuestion[]> {
  return api.post('/api/questions', data);
}

export async function deleteQuestionsByTopic(topicId: string): Promise<{ count: number }> {
  return api.delete(`/api/questions/topic/${topicId}`);
}

export async function generateSessionAnalysis(data: {
  subject: string;
  topicAnalyses: unknown[];
  strengths: string[];
  weaknesses: string[];
  slowTopics: string[];
  fastTopics: string[];
  overallAccuracy: number;
  totalQuestions: number;
  averageTimePerQuestion: number;
}): Promise<{ recommendations: string }> {
  return api.post('/api/generate-session-analysis', data);
}

export async function logUsage(data: {
  userId?: string;
  sessionId?: string;
  actionType: string;
  details?: unknown;
  estimatedCost?: string;
}): Promise<void> {
  await api.post('/api/usage-logs', data);
}

export async function fetchQuestionSummary(): Promise<{
  subjects: Array<{ name: string; topics: Array<{ name: string; id: string; count: number }> }>;
  totalQuestions: number;
}> {
  return api.get('/api/question-summary');
}
