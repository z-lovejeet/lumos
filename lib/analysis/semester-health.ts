import { SubjectForSGPA, calculateSGPA, GradeRange } from '../calculations/sgpa';
import { CalculationComponent, CalculationMark } from '../calculations/percentage';
import { predictGrade } from '../predictions/grade-predictor';

export type HealthStatus = 'Excellent' | 'Good' | 'Warning' | 'Critical';

export interface HealthAnalysis {
  status: HealthStatus;
  score: number; // 0 to 100 health score
  insights: string[];
  recommendations: string[];
  riskFactors: string[];
}

export interface SemesterData {
  subjects: {
    id: string;
    name: string;
    credits: number;
    marks: CalculationMark[];
    components: CalculationComponent[];
    attendance: { attended: number; total: number };
  }[];
  gradeScale: GradeRange[];
  targetSgpa?: number;
}

export function analyzeSemesterHealth(data: SemesterData): HealthAnalysis {
  let score = 100;
  const insights: string[] = [];
  const recommendations: string[] = [];
  const riskFactors: string[] = [];

  if (!data.subjects || data.subjects.length === 0) {
    return {
      status: 'Excellent',
      score: 100,
      insights: ['No active subjects to analyze.'],
      recommendations: ['Add subjects to get a health analysis.'],
      riskFactors: []
    };
  }

  // 1. Attendance Analysis
  let totalAttended = 0;
  let totalClasses = 0;
  let subjectsBelow75 = 0;

  data.subjects.forEach(sub => {
    totalAttended += sub.attendance.attended;
    totalClasses += sub.attendance.total;
    
    if (sub.attendance.total > 0) {
      const pct = (sub.attendance.attended / sub.attendance.total) * 100;
      if (pct < 75) {
        subjectsBelow75++;
        riskFactors.push(`Attendance in ${sub.name} is critically low (${pct.toFixed(0)}%).`);
      } else if (pct < 80) {
        recommendations.push(`Keep an eye on attendance for ${sub.name}.`);
      }
    }
  });

  const overallAttendance = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 100;
  
  if (overallAttendance < 75) {
    score -= 30;
    riskFactors.push('Overall attendance is below 75% minimum requirement.');
  } else if (overallAttendance < 85) {
    score -= 10;
    insights.push(`Overall attendance is okay at ${overallAttendance.toFixed(1)}%, but could be improved.`);
  } else {
    insights.push(`Great attendance record (${overallAttendance.toFixed(1)}%).`);
  }

  // 2. Academic Performance Analysis
  let failingSubjects = 0;
  let predictedSgpaSubjects: SubjectForSGPA[] = [];

  data.subjects.forEach(sub => {
    const prediction = predictGrade(sub.marks, sub.components, data.gradeScale);
    predictedSgpaSubjects.push({
      credits: sub.credits,
      percentage: prediction.predictedPercentage
    });

    if (prediction.predictedGrade === 'F' || prediction.worstPossibleGrade === 'F' && prediction.predictedPercentage < 50) {
      failingSubjects++;
      riskFactors.push(`High risk of failing ${sub.name}.`);
    } else if (prediction.bestPossiblePercentage < 60) {
      recommendations.push(`Maximum possible score for ${sub.name} is capped. Focus on minimizing losses.`);
    }
  });

  if (failingSubjects > 0) {
    score -= (failingSubjects * 15);
  }

  const predictedSgpa = calculateSGPA(predictedSgpaSubjects, data.gradeScale);
  
  if (data.targetSgpa) {
    if (predictedSgpa < data.targetSgpa) {
      score -= 10;
      recommendations.push(`Predicted SGPA (${predictedSgpa.toFixed(2)}) is below target (${data.targetSgpa}).`);
    } else {
      insights.push(`On track to hit or exceed target SGPA (${predictedSgpa.toFixed(2)} >= ${data.targetSgpa}).`);
    }
  }

  // Cap score bounds
  score = Math.max(0, Math.min(100, score));

  let status: HealthStatus = 'Excellent';
  if (score < 50 || riskFactors.length >= 2 || failingSubjects > 0) {
    status = 'Critical';
  } else if (score < 75 || subjectsBelow75 > 0) {
    status = 'Warning';
  } else if (score < 90) {
    status = 'Good';
  }

  if (status === 'Excellent' && riskFactors.length === 0) {
    recommendations.push('Keep up the great work! Maintain current study habits.');
  }

  return { status, score, insights, recommendations, riskFactors };
}
