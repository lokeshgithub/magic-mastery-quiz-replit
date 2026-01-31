import { pgTable, text, integer, timestamp, uuid, numeric, jsonb, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { z } from "zod";

export const appRoleEnum = pgEnum('app_role', ['admin', 'user']);

export const subjects = pgTable("subjects", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  icon: text("icon"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const topics = pgTable("topics", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  subjectId: uuid("subject_id").notNull().references(() => subjects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("topics_subject_name_idx").on(table.subjectId, table.name),
]);

export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  topicId: uuid("topic_id").notNull().references(() => topics.id, { onDelete: "cascade" }),
  level: integer("level").notNull(),
  question: text("question").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  optionD: text("option_d").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  hint: text("hint"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  totalStars: integer("total_stars").notNull().default(0),
  topicsMastered: integer("topics_mastered").notNull().default(0),
  questionsAnswered: integer("questions_answered").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  grade: integer("grade").default(7),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  role: appRoleEnum("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex("user_roles_user_role_idx").on(table.userId, table.role),
]);

export const quizBattles = pgTable("quiz_battles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  roomCode: text("room_code").notNull().unique(),
  hostId: text("host_id").notNull(),
  guestId: text("guest_id"),
  subject: text("subject").notNull(),
  topic: text("topic").notNull(),
  status: text("status").notNull().default("waiting"),
  hostScore: integer("host_score").notNull().default(0),
  guestScore: integer("guest_score").notNull().default(0),
  currentQuestion: integer("current_question").notNull().default(0),
  totalQuestions: integer("total_questions").notNull().default(5),
  winner: text("winner"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
});

export const friendships = pgTable("friendships", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  requesterId: uuid("requester_id").notNull(),
  addresseeId: uuid("addressee_id").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("friendships_requester_addressee_idx").on(table.requesterId, table.addresseeId),
]);

export const friendChallenges = pgTable("friend_challenges", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  challengerId: uuid("challenger_id").notNull(),
  challengedId: uuid("challenged_id").notNull(),
  subject: text("subject").notNull(),
  topic: text("topic").notNull(),
  roomCode: text("room_code"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull().default(sql`now() + interval '1 hour'`),
});

export const adaptiveChallengeResults = pgTable("adaptive_challenge_results", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id"),
  sessionId: text("session_id"),
  subject: text("subject").notNull(),
  topics: text("topics").array().notNull(),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  skillScore: numeric("skill_score").notNull(),
  skillTier: text("skill_tier").notNull(),
  highestLevelReached: integer("highest_level_reached").notNull(),
  averageTimePerQuestion: numeric("average_time_per_question").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  topicPerformance: jsonb("topic_performance").notNull().default([]),
  questionResults: jsonb("question_results").notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const practiceSchedules = pgTable("practice_schedules", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  topicName: text("topic_name").notNull(),
  subject: text("subject").notNull(),
  nextPracticeDate: timestamp("next_practice_date", { withTimezone: true }).defaultNow().notNull(),
  intervalDays: integer("interval_days").notNull().default(1),
  easeFactor: numeric("ease_factor").notNull().default("2.5"),
  reviewCount: integer("review_count").notNull().default(0),
  lastPracticed: timestamp("last_practiced", { withTimezone: true }),
  lastPerformance: integer("last_performance"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("practice_schedules_user_topic_subject_idx").on(table.userId, table.topicName, table.subject),
]);

export const usageLogs = pgTable("usage_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id"),
  sessionId: text("session_id"),
  actionType: text("action_type").notNull(),
  details: jsonb("details").default({}),
  estimatedCost: numeric("estimated_cost", { precision: 10, scale: 6 }).default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const seenFunElements = pgTable("seen_fun_elements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  elementId: text("element_id").notNull(),
  seenAt: timestamp("seen_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex("seen_fun_elements_user_element_idx").on(table.userId, table.elementId),
]);

export const insertSubjectSchema = z.object({
  name: z.string(),
  icon: z.string().optional(),
});

export const insertTopicSchema = z.object({
  subjectId: z.string().uuid(),
  name: z.string(),
});

export const insertQuestionSchema = z.object({
  topicId: z.string().uuid(),
  level: z.number().int(),
  question: z.string(),
  optionA: z.string(),
  optionB: z.string(),
  optionC: z.string(),
  optionD: z.string(),
  correctAnswer: z.string(),
  explanation: z.string().optional(),
  hint: z.string().optional(),
});

export const insertProfileSchema = z.object({
  userId: z.string().uuid(),
  displayName: z.string(),
  avatarUrl: z.string().optional(),
  totalStars: z.number().int().optional(),
  topicsMastered: z.number().int().optional(),
  questionsAnswered: z.number().int().optional(),
  currentStreak: z.number().int().optional(),
  longestStreak: z.number().int().optional(),
  grade: z.number().int().optional(),
});

export const insertQuizBattleSchema = z.object({
  roomCode: z.string(),
  hostId: z.string(),
  guestId: z.string().optional(),
  subject: z.string(),
  topic: z.string(),
  status: z.string().optional(),
  hostScore: z.number().int().optional(),
  guestScore: z.number().int().optional(),
  currentQuestion: z.number().int().optional(),
  totalQuestions: z.number().int().optional(),
  winner: z.string().optional(),
});

export const insertAdaptiveResultSchema = z.object({
  userId: z.string().uuid().optional(),
  sessionId: z.string().optional(),
  subject: z.string(),
  topics: z.array(z.string()),
  totalQuestions: z.number().int(),
  correctAnswers: z.number().int(),
  skillScore: z.string(),
  skillTier: z.string(),
  highestLevelReached: z.number().int(),
  averageTimePerQuestion: z.string(),
  durationSeconds: z.number().int(),
  topicPerformance: z.any().optional(),
  questionResults: z.any().optional(),
});

export const insertPracticeScheduleSchema = z.object({
  userId: z.string().uuid(),
  topicName: z.string(),
  subject: z.string(),
  nextPracticeDate: z.date().optional(),
  intervalDays: z.number().int().optional(),
  easeFactor: z.string().optional(),
  reviewCount: z.number().int().optional(),
  lastPracticed: z.date().optional(),
  lastPerformance: z.number().int().optional(),
});

export const insertUsageLogSchema = z.object({
  userId: z.string().uuid().optional(),
  sessionId: z.string().optional(),
  actionType: z.string(),
  details: z.any().optional(),
  estimatedCost: z.string().optional(),
});

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Topic = typeof topics.$inferSelect;
export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type QuizBattle = typeof quizBattles.$inferSelect;
export type InsertQuizBattle = z.infer<typeof insertQuizBattleSchema>;
export type AdaptiveChallengeResult = typeof adaptiveChallengeResults.$inferSelect;
export type InsertAdaptiveChallengeResult = z.infer<typeof insertAdaptiveResultSchema>;
export type PracticeSchedule = typeof practiceSchedules.$inferSelect;
export type InsertPracticeSchedule = z.infer<typeof insertPracticeScheduleSchema>;
export type UsageLog = typeof usageLogs.$inferSelect;
export type InsertUsageLog = z.infer<typeof insertUsageLogSchema>;
