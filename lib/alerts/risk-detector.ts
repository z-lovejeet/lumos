import { predictGrade } from '../predictions/grade-predictor';
import { GradeRange } from '../calculations/sgpa';
import { CalculationComponent, CalculationMark } from '../calculations/percentage';

export interface RiskAlert {
  id: string;
  type: 'attendance' | 'academic' | 'trend';
  severity: 'warning' | 'critical';
  subjectId?: string;
  subjectName?: string;
  message: string;
}

export interface RiskDetectorData {
  subjects: {
    id: string;
    name: string;
    attendancePercent: number;
    marks: CalculationMark[];
    components: CalculationComponent[];
  }[];
  gradeScale: GradeRange[];
  sgpaTrend: number[]; // e.g. [8.5, 8.2, 7.8]
}

export function detectRisks(data: RiskDetectorData): RiskAlert[] {
  const alerts: RiskAlert[] = [];
  let alertIdCounter = 1;

  // 1. Attendance Risks
  data.subjects.forEach(sub => {
    if (sub.attendancePercent < 75) {
      alerts.push({
        id: `risk-${alertIdCounter++}`,
        type: 'attendance',
        severity: 'critical',
        subjectId: sub.id,
        subjectName: sub.name,
        message: `Attendance for ${sub.name} is critically low (${Math.round(sub.attendancePercent)}%). Minimum required is 75%.`
      });
    } else if (sub.attendancePercent < 80) {
      alerts.push({
        id: `risk-${alertIdCounter++}`,
        type: 'attendance',
        severity: 'warning',
        subjectId: sub.id,
        subjectName: sub.name,
        message: `Attendance for ${sub.name} is slipping (${Math.round(sub.attendancePercent)}%). Try not to miss the next classes.`
      });
    }

    // 2. Academic Risks
    const prediction = predictGrade(sub.marks, sub.components, data.gradeScale);
    if (prediction.predictedGrade === 'F') {
      alerts.push({
        id: `risk-${alertIdCounter++}`,
        type: 'academic',
        severity: 'critical',
        subjectId: sub.id,
        subjectName: sub.name,
        message: `You are currently predicted to fail ${sub.name}. Immediate intervention required.`
      });
    } else if (prediction.worstPossibleGrade === 'F' && prediction.bestPossiblePercentage < 60) {
      alerts.push({
        id: `risk-${alertIdCounter++}`,
        type: 'academic',
        severity: 'warning',
        subjectId: sub.id,
        subjectName: sub.name,
        message: `You are at risk of failing ${sub.name} if you do poorly on remaining exams.`
      });
    }
  });

  // 3. Trend Risks
  if (data.sgpaTrend.length >= 3) {
    const [recent, previous, older] = data.sgpaTrend; // assuming sorted desc (newest first)
    if (recent < previous && previous < older) {
      alerts.push({
        id: `risk-${alertIdCounter++}`,
        type: 'trend',
        severity: 'warning',
        message: `Your SGPA has declined for two consecutive semesters (${older} -> ${previous} -> ${recent}). Consider adjusting your study strategy.`
      });
    }
  }

  return alerts;
}
