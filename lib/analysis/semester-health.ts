export type HealthStatus = 'Excellent' | 'Good' | 'Fair' | 'At Risk' | 'Critical';

export interface SemesterHealthAnalysis {
  status: HealthStatus;
  score: number; // 0-100
  diagnosis: string;
  recommendations: string[];
}

export interface HealthContext {
  sgpa: number;
  totalCredits: number;
  completedCredits: number;
  attendancePercent: number;
  subjectsCount: number;
  failedSubjectsCount: number;
}

export function analyzeSemesterHealth(context: HealthContext): SemesterHealthAnalysis {
  let score = 100;
  const recommendations: string[] = [];

  // SGPA logic
  if (context.sgpa < 4.0) {
    score -= 40;
    recommendations.push('Critically low SGPA. Seek academic counseling immediately.');
  } else if (context.sgpa < 6.0) {
    score -= 20;
    recommendations.push('SGPA is below average. Prioritize subjects with high credit weightage.');
  } else if (context.sgpa > 8.5) {
    recommendations.push('Excellent academic standing. Maintain current study habits.');
  }

  // Attendance logic
  if (context.attendancePercent < 75) {
    score -= 30;
    recommendations.push('Attendance is below the critical 75% threshold. Attend all upcoming classes.');
  } else if (context.attendancePercent < 80) {
    score -= 10;
    recommendations.push('Attendance is hovering near the danger zone. Build a safer buffer.');
  }

  // Failures
  if (context.failedSubjectsCount > 0) {
    score -= 30 * context.failedSubjectsCount;
    recommendations.push(`You are failing ${context.failedSubjectsCount} subject(s). Schedule immediate remedial study time.`);
  }

  // Bound score
  score = Math.max(0, Math.min(100, score));

  // Determine status and diagnosis
  let status: HealthStatus = 'Excellent';
  let diagnosis = '';

  if (score >= 90) {
    status = 'Excellent';
    diagnosis = 'Your semester is on a perfect track. All metrics are extremely healthy.';
  } else if (score >= 75) {
    status = 'Good';
    diagnosis = 'Solid performance, but there is minor room for optimization in attendance or specific subjects.';
  } else if (score >= 60) {
    status = 'Fair';
    diagnosis = 'You are passing, but standing on thin ice. You need to pull up your grades or attendance soon.';
  } else if (score >= 40) {
    status = 'At Risk';
    diagnosis = 'Warning: You are at high risk of severe academic penalties due to attendance or failing grades.';
  } else {
    status = 'Critical';
    diagnosis = 'CRITICAL: Immediate intervention required to prevent academic failure or detention.';
  }

  return { status, score, diagnosis, recommendations };
}
