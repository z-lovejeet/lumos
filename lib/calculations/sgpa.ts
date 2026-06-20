export interface GradeRange {
  grade: string;
  minPercentage: number;
  maxPercentage: number;
  gpaValue: number;
}

/**
 * Derives the literal Grade from a percentage using the provided Grade Scale.
 */
export function getGradeFromPercentage(percentage: number, gradeScaleRanges: GradeRange[]): string {
  if (!gradeScaleRanges || gradeScaleRanges.length === 0) {
    return 'N/A';
  }

  // Sort ranges descending by minPercentage so we check the highest bounds first
  const sortedRanges = [...gradeScaleRanges].sort((a, b) => b.minPercentage - a.minPercentage);

  for (const range of sortedRanges) {
    // If it's exactly the max possible percentage, handle inclusive upper bound safely
    if (percentage >= range.minPercentage && percentage <= range.maxPercentage) {
      return range.grade;
    }
  }

  // If no range matches (e.g., percentage is incredibly low and scale doesn't cover 0), return lowest available
  return sortedRanges[sortedRanges.length - 1].grade;
}

/**
 * Derives the GPA value from a percentage using the provided Grade Scale.
 */
export function getGPAValueFromPercentage(percentage: number, gradeScaleRanges: GradeRange[]): number {
  if (!gradeScaleRanges || gradeScaleRanges.length === 0) {
    return 0;
  }

  const sortedRanges = [...gradeScaleRanges].sort((a, b) => b.minPercentage - a.minPercentage);

  for (const range of sortedRanges) {
    if (percentage >= range.minPercentage && percentage <= range.maxPercentage) {
      return range.gpaValue;
    }
  }

  return sortedRanges[sortedRanges.length - 1].gpaValue;
}
