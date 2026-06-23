
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
          credits: 2,
          marks: [
            { componentName: 'Midterm', obtainedMarks: 45, maxMarks: 50 }
          ],
          components: [
            { name: 'Midterm', maxMarks: 50, weight: 50 },
            { name: 'Final', maxMarks: 50, weight: 50 }
          ]
        },
        {
          id: 'sub2',
          name: 'Physics',
          credits: 4,
          marks: [
            { componentName: 'Midterm', obtainedMarks: 20, maxMarks: 50 }
          ],
          components: [
            { name: 'Midterm', maxMarks: 50, weight: 50 },
            { name: 'Final', maxMarks: 50, weight: 50 }
          ]
        }
      ]
    };

    const recommendations = generateStrategy(data);

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].subjectName).toBe('Physics'); // Physics has much higher ROI
    expect(recommendations[0].type).toBe('focus');
  });

  it('verifies ranking correctness with multiple subjects', () => {
    const data: StrategyEngineData = {
      gradeScale: [
        { grade: 'O', minPercentage: 90, maxPercentage: 100, gpaValue: 10 },
        { grade: 'A+', minPercentage: 80, maxPercentage: 89.99, gpaValue: 9 },
        { grade: 'A', minPercentage: 70, maxPercentage: 79.99, gpaValue: 8 },
        { grade: 'F', minPercentage: 0, maxPercentage: 69.99, gpaValue: 0 }
      ],
      subjects: [
        {
          id: 'sub1', name: 'Low Credit Math', credits: 2, 
          marks: [
            { componentName: 'Midterm', obtainedMarks: 20, maxMarks: 50 }
          ],
          components: [
            { name: 'Midterm', maxMarks: 50, weight: 50 },
            { name: 'Final', maxMarks: 50, weight: 50 }
          ]
        },
        {
          id: 'sub2', name: 'High Credit Physics', credits: 4, 
          marks: [
            { componentName: 'Midterm', obtainedMarks: 20, maxMarks: 50 }
          ],
          components: [
            { name: 'Midterm', maxMarks: 50, weight: 50 },
            { name: 'Final', maxMarks: 50, weight: 50 }
          ]
        }
      ]
    };
    
    // Both are at 0% and need 70% to hit 'A'
    // Low Credit ROI = (2 * 10) / 70 = 20 / 70 = 0.28
    // High Credit ROI = (4 * 10) / 70 = 40 / 70 = 0.57
    const recommendations = generateStrategy(data);
    
    expect(recommendations.length).toBe(2);
    expect(recommendations[0].subjectName).toBe('High Credit Physics'); // Should rank first
    expect(recommendations[1].subjectName).toBe('Low Credit Math'); // Should rank second
  });
});
