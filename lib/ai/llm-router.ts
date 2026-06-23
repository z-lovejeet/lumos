import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

export interface LLMResponse {
  content: string;
  provider: 'gemini' | 'groq' | 'error';
}

/**
 * Queries an LLM, attempting Gemini first, and failing over to Groq if it fails or is rate-limited.
 */
export async function queryLLM(systemPrompt: string, userMessage: string): Promise<LLMResponse> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
  const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

  // Try Gemini first
  try {
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: systemPrompt + '\n\nUser Query: ' + userMessage }] }
      ]
    });
    
    const response = result.response;
    return {
      content: response.text(),
      provider: 'gemini'
    };
  } catch (error) {
    console.warn('Gemini failed, falling back to Groq:', error);
    
    // Fallback to Groq
    try {
      if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not configured');
      
      const groq = new Groq({ apiKey: GROQ_API_KEY });
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.5,
        max_tokens: 512,
      });

      return {
        content: chatCompletion.choices[0]?.message?.content || 'No response generated.',
        provider: 'groq'
      };
    } catch (groqError) {
      console.error('Groq also failed:', groqError);
      return {
        content: "I'm currently unable to connect to my AI providers. Please try again later.",
        provider: 'error'
      };
    }
  }
}
