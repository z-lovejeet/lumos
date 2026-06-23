import { queryLLM } from '@/lib/ai/llm-router';

// Mock the actual AI SDKs
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: jest.fn().mockRejectedValue(new Error('Gemini Simulated Failure'))
      })
    }))
  };
});

jest.mock('groq-sdk', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Groq Response' } }]
        })
      }
    }
  }));
});

describe('LLM Router Failover', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'mock';
    process.env.GROQ_API_KEY = 'mock';
  });

  it('should fallback to Groq when Gemini fails', async () => {
    const res = await queryLLM('System prompt', 'User query');
    expect(res.provider).toBe('groq');
    expect(res.content).toBe('Groq Response');
  });
});
