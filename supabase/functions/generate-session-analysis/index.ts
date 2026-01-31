import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TopicAnalysis {
  topic: string;
  questionsAttempted: number;
  correctAnswers: number;
  accuracy: number;
  averageTimeSeconds: number;
  isStrength: boolean;
  isWeakness: boolean;
}

interface AnalysisRequest {
  subject: string;
  topicAnalyses: TopicAnalysis[];
  strengths: string[];
  weaknesses: string[];
  slowTopics: string[];
  fastTopics: string[];
  overallAccuracy: number;
  totalQuestions: number;
  averageTimePerQuestion: number;
  sessionId?: string;
  userId?: string;
}

// Log usage to database (fire-and-forget)
async function logUsage(
  supabaseUrl: string,
  supabaseKey: string,
  userId: string | null,
  sessionId: string | null,
  actionType: string,
  details: Record<string, unknown>,
  estimatedCost: number = 0
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.from('usage_logs').insert({
      user_id: userId,
      session_id: sessionId,
      action_type: actionType,
      details,
      estimated_cost: estimatedCost,
    } as any);
  } catch (error) {
    console.error('Failed to log usage:', error);
  }
}

// UUID validation
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isValidUUID(str: string): boolean {
  return UUID_REGEX.test(str);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const body: AnalysisRequest = await req.json();
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
      sessionId,
      userId,
    } = body;

    // Calculate efficiency metrics
    const BENCHMARK_TIME_EASY = 30; // seconds for easy questions
    const BENCHMARK_TIME_HARD = 60; // seconds for harder questions
    const avgBenchmark = 45; // average expected time
    
    const efficiencyScore = averageTimePerQuestion > 0 
      ? Math.min(100, Math.round((avgBenchmark / averageTimePerQuestion) * 100 * (overallAccuracy)))
      : 0;
    
    // Categorize topics by efficiency (accuracy + speed combined)
    const topicEfficiency = topicAnalyses.map(t => {
      const speedScore = t.averageTimeSeconds > 0 ? Math.min(1, avgBenchmark / t.averageTimeSeconds) : 0;
      const effScore = (t.accuracy * 0.7) + (speedScore * 0.3); // Weight accuracy more
      return {
        ...t,
        efficiencyScore: Math.round(effScore * 100),
        isEfficient: effScore >= 0.75,
        needsSpeedWork: t.accuracy >= 0.7 && t.averageTimeSeconds > 45,
        needsAccuracyWork: t.accuracy < 0.7,
      };
    });

    const efficientTopics = topicEfficiency.filter(t => t.isEfficient).map(t => t.topic);
    const needsSpeedTopics = topicEfficiency.filter(t => t.needsSpeedWork).map(t => t.topic);
    const needsAccuracyTopics = topicEfficiency.filter(t => t.needsAccuracyWork).map(t => t.topic);

    // Build a detailed prompt for the AI
    const prompt = `You are an expert educational coach helping a student understand their quiz performance with actionable insights. Analyze their performance data and provide SPECIFIC, POINTED recommendations.

**Subject**: ${subject}
**Total Questions Attempted**: ${totalQuestions}
**Overall Accuracy**: ${(overallAccuracy * 100).toFixed(1)}%
**Average Time Per Question**: ${averageTimePerQuestion.toFixed(1)} seconds
**Efficiency Score**: ${efficiencyScore}/100 (combines speed + accuracy)

**DETAILED TOPIC ANALYSIS**:
${topicEfficiency.map(t => `- ${t.topic}: 
  • Accuracy: ${t.correctAnswers}/${t.questionsAttempted} (${(t.accuracy * 100).toFixed(0)}%)
  • Avg Time: ${t.averageTimeSeconds.toFixed(1)}s/question
  • Efficiency: ${t.efficiencyScore}/100
  • Status: ${t.isEfficient ? '✅ Efficient' : t.needsSpeedWork ? '⏱️ Accurate but slow' : '📚 Needs practice'}`).join('\n')}

**EFFICIENCY BREAKDOWN**:
- Topics with good efficiency: ${efficientTopics.length > 0 ? efficientTopics.join(', ') : 'Keep practicing!'}
- Topics accurate but slow (need speed drills): ${needsSpeedTopics.length > 0 ? needsSpeedTopics.join(', ') : 'None - you\'re quick!'}
- Topics needing accuracy improvement: ${needsAccuracyTopics.length > 0 ? needsAccuracyTopics.join(', ') : 'Great accuracy overall!'}

**Strong Areas**: ${strengths.length > 0 ? strengths.join(', ') : 'Building foundations'}
**Weak Areas**: ${weaknesses.length > 0 ? weaknesses.join(', ') : 'No major weaknesses!'}

PROVIDE YOUR ANALYSIS IN THIS EXACT STRUCTURE:

## 🎯 Performance Overview
(2-3 sentences summarizing their overall performance, efficiency score interpretation)

## ⚡ Speed & Efficiency Analysis  
(Analyze their time management. For topics where they're accurate but slow, suggest speed improvement techniques like timed practice, formula memorization, or pattern recognition drills)

## 📚 Topics to Focus On
(For EACH weak topic, provide:
- What concept they likely struggle with
- One specific practice strategy
- A resource suggestion if applicable)

## 🚀 Action Plan
(3-4 bullet points with specific next steps they should take)

## 💪 Motivation
(Brief encouraging closing)

Be SPECIFIC - mention actual topic names, give concrete study tips, and reference their actual scores. Keep total response under 500 words.`;

    const startTime = Date.now();
    const validUserId = userId && isValidUUID(userId) ? userId : null;
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { 
            role: "system", 
            content: "You are a friendly and encouraging educational tutor who helps students understand their learning progress. Be specific, actionable, and positive." 
          },
          { role: "user", content: prompt }
        ],
        stream: false,
      }),
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      // Log failed AI request (fire-and-forget)
      logUsage(
        supabaseUrl,
        supabaseServiceKey,
        validUserId,
        sessionId || null,
        'ai_analysis_failed',
        {
          subject,
          total_questions: totalQuestions,
          error_status: response.status,
          response_time_ms: responseTime,
        },
        0
      );

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const recommendations = data.choices?.[0]?.message?.content || "Keep practicing! Every question you solve makes you stronger.";
    
    // Estimate tokens used (rough estimate: ~4 chars per token)
    const promptTokens = Math.ceil(prompt.length / 4);
    const responseTokens = Math.ceil(recommendations.length / 4);
    const totalTokens = promptTokens + responseTokens;
    
    // Estimated cost for AI usage (gemini-flash is very cost-effective)
    // Rough estimate: $0.00001 per token for flash models
    const estimatedCost = totalTokens * 0.00001;

    // Log successful AI usage (fire-and-forget)
    logUsage(
      supabaseUrl,
      supabaseServiceKey,
      validUserId,
      sessionId || null,
      'ai_session_analysis',
      {
        subject,
        total_questions: totalQuestions,
        overall_accuracy: overallAccuracy,
        topics_analyzed: topicAnalyses.length,
        prompt_tokens: promptTokens,
        response_tokens: responseTokens,
        total_tokens: totalTokens,
        response_time_ms: responseTime,
        model: 'google/gemini-3-flash-preview',
      },
      estimatedCost
    );

    console.log(`AI analysis completed: ${totalTokens} tokens, ${responseTime}ms, est cost: $${estimatedCost.toFixed(6)}`);

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating analysis:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate analysis",
        recommendations: "Great job on completing your practice session! Keep reviewing your weak areas and practicing regularly. You're making progress!" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});