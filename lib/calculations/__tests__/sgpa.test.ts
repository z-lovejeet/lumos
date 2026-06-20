import { getGradeFromPercentage, getGPAValueFromPercentage, GradeRange } from '../sgpa';

describe('SGPA Calculations', () => {
  const gradeScaleRanges: GradeRange[] = [
    { grade: 'A', minPercentage: 90, maxPercentage: 100, gpaValue: 4.0 },
    { grade: 'B', minPercentage: 80, maxPercentage: 89.99, gpaValue: 3.0 },
    { grade: 'C', minPercentage: 70, maxPercentage: 79.99, gpaValue: 2.0 },
    { grade: 'D', minPercentage: 60, maxPercentage: 69.99, gpaValue: 1.0 },
    { grade: 'F', minPercentage: 0, maxPercentage: 59.99, gpaValue: 0.0 }
  ];

  describe('getGradeFromPercentage', () => {
    it('returns N/A if ranges array is empty', () => {
      expect(getGradeFromPercentage(85, [])).toBe('N/A');
    });

    it('matches grade strictly inside bounds', () => {
      expect(getGradeFromPercentage(95, gradeScaleRanges)).toBe('A');
      expect(getGradeFromPercentage(85, gradeScaleRanges)).toBe('B');
      expect(getGradeFromPercentage(75, gradeScaleRanges)).toBe('C');
      expect(getGradeFromPercentage(65, gradeScaleRanges)).toBe('D');
      expect(getGradeFromPercentage(30, gradeScaleRanges)).toBe('F');
    });

    it('handles exact boundary matches', () => {
      expect(getGradeFromPercentage(90, gradeScaleRanges)).toBe('A'); // exactly min
      expect(getGradeFromPercentage(100, gradeScaleRanges)).toBe('A'); // exactly max
      expect(getGradeFromPercentage(80, gradeScaleRanges)).toBe('B'); // exactly min
      expect(getGradeFromPercentage(89.99, gradeScaleRanges)).toBe('B'); // exactly max
    });

    it('returns lowest available grade if no bounds match', () => {
      // 110 doesn't match any bound, sorted array puts F at the end
      // wait, the sorting sorts by descending minPercentage. So F is at the end.
      expect(getGradeFromPercentage(110, gradeScaleRanges)).toBe('F');
    });
  });

  describe('getGPAValueFromPercentage', () => {
    it('matches exact GPA value for the given bounds', () => {
      expect(getGPAValueFromPercentage(95, gradeScaleRanges)).toBe(4.0);
      expect(getGPAValueFromPercentage(85, gradeScaleRanges)).toBe(3.0);
    });
  });
});
