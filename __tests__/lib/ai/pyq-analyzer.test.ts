import { analyzePYQWeightage } from '@/lib/ai/pyq-analyzer';

// Mock the Gemini API so we don't make real network calls in tests
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => {
      return {
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: jest.fn().mockResolvedValue({
            response: {
              text: () => JSON.stringify([
                { text: 'q1', topics: ['Trees', 'Graphs'], difficulty: 'Medium' },
                { text: 'q2', topics: ['Trees', 'Sorting'], difficulty: 'Easy' },
                { text: 'q3', topics: ['Graphs'], difficulty: 'Hard' },
                { text: 'q4', topics: ['Trees', 'Graphs'], difficulty: 'Hard' }
              ])
            }
          })
        })
      };
    })
  };
});

describe('PYQ Analyzer', () => {
  it('requires an API key to function', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = ''; // Simulate missing key
    
    await expect(analyzePYQWeightage([{ text: 'test' }])).rejects.toThrow('GEMINI_API_KEY is missing');
    
    process.env.GEMINI_API_KEY = originalKey; // Restore
  });

  it('performs frequency analysis and importance ranking correctly', async () => {
    // We already mocked the Gemini API response to return topics: Trees, Graphs, Sorting.
    // Trees appear 3 times. Graphs appear 3 times. Sorting appears 1 time.
    process.env.GEMINI_API_KEY = 'mock_key';
    const result = await analyzePYQWeightage([{ text: 'dummy' }]);

    expect(result.frequency['trees']).toBe(3);
    expect(result.frequency['graphs']).toBe(3);
    expect(result.frequency['sorting']).toBe(1);

    expect(result.importanceRanking).toHaveLength(3);
    
    // Sort logic places the highest score first. Since Trees and Graphs both have 3, they will be top 2.
    expect(result.importanceRanking[0].score).toBe(3);
    expect(result.importanceRanking[2].topic).toBe('sorting');
    expect(result.importanceRanking[2].score).toBe(1);
  });
});
