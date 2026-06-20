import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MarksTable } from '../MarksTable';

// Mock fetch for debounced saveMarks
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
) as jest.Mock;

describe('MarksTable Component', () => {
  const mockSubject: any = {
    id: 'subject-1',
    marks: [
      { componentName: 'Midterm', obtainedMarks: 80, maxMarks: 100 }
    ],
    markingScheme: {
      components: [
        { name: 'Midterm', weight: 40, maxMarks: 100 },
        { name: 'Final', weight: 60, maxMarks: 100 }
      ]
    }
  };

  const mockGradeScaleRanges = [
    { grade: 'A', minPercentage: 80, maxPercentage: 100, gpaValue: 4.0 },
    { grade: 'B', minPercentage: 60, maxPercentage: 79.99, gpaValue: 3.0 },
    { grade: 'F', minPercentage: 0, maxPercentage: 59.99, gpaValue: 0.0 }
  ];

  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders Evaluation Components correctly based on scheme', () => {
    render(<MarksTable subject={mockSubject} gradeScaleRanges={mockGradeScaleRanges} />);
    
    // Check headers
    expect(screen.getByText('Evaluation Components')).toBeInTheDocument();
    
    // Check rows exist
    expect(screen.getByText('Midterm')).toBeInTheDocument();
    expect(screen.getByText('Final')).toBeInTheDocument();

    // The Midterm input should have value 80
    const inputs = screen.getAllByRole('spinbutton') as HTMLInputElement[];
    expect(inputs[0].value).toBe('80');
    // Final is empty initially
    expect(inputs[1].value).toBe('');
  });

  it('updates live percentage and grade when input changes', async () => {
    render(<MarksTable subject={mockSubject} gradeScaleRanges={mockGradeScaleRanges} />);
    
    // Initial calculate: Midterm = 80/100 * 40 = 32%. Predicted Grade = F (32 is in F range)
    expect(screen.getByText('32.0%')).toBeInTheDocument();
    expect(screen.getByText('F')).toBeInTheDocument();

    // User types "90" in Final
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[1], { target: { value: '90' } });

    // New calculate: 32 + (90/100 * 60) = 32 + 54 = 86%. Grade should be A.
    expect(screen.getByText('86.0%')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('displays saving states and debounces the fetch call', async () => {
    jest.useFakeTimers();
    render(<MarksTable subject={mockSubject} gradeScaleRanges={mockGradeScaleRanges} />);
    
    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[1], { target: { value: '50' } });

    expect(screen.getByText('Saving...')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    // Because fetch is a promise, we need to wait for the microtask queue to clear
    await Promise.resolve();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    
    jest.useRealTimers();
  });

  it('caps marks at maxMarks', () => {
    render(<MarksTable subject={mockSubject} gradeScaleRanges={mockGradeScaleRanges} />);
    
    const inputs = screen.getAllByRole('spinbutton');
    // Final max marks is 100. We enter 150.
    fireEvent.change(inputs[1], { target: { value: '150' } });

    // It should cap at 100 inside state, rendering 100. Wait, input component might be uncontrolled if we aren't careful, but here it's controlled.
    // Wait, the state caps it but the input value doesn't automatically reflect if the change event just emitted 150.
    // Let's check state calculation. 100/100 * 60 = 60 + 32 = 92%
    expect(screen.getByText('92.0%')).toBeInTheDocument();
  });

  it('shows no marking scheme message if missing', () => {
    render(<MarksTable subject={{...mockSubject, markingScheme: null}} gradeScaleRanges={mockGradeScaleRanges} />);
    expect(screen.getByText('No marking scheme assigned to this subject.')).toBeInTheDocument();
  });
});
