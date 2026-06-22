import { describe, it, expect } from 'vitest';
import { detectRisks, RiskDetectorData } from '../../../lib/alerts/risk-detector';

describe('risk-detector', () => {
  it('detects critical attendance risk', () => {
    const data: RiskDetectorData = {
      sgpaTrend: [9.0, 8.5],
      gradeScale: [
        { grade: 'O', minPercent: 90, point: 10 },
        { grade: 'F', minPercent: 0, point: 0 }
      ],
      subjects: [
        {
          id: 's1',
          name: 'Math',
          attendancePercent: 70, // Critical
          marks: [{ id: 'm1', subjectId: 's1', componentName: 'CA', maxMarks: 100, obtainedMarks: 95, examDate: null, createdAt: new Date() }],
          components: [{ name: 'CA', maxMarks: 100, weight: 100, isOptional: false }]
        }
      ]
    };

    const alerts = detectRisks(data);
    expect(alerts.length).toBe(1);
    expect(alerts[0].type).toBe('attendance');
    expect(alerts[0].severity).toBe('critical');
    expect(alerts[0].message).toContain('critically low');
  });

  it('detects academic risk', () => {
    const data: RiskDetectorData = {
      sgpaTrend: [9.0, 8.5],
      gradeScale: [
        { grade: 'O', minPercent: 90, point: 10 },
        { grade: 'F', minPercent: 0, point: 0 }
      ],
      subjects: [
        {
          id: 's1',
          name: 'Math',
          attendancePercent: 85,
          marks: [{ id: 'm1', subjectId: 's1', componentName: 'CA', maxMarks: 100, obtainedMarks: 10, examDate: null, createdAt: new Date() }],
          components: [{ name: 'CA', maxMarks: 100, weight: 100, isOptional: false }]
        }
      ]
    };

    const alerts = detectRisks(data);
    const academicAlerts = alerts.filter(a => a.type === 'academic');
    expect(academicAlerts.length).toBeGreaterThan(0);
  });
});
