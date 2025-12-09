import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
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
- USE technical jargon and precise terminology - give the user more terms to explore
- Keep it grounded in the practical context, not abstract${forbiddenTerms}${topicAnchor}`;
    } else {
      prompt = `Explain in 10 words or fewer: ${message}
Use technical jargon and precise terminology.
No LaTeX, no math symbols.
MAXIMUM 10 WORDS.`;
    }
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Error calling Gemini:', error);
    return NextResponse.json(
      { error: 'Failed to get response from Gemini' },
      { status: 500 }
    );
  }
}
