import { predictGrade } from '../predictions/grade-predictor';
import { GradeRange } from '../calculations/sgpa';
import { CalculationComponent, CalculationMark } from '../calculations/percentage';

export interface StudyPriority {
  subjectId: string;
  subjectName: string;
  priorityScore: number;
  rank: number;
  reasons: string[];
}

export interface StudyPriorityData {
  subjects: {
    id: string;
    name: string;
    credits: number;
    marks: CalculationMark[];
    components: CalculationComponent[];
    upcomingExamsCount: number; // exams within next 7-14 days
    attendancePercent: number;
  }[];
  gradeScale: GradeRange[];
}

export function calculateStudyPriorities(data: StudyPriorityData): StudyPriority[] {
  const priorities: StudyPriority[] = [];

  data.subjects.forEach(sub => {
    let score = 0;
    const reasons: string[] = [];

    // 1. Upcoming Exams (Huge priority)
    if (sub.upcomingExamsCount > 0) {
      score += sub.upcomingExamsCount * 50;
      reasons.push(`${sub.upcomingExamsCount} upcoming exam(s).`);
    }

    // 2. Low Grade Risk
    const prediction = predictGrade(sub.marks, sub.components, data.gradeScale);
    if (prediction.predictedGrade === 'F' || prediction.worstPossibleGrade === 'F') {
      score += 40;
      reasons.push(`High risk of failing or poor grade.`);
    }

    // 3. Credit Weightage
    score += sub.credits * 5;
    if (sub.credits >= 4) {
      reasons.push(`High credit subject (${sub.credits} credits).`);
    }

    // 4. Attendance
    if (sub.attendancePercent < 75) {
      score += 20;
      reasons.push(`Low attendance (${Math.round(sub.attendancePercent)}%).`);
    }

    priorities.push({
      subjectId: sub.id,
      subjectName: sub.name,
      priorityScore: score,
      rank: 0,
      reasons
    });
  });

  // Sort descending
  priorities.sort((a, b) => b.priorityScore - a.priorityScore);

  // Assign ranks
  priorities.forEach((p, i) => p.rank = i + 1);

  return priorities;
}
