import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidateRequest {
  questionId: string;
  selectedAnswer: number; // 0=A, 1=B, 2=C, 3=D
  sessionId?: string;
  userId?: string;
}

// Simple in-memory rate limiting (per-instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60; // Increased to 60 requests per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }
  
  record.count++;
  return false;
}

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(str: string): boolean {
  return UUID_REGEX.test(str);
}

// Initialize Supabase client once at module level for reuse
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Log usage to database - truly fire-and-forget, no await
function logUsage(
  userId: string | null,
  sessionId: string | null,
  actionType: string,
  details: Record<string, unknown>,
  estimatedCost: number = 0
): void {
  // Fire and forget - don't await, just let it run in background
  supabase.from('usage_logs').insert({
    user_id: userId,
    session_id: sessionId,
    action_type: actionType,
    details,
    estimated_cost: estimatedCost,
  // deno-lint-ignore no-explicit-any
  } as any);
}

Deno.serve(async (req) => {
  // Handle CORS preflight - respond immediately
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Get client IP for rate limiting
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
             req.headers.get('x-real-ip') || 
             'unknown';

  // Check rate limit
  if (isRateLimited(ip)) {
    console.warn(`Rate limit exceeded for IP: ${ip}`);
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please slow down.' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    let body: ValidateRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { questionId, selectedAnswer, sessionId, userId } = body;

    // Validate questionId is present and is a valid UUID
    if (!questionId || typeof questionId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid questionId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isValidUUID(questionId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid questionId format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate selectedAnswer is a number between 0-3
    if (selectedAnswer === undefined || selectedAnswer === null) {
      return new Response(
        JSON.stringify({ error: 'Missing selectedAnswer' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (typeof selectedAnswer !== 'number' || !Number.isInteger(selectedAnswer)) {
      return new Response(
        JSON.stringify({ error: 'selectedAnswer must be an integer' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (selectedAnswer < 0 || selectedAnswer > 3) {
      return new Response(
        JSON.stringify({ error: 'selectedAnswer must be 0, 1, 2, or 3' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.info(`Validating answer for question ${questionId}, selected: ${selectedAnswer}, IP: ${ip}`);

    // Fetch the question with correct answer (only service role can see this)
    const { data: question, error } = await supabase
      .from('questions')
      .select('correct_answer, explanation')
      .eq('id', questionId)
      .single();

    if (error || !question) {
      console.error('Error fetching question:', error);
      return new Response(
        JSON.stringify({ error: 'Question not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert A/B/C/D to 0/1/2/3
    const correctIndex = question.correct_answer.toUpperCase().charCodeAt(0) - 65;
    const isCorrect = selectedAnswer === correctIndex;

    console.info(`Question ${questionId}: isCorrect=${isCorrect}`);

    // Log usage - fire-and-forget (non-blocking)
    const validUserId = userId && isValidUUID(userId) ? userId : null;
    logUsage(
      validUserId,
      sessionId || null,
      'answer_validation',
      { question_id: questionId, is_correct: isCorrect },
      0.0001
    );

    // Return response immediately
    return new Response(
      JSON.stringify({
        isCorrect,
        correctIndex,
        explanation: question.explanation || '',
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
        } 
      }
    );
  } catch (error) {
    console.error('Error validating answer:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
