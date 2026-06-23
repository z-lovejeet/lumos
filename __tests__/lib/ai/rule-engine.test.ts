import { processWithRules, RuleEngineContext } from '@/lib/ai/rule-engine';

describe('Rule Engine', () => {
  const mockContext: RuleEngineContext = {
    currentSgpa: 8.0,
    sgpaTrend: [7.5, 8.0],
    strategyData: {
      gradeScale: [
        { grade: 'O', minPercentage: 90, maxPercentage: 100, gpaValue: 10 },
        { grade: 'A', minPercentage: 80, maxPercentage: 89, gpaValue: 9 }
      ],
      subjects: [
        {
          id: 's1',
          name: 'Data Structures',
          credits: 4,
          marks: [],
          components: [{ name: 'Final', maxMarks: 100, weight: 100, isOptional: false }]
        }
      ]
    }
  };

  it('matches "best subject" query', () => {
    const queries = [
      "best subject to improve",
      "what should i focus on",
      "how to increase my sgpa",
      "highest roi"
    ];
    queries.forEach(q => {
      const match = processWithRules(q, mockContext);
      expect(match.matched).toBe(true);
      expect(match.response).toContain('Data Structures');
    });
  });

  it('matches "my status" query', () => {
    const match = processWithRules("am i failing?", mockContext);
    expect(match.matched).toBe(true);
    expect(match.response).toContain('safe zone');
  });

  it('matches target sgpa queries', () => {
    const queries = [
      "can i get 8.5 sgpa",
      "what do i need for 9.0 sgpa?"
    ];
    queries.forEach(q => {
      const match = processWithRules(q, mockContext);
      expect(match.matched).toBe(true);
      expect(match.response).toContain('is feasible');
    });
  });

  it('rejects target sgpa > 10', () => {
    const match = processWithRules("can i get 10.5 sgpa?", mockContext);
    expect(match.matched).toBe(true);
    expect(match.response).toContain('cannot exceed 10.0');
  });

  it('matches current sgpa query', () => {
    const match = processWithRules("what is my current sgpa?", mockContext);
    expect(match.matched).toBe(true);
    expect(match.response).toContain('8.00');
  });

  it('matches specific attendance buffer query', () => {
    const match = processWithRules("can i miss data structures classes?", mockContext);
    expect(match.matched).toBe(true);
    expect(match.response).toContain('Data Structures');
  });

  it('returns unmatched for unknown queries', () => {
    const match = processWithRules("who is the president?", mockContext);
    expect(match.matched).toBe(false);
    expect(match.response).toBeNull();
  });
});
