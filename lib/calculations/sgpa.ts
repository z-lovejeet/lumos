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

export interface SubjectForSGPA {
  credits: number;
  percentage?: number; // Optional if gpaValue is directly provided
  gpaValue?: number;   // Override or direct GPA value
}

/**
 * Calculates the SGPA for a list of subjects.
 * Supports both pre-calculated percentages and direct GPA overrides.
 */
export function calculateSGPA(subjects: SubjectForSGPA[], gradeScaleRanges: GradeRange[]): number {
  let totalCredits = 0;
  let earnedPoints = 0;

  for (const subject of subjects) {
    if (subject.credits <= 0) continue;

    let gpa = subject.gpaValue;
    if (gpa === undefined && subject.percentage !== undefined) {
      gpa = getGPAValueFromPercentage(subject.percentage, gradeScaleRanges);
    }

    // Only include subjects that have enough data to calculate a GPA
    if (gpa !== undefined) {
      totalCredits += subject.credits;
      earnedPoints += gpa * subject.credits;
    }
  }

  if (totalCredits === 0) return 0;
  return Math.round((earnedPoints / totalCredits) * 100) / 100;
}
