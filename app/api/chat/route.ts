import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Simple in-memory rate limiting (100 requests per IP per day)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100;
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

// CORS headers for Chrome extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    // Rate limiting check
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: corsHeaders }
      );
    }

    const { message, originalTopic, immediateContext, depth = 0, usedTerms = [] } = await request.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let prompt;
    if (immediateContext && depth > 0) {
      // Build forbidden terms list (made up of previously explored terms)
      const forbiddenTerms = usedTerms.length > 0 
        ? `\nAvoid these already-explored terms: ${usedTerms.join(', ')}`
        : '';
      
      // Include original topic as anchor, immediate context as primary focus
      const topicAnchor = originalTopic 
        ? `\nRemember: this is all in the context of learning about "${originalTopic}". Stay relevant to that topic.`
        : '';
      
      prompt = `From this sentence: "${immediateContext}"

The user selected "${message}" and wants to understand it.

Requirements:
- 10 words maximum
- One sentence response - no semi colons, no new lines. Do not separate two sentences with a comma.
- Explain what "${message}" means in that specific sentence
- USE jargon when it is appropriate and precise terminology - give the user more terms to explore
- Keep it grounded in the practical context, not abstract${forbiddenTerms}${topicAnchor}`;
    } else {
      prompt = `Explain in 10 words or fewer: ${message}
No LaTeX, no math symbols.
MAXIMUM 10 WORDS.`;
    }
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error calling Gemini:', error);
    return NextResponse.json(
      { error: 'Failed to get response from Gemini' },
      { status: 500, headers: corsHeaders }
    );
  }
}
