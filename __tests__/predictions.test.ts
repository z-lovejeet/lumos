import { predictGrade, calculateRequiredMarks } from '../lib/predictions/grade-predictor';
import { GradeRange } from '../lib/calculations/sgpa';
import { CalculationComponent, CalculationMark } from '../lib/calculations/percentage';

describe('Grade Predictor', () => {
  const mockGradeScale: GradeRange[] = [
    { grade: 'O', minPercentage: 90, maxPercentage: 100, gpaValue: 10 },
    { grade: 'A+', minPercentage: 80, maxPercentage: 89.99, gpaValue: 9 },
    { grade: 'A', minPercentage: 70, maxPercentage: 79.99, gpaValue: 8 },
    { grade: 'B+', minPercentage: 60, maxPercentage: 69.99, gpaValue: 7 },
    { grade: 'B', minPercentage: 50, maxPercentage: 59.99, gpaValue: 6 },
    { grade: 'C', minPercentage: 40, maxPercentage: 49.99, gpaValue: 5 },
    { grade: 'F', minPercentage: 0, maxPercentage: 39.99, gpaValue: 0 }
  ];

  const components: CalculationComponent[] = [
    { name: 'Midterm', maxMarks: 50, weight: 40 },
    { name: 'Final', maxMarks: 100, weight: 60 }
  ];

  describe('predictGrade', () => {
    it('should predict correctly with partial marks', () => {
      const marks: CalculationMark[] = [
        { componentName: 'Midterm', obtainedMarks: 40, maxMarks: 50 }
      ];

      const prediction = predictGrade(marks, components, mockGradeScale);

      expect(prediction.predictedPercentage).toBe(80);
      expect(prediction.predictedGrade).toBe('A+');
      expect(prediction.bestPossiblePercentage).toBe(92);
      expect(prediction.bestPossibleGrade).toBe('O');
      expect(prediction.worstPossiblePercentage).toBe(32);
      expect(prediction.worstPossibleGrade).toBe('F');
    });

    it('should predict correctly with no marks entered (Edge Case)', () => {
      const marks: CalculationMark[] = [];
      const prediction = predictGrade(marks, components, mockGradeScale);

      expect(prediction.bestPossiblePercentage).toBe(100);
      expect(prediction.worstPossiblePercentage).toBe(0);
    });

    it('should predict correctly when all marks are entered (Edge Case)', () => {
      const marks: CalculationMark[] = [
        { componentName: 'Midterm', obtainedMarks: 50, maxMarks: 50 },
        { componentName: 'Final', obtainedMarks: 100, maxMarks: 100 }
      ];
      const prediction = predictGrade(marks, components, mockGradeScale);

      // Earned 100%. Therefore predicted, best, and worst should all be 100% / O grade.
      expect(prediction.predictedPercentage).toBe(100);
      expect(prediction.bestPossiblePercentage).toBe(100);
      expect(prediction.worstPossiblePercentage).toBe(100);
      expect(prediction.predictedGrade).toBe('O');
      expect(prediction.bestPossibleGrade).toBe('O');
      expect(prediction.worstPossibleGrade).toBe('O');
    });
  });

  describe('calculateRequiredMarks', () => {
    it('should calculate required marks correctly', () => {
      const marks: CalculationMark[] = [
        { componentName: 'Midterm', obtainedMarks: 40, maxMarks: 50 }
      ];
      const targetGrade = mockGradeScale.find(g => g.grade === 'A+')!;

      const req = calculateRequiredMarks(targetGrade.minPercentage, marks, components);
      
      expect(req.isFeasible).toBe(true);
      expect(req.requiredPercentage).toBe(80);
      expect(req.marksNeededInRemaining).toBeCloseTo(48);
    });

    it('should return isPossible false if target is unreachable', () => {
      const marks: CalculationMark[] = [
        { componentName: 'Midterm', obtainedMarks: 0, maxMarks: 50 }
      ];
      const targetGrade = mockGradeScale.find(g => g.grade === 'O')!;

      const req = calculateRequiredMarks(targetGrade.minPercentage, marks, components);
      
      expect(req.isFeasible).toBe(false);
    });

    it('should handle calculating required marks when all marks are already entered (Edge Case)', () => {
      const marks: CalculationMark[] = [
        { componentName: 'Midterm', obtainedMarks: 50, maxMarks: 50 },
        { componentName: 'Final', obtainedMarks: 100, maxMarks: 100 }
      ];
      const targetGrade = mockGradeScale.find(g => g.grade === 'O')!; // 90%

      const req = calculateRequiredMarks(targetGrade.minPercentage, marks, components);
      
      // They already have 100%. Marks needed in remaining should be <= 0.
      expect(req.isFeasible).toBe(true);
      expect(req.marksNeededInRemaining).toBeLessThanOrEqual(0);
    });
  });
});
