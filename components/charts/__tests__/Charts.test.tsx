import { render } from '@testing-library/react';
import { SGPATrendChart } from '../SGPATrendChart';
import { CGPAProgressionChart } from '../CGPAProgressionChart';
import { AttendanceHeatmap } from '../AttendanceHeatmap';

// Mock ResizeObserver for Recharts
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('Chart Components', () => {
  const dummySemesters = [
    { name: 'Semester 1', sgpa: 8.5 },
    { name: 'Semester 2', sgpa: 9.0 }
  ];

  const dummyCgpa = [
    { name: 'Semester 1', cgpa: 8.5 },
    { name: 'Semester 2', cgpa: 8.75 }
  ];

  const dummyAttendance: any = [
    { date: new Date('2023-01-01').toISOString(), status: 'attended', subjectName: 'Math' }
  ];

  it('SGPATrendChart renders without crashing', () => {
    const { container } = render(<SGPATrendChart data={dummySemesters} />);
    expect(container).toBeInTheDocument();
  });

  it('CGPAProgressionChart renders without crashing', () => {
    const { container } = render(<CGPAProgressionChart data={dummyCgpa} />);
    expect(container).toBeInTheDocument();
  });

  it('AttendanceHeatmap renders without crashing', () => {
    const { container } = render(<AttendanceHeatmap data={dummyAttendance} />);
    expect(container).toBeInTheDocument();
  });
});
