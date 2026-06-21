export interface SemesterForCGPA {
  totalCredits: number;
  sgpa: number;
}

/**
 * Calculates the cumulative GPA (CGPA) across multiple semesters.
 */
export function calculateCGPA(semesters: SemesterForCGPA[]): number {
  let totalCredits = 0;
  let totalPoints = 0;

  for (const sem of semesters) {
    if (sem.totalCredits > 0) {
      totalCredits += sem.totalCredits;
      totalPoints += sem.sgpa * sem.totalCredits;
    }
  }

  if (totalCredits === 0) return 0;
  return Math.round((totalPoints / totalCredits) * 100) / 100;
}

/**
 * Predicts new CGPA based on current CGPA and a hypothetical new semester SGPA.
 */
export function predictCGPA(currentCgpa: number, currentCredits: number, newSgpa: number, newCredits: number): number {
  if (currentCredits + newCredits === 0) return 0;
  
  const currentPoints = currentCgpa * currentCredits;
  const newPoints = newSgpa * newCredits;
  
  const totalPoints = currentPoints + newPoints;
  const totalCredits = currentCredits + newCredits;
  
  return Math.round((totalPoints / totalCredits) * 100) / 100;
}

/**
 * Calculates CGPA factoring in backlog replacements (if implemented).
 * Currently falls back to standard CGPA.
 */
export function calculateCGPAWithBacklogs(semesters: SemesterForCGPA[]): number {
  return calculateCGPA(semesters);
}
