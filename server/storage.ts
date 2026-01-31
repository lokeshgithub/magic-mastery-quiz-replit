import { db } from "./db";
import { eq, and, desc, sql, ilike, or } from "drizzle-orm";
import {
  subjects, topics, questions, profiles, userRoles, quizBattles,
  friendships, friendChallenges, adaptiveChallengeResults,
  practiceSchedules, usageLogs, seenFunElements,
  type Subject, type Topic, type Question, type Profile,
  type QuizBattle, type AdaptiveChallengeResult, type PracticeSchedule,
  type InsertSubject, type InsertTopic, type InsertQuestion,
  type InsertProfile, type InsertQuizBattle, type InsertAdaptiveChallengeResult,
  type InsertPracticeSchedule, type InsertUsageLog
} from "../shared/schema";

export interface IStorage {
  getSubjects(): Promise<Subject[]>;
  getSubjectByName(name: string): Promise<Subject | undefined>;
  createSubject(data: InsertSubject): Promise<Subject>;
  
  getTopics(): Promise<Topic[]>;
  getTopicsBySubjectId(subjectId: string): Promise<Topic[]>;
  getTopicByNameAndSubject(name: string, subjectId: string): Promise<Topic | undefined>;
  createTopic(data: InsertTopic): Promise<Topic>;
  deleteTopic(id: string): Promise<void>;
  
  getQuestions(): Promise<Question[]>;
  getQuestionsByTopicId(topicId: string): Promise<Question[]>;
  getQuestionById(id: string): Promise<Question | undefined>;
  createQuestion(data: InsertQuestion): Promise<Question>;
  createQuestions(data: InsertQuestion[]): Promise<Question[]>;
  deleteQuestionsByTopicId(topicId: string): Promise<number>;
  deleteAllQuestions(): Promise<number>;
  
  getProfileByUserId(userId: string): Promise<Profile | undefined>;
  createProfile(data: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, data: Partial<Profile>): Promise<Profile | undefined>;
  
  hasRole(userId: string, role: 'admin' | 'user'): Promise<boolean>;
  grantRole(userId: string, role: 'admin' | 'user'): Promise<void>;
  
  getQuizBattleByRoomCode(roomCode: string): Promise<QuizBattle | undefined>;
  createQuizBattle(data: InsertQuizBattle): Promise<QuizBattle>;
  updateQuizBattle(id: string, data: Partial<QuizBattle>): Promise<QuizBattle | undefined>;
  
  getAdaptiveLeaderboard(subject?: string, limit?: number): Promise<any[]>;
  createAdaptiveResult(data: InsertAdaptiveChallengeResult): Promise<AdaptiveChallengeResult>;
  getAdaptiveResultsByUserId(userId: string): Promise<AdaptiveChallengeResult[]>;
  
  getPracticeSchedulesByUserId(userId: string): Promise<PracticeSchedule[]>;
  upsertPracticeSchedule(data: InsertPracticeSchedule): Promise<PracticeSchedule>;
  
  createUsageLog(data: InsertUsageLog): Promise<void>;
  
  getSeenFunElements(userId: string): Promise<string[]>;
  markFunElementSeen(userId: string, elementId: string): Promise<void>;
  
  getQuestionSummary(): Promise<{ subjectName: string; topicName: string; topicId: string; questionCount: number }[]>;
  getProfilesLeaderboard(): Promise<Profile[]>;
}

export class DatabaseStorage implements IStorage {
  async getSubjects(): Promise<Subject[]> {
    return db.select().from(subjects).orderBy(subjects.name);
  }

  async getSubjectByName(name: string): Promise<Subject | undefined> {
    const [subject] = await db.select().from(subjects).where(eq(subjects.name, name));
    return subject;
  }

  async createSubject(data: InsertSubject): Promise<Subject> {
    const [subject] = await db.insert(subjects).values(data).returning();
    return subject;
  }

  async getTopics(): Promise<Topic[]> {
    return db.select().from(topics).orderBy(topics.name);
  }

  async getTopicsBySubjectId(subjectId: string): Promise<Topic[]> {
    return db.select().from(topics).where(eq(topics.subjectId, subjectId));
  }

  async getTopicByNameAndSubject(name: string, subjectId: string): Promise<Topic | undefined> {
    const [topic] = await db.select().from(topics)
      .where(and(eq(topics.name, name), eq(topics.subjectId, subjectId)));
    return topic;
  }

  async createTopic(data: InsertTopic): Promise<Topic> {
    const [topic] = await db.insert(topics).values(data).returning();
    return topic;
  }

  async deleteTopic(id: string): Promise<void> {
    await db.delete(topics).where(eq(topics.id, id));
  }

  async getQuestions(): Promise<Question[]> {
    return db.select().from(questions);
  }

  async getQuestionsByTopicId(topicId: string): Promise<Question[]> {
    return db.select().from(questions).where(eq(questions.topicId, topicId));
  }

  async getQuestionById(id: string): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question;
  }

  async createQuestion(data: InsertQuestion): Promise<Question> {
    const [question] = await db.insert(questions).values(data).returning();
    return question;
  }

  async createQuestions(data: InsertQuestion[]): Promise<Question[]> {
    if (data.length === 0) return [];
    return db.insert(questions).values(data).returning();
  }

  async deleteQuestionsByTopicId(topicId: string): Promise<number> {
    const result = await db.delete(questions).where(eq(questions.topicId, topicId)).returning();
    return result.length;
  }

  async deleteAllQuestions(): Promise<number> {
    const result = await db.delete(questions).returning();
    return result.length;
  }

  async getProfileByUserId(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async createProfile(data: InsertProfile): Promise<Profile> {
    const [profile] = await db.insert(profiles).values(data).returning();
    return profile;
  }

  async updateProfile(userId: string, data: Partial<Profile>): Promise<Profile | undefined> {
    const [profile] = await db.update(profiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return profile;
  }

  async hasRole(userId: string, role: 'admin' | 'user'): Promise<boolean> {
    const [result] = await db.select().from(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.role, role)));
    return !!result;
  }

  async grantRole(userId: string, role: 'admin' | 'user'): Promise<void> {
    const exists = await this.hasRole(userId, role);
    if (!exists) {
      await db.insert(userRoles).values({ userId, role });
    }
  }

  async getQuizBattleByRoomCode(roomCode: string): Promise<QuizBattle | undefined> {
    const [battle] = await db.select().from(quizBattles).where(eq(quizBattles.roomCode, roomCode));
    return battle;
  }

  async createQuizBattle(data: InsertQuizBattle): Promise<QuizBattle> {
    const [battle] = await db.insert(quizBattles).values(data).returning();
    return battle;
  }

  async updateQuizBattle(id: string, data: Partial<QuizBattle>): Promise<QuizBattle | undefined> {
    const [battle] = await db.update(quizBattles)
      .set(data)
      .where(eq(quizBattles.id, id))
      .returning();
    return battle;
  }

  async getAdaptiveLeaderboard(subject?: string, limit: number = 50): Promise<any[]> {
    const query = sql`
      WITH ranked_results AS (
        SELECT 
          user_id,
          skill_score,
          skill_tier,
          highest_level_reached,
          ROUND((correct_answers::NUMERIC / NULLIF(total_questions, 0)) * 100, 1) as accuracy,
          created_at,
          ROW_NUMBER() OVER (
            PARTITION BY user_id, subject 
            ORDER BY skill_score DESC, created_at DESC
          ) as rn
        FROM adaptive_challenge_results
        WHERE user_id IS NOT NULL
          ${subject ? sql`AND subject = ${subject}` : sql``}
      ),
      best_scores AS (
        SELECT 
          user_id,
          skill_score,
          skill_tier,
          highest_level_reached,
          accuracy,
          created_at,
          COUNT(*) OVER (PARTITION BY user_id) as challenges_completed
        FROM ranked_results
        WHERE rn = 1
      )
      SELECT 
        ROW_NUMBER() OVER (ORDER BY bs.skill_score DESC, bs.created_at ASC)::BIGINT as rank,
        COALESCE(p.display_name, 'Anonymous') as display_name,
        p.avatar_url,
        bs.skill_score,
        bs.skill_tier,
        bs.highest_level_reached as highest_level,
        bs.accuracy,
        bs.challenges_completed,
        bs.created_at as best_result_date
      FROM best_scores bs
      LEFT JOIN profiles p ON p.user_id = bs.user_id
      ORDER BY bs.skill_score DESC, bs.created_at ASC
      LIMIT ${limit}
    `;
    
    const result = await db.execute(query);
    return result.rows;
  }

  async createAdaptiveResult(data: InsertAdaptiveChallengeResult): Promise<AdaptiveChallengeResult> {
    const [result] = await db.insert(adaptiveChallengeResults).values(data).returning();
    return result;
  }

  async getAdaptiveResultsByUserId(userId: string): Promise<AdaptiveChallengeResult[]> {
    return db.select().from(adaptiveChallengeResults)
      .where(eq(adaptiveChallengeResults.userId, userId))
      .orderBy(desc(adaptiveChallengeResults.createdAt));
  }

  async getPracticeSchedulesByUserId(userId: string): Promise<PracticeSchedule[]> {
    return db.select().from(practiceSchedules)
      .where(eq(practiceSchedules.userId, userId))
      .orderBy(practiceSchedules.nextPracticeDate);
  }

  async upsertPracticeSchedule(data: InsertPracticeSchedule): Promise<PracticeSchedule> {
    const [result] = await db.insert(practiceSchedules)
      .values(data)
      .onConflictDoUpdate({
        target: [practiceSchedules.userId, practiceSchedules.topicName, practiceSchedules.subject],
        set: {
          nextPracticeDate: data.nextPracticeDate,
          intervalDays: data.intervalDays,
          easeFactor: data.easeFactor,
          reviewCount: data.reviewCount,
          lastPracticed: data.lastPracticed,
          lastPerformance: data.lastPerformance,
          updatedAt: new Date(),
        }
      })
      .returning();
    return result;
  }

  async createUsageLog(data: InsertUsageLog): Promise<void> {
    await db.insert(usageLogs).values(data);
  }

  async getSeenFunElements(userId: string): Promise<string[]> {
    const elements = await db.select({ elementId: seenFunElements.elementId })
      .from(seenFunElements)
      .where(eq(seenFunElements.userId, userId));
    return elements.map(e => e.elementId);
  }

  async markFunElementSeen(userId: string, elementId: string): Promise<void> {
    await db.insert(seenFunElements)
      .values({ userId, elementId })
      .onConflictDoNothing();
  }

  async getQuestionSummary(): Promise<{ subjectName: string; topicName: string; topicId: string; questionCount: number }[]> {
    const result = await db.execute(sql`
      SELECT 
        s.name AS subject_name,
        t.name AS topic_name,
        t.id AS topic_id,
        COUNT(q.id)::INTEGER AS question_count
      FROM subjects s
      LEFT JOIN topics t ON t.subject_id = s.id
      LEFT JOIN questions q ON q.topic_id = t.id
      GROUP BY s.name, t.name, t.id
      ORDER BY s.name, t.name
    `);
    return result.rows.map((row: any) => ({
      subjectName: row.subject_name,
      topicName: row.topic_name,
      topicId: row.topic_id,
      questionCount: row.question_count || 0,
    }));
  }

  async getProfilesLeaderboard(): Promise<Profile[]> {
    return db.select().from(profiles)
      .orderBy(desc(profiles.totalStars), profiles.createdAt)
      .limit(50);
  }
}

export const storage = new DatabaseStorage();
