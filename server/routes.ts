import type { Express } from "express";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<void> {
  
  app.get("/api/subjects", async (req, res) => {
    try {
      const subjects = await storage.getSubjects();
      res.json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).json({ error: "Failed to fetch subjects" });
    }
  });

  app.get("/api/topics", async (req, res) => {
    try {
      const topics = await storage.getTopics();
      res.json(topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
      res.status(500).json({ error: "Failed to fetch topics" });
    }
  });

  app.get("/api/questions", async (req, res) => {
    try {
      const questions = await storage.getQuestions();
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  app.get("/api/questions/:id", async (req, res) => {
    try {
      const question = await storage.getQuestionById(req.params.id);
      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }
      res.json(question);
    } catch (error) {
      console.error("Error fetching question:", error);
      res.status(500).json({ error: "Failed to fetch question" });
    }
  });

  app.post("/api/validate-answer", async (req, res) => {
    try {
      const { questionId, selectedAnswer } = req.body;
      
      if (!questionId || selectedAnswer === undefined) {
        return res.status(400).json({ error: "Missing questionId or selectedAnswer" });
      }

      const question = await storage.getQuestionById(questionId);
      if (!question) {
        return res.status(404).json({ error: "Question not found" });
      }

      const correctIndex = question.correctAnswer.toUpperCase().charCodeAt(0) - 65;
      const isCorrect = selectedAnswer === correctIndex;

      await storage.createUsageLog({
        actionType: "answer_validation",
        details: { questionId, isCorrect },
        estimatedCost: "0.0001",
      });

      res.json({
        isCorrect,
        correctIndex,
        explanation: question.explanation || "",
      });
    } catch (error) {
      console.error("Error validating answer:", error);
      res.status(500).json({ error: "Failed to validate answer" });
    }
  });

  app.get("/api/question-summary", async (req, res) => {
    try {
      const summary = await storage.getQuestionSummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching question summary:", error);
      res.status(500).json({ error: "Failed to fetch question summary" });
    }
  });

  app.get("/api/leaderboard", async (req, res) => {
    try {
      const { subject, limit } = req.query;
      const leaderboard = await storage.getAdaptiveLeaderboard(
        subject as string | undefined,
        limit ? parseInt(limit as string) : 50
      );
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  app.post("/api/adaptive-results", async (req, res) => {
    try {
      const result = await storage.createAdaptiveResult(req.body);
      res.json(result);
    } catch (error) {
      console.error("Error creating adaptive result:", error);
      res.status(500).json({ error: "Failed to create adaptive result" });
    }
  });

  app.get("/api/adaptive-results/:userId", async (req, res) => {
    try {
      const results = await storage.getAdaptiveResultsByUserId(req.params.userId);
      res.json(results);
    } catch (error) {
      console.error("Error fetching adaptive results:", error);
      res.status(500).json({ error: "Failed to fetch adaptive results" });
    }
  });

  app.get("/api/profiles/:userId", async (req, res) => {
    try {
      const profile = await storage.getProfileByUserId(req.params.userId);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.post("/api/profiles", async (req, res) => {
    try {
      const profile = await storage.createProfile(req.body);
      res.json(profile);
    } catch (error) {
      console.error("Error creating profile:", error);
      res.status(500).json({ error: "Failed to create profile" });
    }
  });

  app.patch("/api/profiles/:userId", async (req, res) => {
    try {
      const profile = await storage.updateProfile(req.params.userId, req.body);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  app.get("/api/has-role/:userId/:role", async (req, res) => {
    try {
      const { userId, role } = req.params;
      if (role !== 'admin' && role !== 'user') {
        return res.status(400).json({ error: "Invalid role" });
      }
      const hasRole = await storage.hasRole(userId, role);
      res.json({ hasRole });
    } catch (error) {
      console.error("Error checking role:", error);
      res.status(500).json({ error: "Failed to check role" });
    }
  });

  app.post("/api/admin/setup", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      await storage.grantRole(userId, 'admin');
      res.json({ success: true, message: "Admin role granted" });
    } catch (error) {
      console.error("Error granting admin role:", error);
      res.status(500).json({ error: "Failed to grant admin role" });
    }
  });

  app.get("/api/quiz-battles/:roomCode", async (req, res) => {
    try {
      const battle = await storage.getQuizBattleByRoomCode(req.params.roomCode);
      if (!battle) {
        return res.status(404).json({ error: "Battle not found" });
      }
      res.json(battle);
    } catch (error) {
      console.error("Error fetching battle:", error);
      res.status(500).json({ error: "Failed to fetch battle" });
    }
  });

  app.post("/api/quiz-battles", async (req, res) => {
    try {
      const battle = await storage.createQuizBattle(req.body);
      res.json(battle);
    } catch (error) {
      console.error("Error creating battle:", error);
      res.status(500).json({ error: "Failed to create battle" });
    }
  });

  app.patch("/api/quiz-battles/:id", async (req, res) => {
    try {
      const battle = await storage.updateQuizBattle(req.params.id, req.body);
      if (!battle) {
        return res.status(404).json({ error: "Battle not found" });
      }
      res.json(battle);
    } catch (error) {
      console.error("Error updating battle:", error);
      res.status(500).json({ error: "Failed to update battle" });
    }
  });

  app.get("/api/practice-schedules/:userId", async (req, res) => {
    try {
      const schedules = await storage.getPracticeSchedulesByUserId(req.params.userId);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching practice schedules:", error);
      res.status(500).json({ error: "Failed to fetch practice schedules" });
    }
  });

  app.post("/api/practice-schedules", async (req, res) => {
    try {
      const schedule = await storage.upsertPracticeSchedule(req.body);
      res.json(schedule);
    } catch (error) {
      console.error("Error upserting practice schedule:", error);
      res.status(500).json({ error: "Failed to upsert practice schedule" });
    }
  });

  app.get("/api/seen-fun-elements/:userId", async (req, res) => {
    try {
      const elements = await storage.getSeenFunElements(req.params.userId);
      res.json(elements);
    } catch (error) {
      console.error("Error fetching seen fun elements:", error);
      res.status(500).json({ error: "Failed to fetch seen fun elements" });
    }
  });

  app.post("/api/seen-fun-elements", async (req, res) => {
    try {
      const { userId, elementId } = req.body;
      await storage.markFunElementSeen(userId, elementId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking fun element seen:", error);
      res.status(500).json({ error: "Failed to mark fun element seen" });
    }
  });

  app.post("/api/subjects", async (req, res) => {
    try {
      const subject = await storage.createSubject(req.body);
      res.json(subject);
    } catch (error) {
      console.error("Error creating subject:", error);
      res.status(500).json({ error: "Failed to create subject" });
    }
  });

  app.post("/api/topics", async (req, res) => {
    try {
      const topic = await storage.createTopic(req.body);
      res.json(topic);
    } catch (error) {
      console.error("Error creating topic:", error);
      res.status(500).json({ error: "Failed to create topic" });
    }
  });

  app.delete("/api/topics/:id", async (req, res) => {
    try {
      await storage.deleteTopic(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting topic:", error);
      res.status(500).json({ error: "Failed to delete topic" });
    }
  });

  app.post("/api/questions", async (req, res) => {
    try {
      if (Array.isArray(req.body)) {
        const questions = await storage.createQuestions(req.body);
        res.json(questions);
      } else {
        const question = await storage.createQuestion(req.body);
        res.json(question);
      }
    } catch (error) {
      console.error("Error creating question(s):", error);
      res.status(500).json({ error: "Failed to create question(s)" });
    }
  });

  app.delete("/api/questions/topic/:topicId", async (req, res) => {
    try {
      const count = await storage.deleteQuestionsByTopicId(req.params.topicId);
      res.json({ success: true, count });
    } catch (error) {
      console.error("Error deleting questions:", error);
      res.status(500).json({ error: "Failed to delete questions" });
    }
  });

  app.post("/api/usage-logs", async (req, res) => {
    try {
      await storage.createUsageLog(req.body);
      res.json({ success: true });
    } catch (error) {
      console.error("Error creating usage log:", error);
      res.status(500).json({ error: "Failed to create usage log" });
    }
  });

  app.get("/api/profiles-leaderboard", async (req, res) => {
    try {
      const profiles = await storage.getProfilesLeaderboard();
      res.json(profiles);
    } catch (error) {
      console.error("Error fetching profiles leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch profiles leaderboard" });
    }
  });

  app.post("/api/generate-session-analysis", async (req, res) => {
    try {
      const {
        subject,
        topicAnalyses,
        strengths,
        weaknesses,
        slowTopics,
        fastTopics,
        overallAccuracy,
        totalQuestions,
        averageTimePerQuestion,
      } = req.body;

      const BENCHMARK_TIME = 45;
      const efficiencyScore = averageTimePerQuestion > 0 
        ? Math.min(100, Math.round((BENCHMARK_TIME / averageTimePerQuestion) * 100 * overallAccuracy))
        : 0;

      let recommendations = `## Performance Overview\n`;
      recommendations += `You completed ${totalQuestions} questions in ${subject} with ${(overallAccuracy * 100).toFixed(1)}% accuracy.\n\n`;
      
      recommendations += `## Speed & Efficiency Analysis\n`;
      recommendations += `Your efficiency score is ${efficiencyScore}/100. `;
      if (averageTimePerQuestion < 30) {
        recommendations += `You're answering quickly - make sure you're reading questions carefully!\n\n`;
      } else if (averageTimePerQuestion > 60) {
        recommendations += `You're taking your time - this can help with accuracy, but practice can help speed up.\n\n`;
      } else {
        recommendations += `Good pacing on your answers.\n\n`;
      }

      recommendations += `## Topics to Focus On\n`;
      if (weaknesses.length > 0) {
        recommendations += `Focus on: ${weaknesses.join(', ')}\n\n`;
      } else {
        recommendations += `Great job! No major weaknesses identified.\n\n`;
      }

      recommendations += `## Action Plan\n`;
      recommendations += `- Review topics where you scored below 70%\n`;
      recommendations += `- Practice with timed quizzes to improve speed\n`;
      recommendations += `- Focus on understanding explanations for incorrect answers\n\n`;

      recommendations += `## Motivation\n`;
      recommendations += `Keep up the great work! Consistent practice is the key to mastery.`;

      await storage.createUsageLog({
        actionType: "session_analysis",
        details: { subject, totalQuestions, overallAccuracy },
        estimatedCost: "0",
      });

      res.json({ recommendations });
    } catch (error) {
      console.error("Error generating analysis:", error);
      res.status(500).json({ 
        error: "Failed to generate analysis",
        recommendations: "Keep practicing! Review your weak areas and you'll improve." 
      });
    }
  });

  // Friends endpoints (stubbed for migration)
  app.get("/api/friends/:userId", async (req, res) => {
    res.json({ friends: [], pending: [], sent: [] });
  });

  app.get("/api/users/search", async (req, res) => {
    res.json([]);
  });

  app.post("/api/friends/request", async (req, res) => {
    res.status(201).json({ message: "Friend request sent" });
  });

  app.patch("/api/friends/:friendshipId/respond", async (req, res) => {
    res.json({ success: true });
  });

  app.delete("/api/friends/:friendshipId", async (req, res) => {
    res.json({ success: true });
  });

  // Admin usage logs endpoint (stubbed)
  app.get("/api/admin/usage-logs", async (req, res) => {
    res.json([]);
  });
}
