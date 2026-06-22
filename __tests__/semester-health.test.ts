import { analyzeSemesterHealth, SemesterData } from '../lib/analysis/semester-health';
import { GradeRange } from '../lib/calculations/sgpa';

describe('Semester Health Analysis', () => {
  const mockGradeScale: GradeRange[] = [
    { grade: 'A', minPercentage: 80, maxPercentage: 100, gpaValue: 4.0 },
    { grade: 'B', minPercentage: 60, maxPercentage: 79.99, gpaValue: 3.0 },
    { grade: 'C', minPercentage: 40, maxPercentage: 59.99, gpaValue: 2.0 },
    { grade: 'F', minPercentage: 0, maxPercentage: 39.99, gpaValue: 0.0 }
  ];

  const components = [
    { name: 'Midterm', weight: 40, maxMarks: 100 },
    { name: 'Final', weight: 60, maxMarks: 100 }
  ];

  it('should return Excellent for high attendance and good grades', () => {
    const data: SemesterData = {
      gradeScale: mockGradeScale,
      subjects: [
        {
          id: '1', name: 'Math', credits: 4, components,
          attendance: { attended: 20, total: 20 },
          marks: [{ componentName: 'Midterm', obtainedMarks: 90, maxMarks: 100 }]
        }
      ]
    };
    const health = analyzeSemesterHealth(data);
    expect(health.status).toBe('Excellent');
    expect(health.score).toBe(100);
  });

  it('should return Critical for failing grades', () => {
    const data: SemesterData = {
      gradeScale: mockGradeScale,
      subjects: [
        {
          id: '1', name: 'Math', credits: 4, components,
          attendance: { attended: 20, total: 20 },
          marks: [
            { componentName: 'Midterm', obtainedMarks: 10, maxMarks: 100 },
            { componentName: 'Final', obtainedMarks: 10, maxMarks: 100 }
          ]
        }
      ]
    };
    const health = analyzeSemesterHealth(data);
    expect(health.status).toBe('Critical');
  });

  it('should return Warning for poor attendance', () => {
    const data: SemesterData = {
      gradeScale: mockGradeScale,
      subjects: [
        {
          id: '1', name: 'Math', credits: 4, components,
          attendance: { attended: 10, total: 20 }, // 50%
          marks: [{ componentName: 'Midterm', obtainedMarks: 90, maxMarks: 100 }]
        }
      ]
    };
    const health = analyzeSemesterHealth(data);
    expect(['Warning', 'Critical']).toContain(health.status);
    expect(health.score).toBeLessThan(100);
  });
});
