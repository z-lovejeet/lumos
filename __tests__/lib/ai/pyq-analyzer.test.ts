import { analyzePYQWeightage } from '@/lib/ai/pyq-analyzer';

describe('PYQ Analyzer', () => {
  it('requires an API key to function', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = ''; // Simulate missing key
    
    await expect(analyzePYQWeightage([{ text: 'test' }])).rejects.toThrow('GEMINI_API_KEY is missing');
    
    process.env.GEMINI_API_KEY = originalKey; // Restore
  });
});
