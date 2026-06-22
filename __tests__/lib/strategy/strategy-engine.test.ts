import { describe, it, expect } from 'vitest';
import { generateStrategy, StrategyEngineData } from '../../../lib/strategy/strategy-engine';

describe('strategy-engine', () => {
  it('generates strategy prioritizing highest ROI subject', () => {
    const data: StrategyEngineData = {
      gradeScale: [
        { grade: 'O', minPercentage: 90, maxPercentage: 100, gpaValue: 10 },
        { grade: 'A+', minPercentage: 80, maxPercentage: 89.99, gpaValue: 9 },
        { grade: 'A', minPercentage: 70, maxPercentage: 79.99, gpaValue: 8 },
        { grade: 'B', minPercentage: 60, maxPercentage: 69.99, gpaValue: 7 }
      ],
      subjects: [
        {
          id: 'sub1',
          name: 'Math',
          credits: 4,
          marks: [],
          components: [{ name: 'Final', maxMarks: 100, weight: 100, isOptional: false }]
          // Predicts around 0% initially -> needs 60% for 'B' -> percentDelta = 60
          // ROI = 4*10 / 60 = 40/60 = 0.66
        },
        {
          id: 'sub2',
          name: 'Physics',
          credits: 4,
          marks: [{ id: 'm1', subjectId: 'sub2', componentName: 'CA', maxMarks: 100, obtainedMarks: 85, examDate: null, createdAt: new Date() }],
          components: [{ name: 'CA', maxMarks: 100, weight: 100, isOptional: false }]
          // Predicts 85% -> next is 'O' (90%) -> percentDelta = 5
          // ROI = 4*10 / 5 = 40/5 = 8.0 (Much higher ROI)
        }
      ]
    };

    const recommendations = generateStrategy(data);

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].subjectName).toBe('Math');
    expect(recommendations[0].type).toBe('focus');
  });
});
