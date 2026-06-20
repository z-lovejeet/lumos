import { calculateSubjectPercentage, calculateEvaluatedPercentage } from '../lib/calculations/percentage';
import { getGradeFromPercentage, getGPAValueFromPercentage } from '../lib/calculations/sgpa';

describe('Calculation Engine', () => {
  
  describe('percentage.ts', () => {
    const components = [
      { name: 'CA', weight: 25, maxMarks: 25 },
      { name: 'MTE', weight: 25, maxMarks: 25 },
      { name: 'ETE', weight: 50, maxMarks: 50 }
    ];

    it('should calculate 0% when no marks are entered', () => {
      const marks = [
        { componentName: 'CA', obtainedMarks: null, maxMarks: 25 },
        { componentName: 'MTE', obtainedMarks: null, maxMarks: 25 },
        { componentName: 'ETE', obtainedMarks: null, maxMarks: 50 }
      ];
      expect(calculateSubjectPercentage(marks, components)).toBe(0);
    });

    it('should calculate accurate percentage when partial marks are entered', () => {
      const marks = [
        { componentName: 'CA', obtainedMarks: 20, maxMarks: 25 }, // 20% weight contribution
        { componentName: 'MTE', obtainedMarks: null, maxMarks: 25 }, // 0% weight
        { componentName: 'ETE', obtainedMarks: null, maxMarks: 50 } // 0% weight
      ];
      expect(calculateSubjectPercentage(marks, components)).toBe(20);
    });

    it('should calculate accurately when all marks are entered', () => {
      const marks = [
        { componentName: 'CA', obtainedMarks: 20, maxMarks: 25 }, // 20%
        { componentName: 'MTE', obtainedMarks: 15, maxMarks: 25 }, // 15%
        { componentName: 'ETE', obtainedMarks: 40, maxMarks: 50 } // 40%
      ];
      expect(calculateSubjectPercentage(marks, components)).toBe(75);
    });

    it('should calculate evaluated percentage correctly', () => {
      const marks = [
        { componentName: 'CA', obtainedMarks: 20, maxMarks: 25 }, // 20/25 = 80% on this component
        { componentName: 'MTE', obtainedMarks: null, maxMarks: 25 },
        { componentName: 'ETE', obtainedMarks: null, maxMarks: 50 }
      ];
      // Only CA is evaluated. 20/25 = 80% current standing.
      expect(calculateEvaluatedPercentage(marks, components)).toBe(80);
    });
  });

  describe('sgpa.ts', () => {
    const scale = [
      { grade: 'O', minPercentage: 90, maxPercentage: 100, gpaValue: 10 },
      { grade: 'A+', minPercentage: 80, maxPercentage: 89.99, gpaValue: 9 },
      { grade: 'A', minPercentage: 70, maxPercentage: 79.99, gpaValue: 8 },
      { grade: 'F', minPercentage: 0, maxPercentage: 39.99, gpaValue: 0 }
    ];

    it('should map percentage to correct grade', () => {
      expect(getGradeFromPercentage(95, scale)).toBe('O');
      expect(getGradeFromPercentage(85, scale)).toBe('A+');
      expect(getGradeFromPercentage(75, scale)).toBe('A');
      expect(getGradeFromPercentage(20, scale)).toBe('F');
    });

    it('should handle edge cases nicely', () => {
      // 89.99 is A+, 90 is O
      expect(getGradeFromPercentage(90, scale)).toBe('O');
      expect(getGradeFromPercentage(89.99, scale)).toBe('A+');
    });

    it('should return GPA value correctly', () => {
      expect(getGPAValueFromPercentage(95, scale)).toBe(10);
      expect(getGPAValueFromPercentage(85, scale)).toBe(9);
    });
  });

});
