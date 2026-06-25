import { MSAbroadProfile, MSReadinessScore } from '@/types/career';

/**
 * Calculates a readiness score for MS Abroad applications based on various factors.
 * Weights:
 * - Academics (CGPA): 40%
 * - Test Scores (GRE/IELTS): 30%
 * - Experience (Research/Work): 30%
 */
export function analyzeMSReadiness(cgpa: number, profile: MSAbroadProfile): MSReadinessScore {
  const missingFactors: string[] = [];

  // 1. Academics Score (out of 100)
  // Assuming CGPA is out of 10. A 9.0+ is 100%. A 6.0 is 0%.
  let academicsScore = 0;
  if (cgpa >= 9.0) academicsScore = 100;
  else if (cgpa <= 6.0) academicsScore = 0;
  else academicsScore = ((cgpa - 6.0) / 3.0) * 100;

  // 2. Test Scores (out of 100)
  let testScoreCount = 0;
  let testScoreTotal = 0;

  if (profile.greScore) {
    // GRE out of 340. 330+ is 100%. 300 is 0%.
    const grePercent = Math.max(0, Math.min(100, ((profile.greScore - 300) / 30) * 100));
    testScoreTotal += grePercent;
    testScoreCount++;
  } else {
    missingFactors.push('GRE Score');
  }

  if (profile.toeflIeltsScore) {
    // IELTS out of 9.0. 8.0+ is 100%. 6.0 is 0%.
    const englishPercent = Math.max(0, Math.min(100, ((profile.toeflIeltsScore - 6.0) / 2.0) * 100));
    testScoreTotal += englishPercent;
    testScoreCount++;
  } else {
    missingFactors.push('TOEFL/IELTS Score');
  }

  const testScoresScore = testScoreCount > 0 ? testScoreTotal / testScoreCount : 0;

  // 3. Experience Score (out of 100)
  let experienceScore = 0;
  
  // Papers (each paper is 25%, max 50%)
  const papersPercent = Math.min(50, (profile.researchPapers || 0) * 25);
  if (!profile.researchPapers || profile.researchPapers === 0) {
    missingFactors.push('Research Papers');
  }

  // Work Exp (each month is 2%, max 50%)
  const workExpPercent = Math.min(50, (profile.workExperienceMonths || 0) * 2);
  if (!profile.workExperienceMonths || profile.workExperienceMonths === 0) {
    missingFactors.push('Work Experience/Internships');
  }

  experienceScore = papersPercent + workExpPercent;

  // Calculate Overall
  const overall = (academicsScore * 0.4) + (testScoresScore * 0.3) + (experienceScore * 0.3);

  return {
    academics: Math.round(academicsScore),
    testScores: Math.round(testScoresScore),
    experience: Math.round(experienceScore),
    overall: Math.round(overall),
    missingFactors
  };
}
