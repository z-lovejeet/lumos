import { render } from '@testing-library/react';
import { SGPATrendChart } from '../SGPATrendChart';
import { CGPAProgressionChart } from '../CGPAProgressionChart';
import { SubjectAttendanceChart } from '../SubjectAttendanceChart';

// Mock ResizeObserver for Recharts
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('Chart Components', () => {
  const dummySemesters = [
    { semester: 'Sem 1', sgpa: 8.5 },
    { semester: 'Sem 2', sgpa: 9.0 }
  ];

  const dummyCgpa = [
    { semester: 'Sem 1', cgpa: 8.5 },
    { semester: 'Sem 2', cgpa: 8.75 }
  ];

  const dummyAttendance = [
    { subject: 'Math', percentage: 80, attended: 40, conducted: 50 }
  ];

  it('SGPATrendChart renders without crashing', () => {
    const { container } = render(<SGPATrendChart data={dummySemesters} />);
    expect(container).toBeInTheDocument();
  });

  it('CGPAProgressionChart renders without crashing', () => {
    const { container } = render(<CGPAProgressionChart data={dummyCgpa} />);
    expect(container).toBeInTheDocument();
  });

  it('SubjectAttendanceChart renders without crashing', () => {
    const { container } = render(<SubjectAttendanceChart data={dummyAttendance} />);
    expect(container).toBeInTheDocument();
  });
});
