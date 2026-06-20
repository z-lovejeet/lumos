import { calculateSubjectPercentage, calculateEvaluatedPercentage } from '../percentage';

describe('Percentage Calculations', () => {
  const components = [
    { name: 'Midterm', weight: 30, maxMarks: 100 },
    { name: 'Final', weight: 50, maxMarks: 100 },
    { name: 'Assignment', weight: 20, maxMarks: 50 }
  ];

  describe('calculateSubjectPercentage', () => {
    it('returns 0 if components array is empty', () => {
      expect(calculateSubjectPercentage([{ componentName: 'Midterm', obtainedMarks: 80, maxMarks: 100 }], [])).toBe(0);
    });

    it('calculates exact percentage for full marks', () => {
      const marks = [
        { componentName: 'Midterm', obtainedMarks: 100, maxMarks: 100 },
        { componentName: 'Final', obtainedMarks: 100, maxMarks: 100 },
        { componentName: 'Assignment', obtainedMarks: 50, maxMarks: 50 }
      ];
      expect(calculateSubjectPercentage(marks, components)).toBe(100);
    });

    it('calculates percentage accurately with mixed marks', () => {
      const marks = [
        { componentName: 'Midterm', obtainedMarks: 80, maxMarks: 100 }, // 80% of 30 = 24
        { componentName: 'Final', obtainedMarks: 70, maxMarks: 100 }, // 70% of 50 = 35
        { componentName: 'Assignment', obtainedMarks: 40, maxMarks: 50 } // 80% of 20 = 16
      ];
      // Total = 24 + 35 + 16 = 75
      expect(calculateSubjectPercentage(marks, components)).toBe(75);
    });

    it('treats missing/null marks as 0 contribution', () => {
      const marks = [
        { componentName: 'Midterm', obtainedMarks: 80, maxMarks: 100 }, // 24
        { componentName: 'Final', obtainedMarks: null, maxMarks: 100 }, // 0
      ];
      // Total = 24
      expect(calculateSubjectPercentage(marks, components)).toBe(24);
    });

    it('caps total percentage at 100', () => {
      const marks = [
        { componentName: 'Midterm', obtainedMarks: 120, maxMarks: 100 }, // 120%
        { componentName: 'Final', obtainedMarks: 120, maxMarks: 100 }, // 120%
        { componentName: 'Assignment', obtainedMarks: 60, maxMarks: 50 } // 120%
      ];
      expect(calculateSubjectPercentage(marks, components)).toBe(100);
    });
  });

  describe('calculateEvaluatedPercentage', () => {
    it('calculates current standing accurately based only on evaluated components', () => {
      const marks = [
        { componentName: 'Midterm', obtainedMarks: 80, maxMarks: 100 }, // 24/30
        { componentName: 'Final', obtainedMarks: null, maxMarks: 100 }, // Not evaluated
        { componentName: 'Assignment', obtainedMarks: 40, maxMarks: 50 } // 16/20
      ];
      // Total weight evaluated = 50. Total earned = 40. Current standing = 40/50 * 100 = 80
      expect(calculateEvaluatedPercentage(marks, components)).toBe(80);
    });
  });
});
