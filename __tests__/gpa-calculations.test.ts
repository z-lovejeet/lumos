import { calculateSGPA, GradeRange } from '../lib/calculations/sgpa';
import { calculateCGPA, calculateCGPAWithBacklogs, predictCGPA } from '../lib/calculations/cgpa';

describe('GPA Calculations', () => {
  const mockGradeScale: GradeRange[] = [
    { grade: 'O', minPercentage: 90, maxPercentage: 100, gpaValue: 10 },
    { grade: 'A+', minPercentage: 80, maxPercentage: 89.99, gpaValue: 9 },
    { grade: 'A', minPercentage: 70, maxPercentage: 79.99, gpaValue: 8 },
    { grade: 'B+', minPercentage: 60, maxPercentage: 69.99, gpaValue: 7 },
    { grade: 'B', minPercentage: 50, maxPercentage: 59.99, gpaValue: 6 },
    { grade: 'C', minPercentage: 40, maxPercentage: 49.99, gpaValue: 5 },
    { grade: 'F', minPercentage: 0, maxPercentage: 39.99, gpaValue: 0 }
  ];

  describe('SGPA Calculator', () => {
    it('should calculate correct SGPA from percentages', () => {
      const subjects = [
        { credits: 4, percentage: 85 }, // A+ -> 9
        { credits: 3, percentage: 92 }, // O -> 10
        { credits: 3, percentage: 75 }  // A -> 8
      ];
      
      const sgpa = calculateSGPA(subjects, mockGradeScale);
      
      // (4*9 + 3*10 + 3*8) / 10 = (36 + 30 + 24) / 10 = 90 / 10 = 9.0
      expect(sgpa).toBe(9.0);
    });

    it('should calculate correct SGPA from direct gpa values', () => {
      const subjects = [
        { credits: 4, gpaValue: 9 },
        { credits: 3, gpaValue: 10 },
        { credits: 3, gpaValue: 8 }
      ];
      
      const sgpa = calculateSGPA(subjects, mockGradeScale);
      expect(sgpa).toBe(9.0);
    });

    it('should return 0 when total credits is 0', () => {
      const sgpa = calculateSGPA([], mockGradeScale);
      expect(sgpa).toBe(0);
    });

    it('should calculate SGPA for a single subject correctly (Edge Case)', () => {
      const subjects = [
        { credits: 3, percentage: 95 } // O -> 10
      ];
      const sgpa = calculateSGPA(subjects, mockGradeScale);
      expect(sgpa).toBe(10.0);
    });
    
    it('should gracefully handle subjects with 0 credits (Edge Case)', () => {
      const subjects = [
        { credits: 0, percentage: 95 },
        { credits: 3, percentage: 95 }
      ];
      const sgpa = calculateSGPA(subjects, mockGradeScale);
      expect(sgpa).toBe(10.0);
    });
  });

  describe('CGPA Calculator', () => {
    it('should calculate correct CGPA', () => {
      const semesters = [
        { sgpa: 8.0, totalCredits: 20 },
        { sgpa: 9.0, totalCredits: 20 }
      ];
      
      // (160 + 180) / 40 = 340 / 40 = 8.5
      expect(calculateCGPA(semesters)).toBe(8.5);
    });

    it('should handle zero semesters', () => {
      expect(calculateCGPA([])).toBe(0);
    });
    
    it('should calculate predict CGPA correctly', () => {
      // current cgpa = 8.5, current credits = 40.
      // new sem: 20 credits, target 9.5
      // expected new total = 340 + 190 = 530 / 60 = 8.83
      expect(predictCGPA(8.5, 40, 9.5, 20)).toBeCloseTo(8.83, 2);
    });
    
    it('should calculate CGPA with backlogs', () => {
      const semesters = [
        { sgpa: 7.5, totalCredits: 8 }
      ];
      expect(calculateCGPAWithBacklogs(semesters)).toBe(7.5);
    });
  });
});
