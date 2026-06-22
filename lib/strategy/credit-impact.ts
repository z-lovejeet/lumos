import { SubjectForSGPA } from '../calculations/sgpa';

export interface CreditImpactResult {
  subjectId: string;
  maxImpactOnSGPA: number; // If grade drops from O to F, how much SGPA is lost
  singleGradeDropImpact: number; // If grade drops by 1 point (e.g., A to B), how much SGPA is lost
  isHighRisk: boolean;
}

/**
 * Analyzes how much mathematical impact each subject has on the overall SGPA based on its credits.
 */
export function analyzeCreditImpact(
  subjects: (SubjectForSGPA & { id: string })[],
  totalSemesterCredits: number
): CreditImpactResult[] {
  if (totalSemesterCredits <= 0 || subjects.length === 0) return [];

  // Sort subjects by credits descending so highest impact is first
  const sorted = [...subjects].sort((a, b) => b.credits - a.credits);

  return sorted.map(sub => {
    // If GPA drops by 1 point, total points drop by 1 * credits
    const singleGradeDropImpact = sub.credits / totalSemesterCredits;
    
    // Assuming max grade drop is 10 points (O to F) on a 10-point scale
    // We'll normalize to a standard 10-point scale for impact analysis
    const maxDrop = 10;
    const maxImpactOnSGPA = (sub.credits * maxDrop) / totalSemesterCredits;

    return {
      subjectId: sub.id,
      singleGradeDropImpact: Math.round(singleGradeDropImpact * 100) / 100,
      maxImpactOnSGPA: Math.round(maxImpactOnSGPA * 100) / 100,
      // Consider it high risk if a single grade drop ruins the SGPA by more than 0.15
      isHighRisk: singleGradeDropImpact >= 0.15
    };
  });
}
