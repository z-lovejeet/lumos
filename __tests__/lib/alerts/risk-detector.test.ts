
import { detectRisks, RiskDetectorData } from '../../../lib/alerts/risk-detector';

describe('risk-detector', () => {
  it('detects critical attendance risk', () => {
    const data: RiskDetectorData = {
      sgpaTrend: [9.0, 8.5],
      gradeScale: [
        { grade: 'O', minPercentage: 90, maxPercentage: 100, gpaValue: 10 },
        { grade: 'F', minPercentage: 0, maxPercentage: 39.99, gpaValue: 0 }
      ],
      subjects: [
        {
          id: 's1',
          name: 'Math',
          attendancePercent: 70, // Critical
          marks: [
            { componentName: 'Midterm', obtainedMarks: 45, maxMarks: 50 }
          ],
          components: [
            { name: 'Midterm', maxMarks: 50, weight: 50 },
            { name: 'Final', maxMarks: 50, weight: 50 }
          ]
        }
      ]
    };

    const alerts = detectRisks(data);
    expect(alerts.length).toBe(1);
    expect(alerts[0].type).toBe('attendance');
    expect(alerts[0].severity).toBe('critical');
    expect(alerts[0].message).toContain('critically low');
  });

  it('detects warning attendance risk (threshold test)', () => {
    const data: RiskDetectorData = {
      sgpaTrend: [9.0, 8.5],
      gradeScale: [],
      subjects: [
        {
          id: 's2',
          name: 'Science',
          attendancePercent: 78, // Warning threshold
          marks: [],
          components: []
        }
      ]
    };

    const alerts = detectRisks(data);
    expect(alerts.length).toBe(1);
    expect(alerts[0].type).toBe('attendance');
    expect(alerts[0].severity).toBe('warning');
    expect(alerts[0].message).toContain('is slipping');
  });

  it('detects academic risk', () => {
    const data: RiskDetectorData = {
      sgpaTrend: [9.0, 8.5],
      gradeScale: [
        { grade: 'O', minPercentage: 90, maxPercentage: 100, gpaValue: 10 },
        { grade: 'F', minPercentage: 0, maxPercentage: 39.99, gpaValue: 0 }
      ],
      subjects: [
        {
          id: 's1',
          name: 'Math',
          attendancePercent: 85,
          marks: [
            { componentName: 'Midterm', obtainedMarks: 15, maxMarks: 50 }
          ],
          components: [
            { name: 'Midterm', maxMarks: 50, weight: 50 },
            { name: 'Final', maxMarks: 50, weight: 50 }
          ]
        }
      ]
    };
    const alerts = detectRisks(data);
    const academicAlerts = alerts.filter(a => a.type === 'academic');
    expect(academicAlerts.length).toBeGreaterThan(0);
  });

  it('detects trend risk for consecutive declines', () => {
    const data: RiskDetectorData = {
      sgpaTrend: [7.5, 8.0, 8.5], // recent, previous, older -> Declining
      gradeScale: [],
      subjects: []
    };

    const alerts = detectRisks(data);
    const trendAlerts = alerts.filter(a => a.type === 'trend');
    expect(trendAlerts.length).toBe(1);
    expect(trendAlerts[0].severity).toBe('warning');
    expect(trendAlerts[0].message).toContain('declined for two consecutive semesters');
  });
});
