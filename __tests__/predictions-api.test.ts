import { POST as gradePrediction } from '../app/api/predictions/grade/route';
import { POST as sgpaPrediction } from '../app/api/predictions/sgpa/route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation((body, init) => {
      return {
        status: init?.status || 200,
        json: async () => body
      };
    })
  }
}));

const mockGradeScale = [
  { grade: 'A', minPercentage: 80, maxPercentage: 100, gpaValue: 4.0 },
  { grade: 'B', minPercentage: 60, maxPercentage: 79.99, gpaValue: 3.0 },
  { grade: 'C', minPercentage: 40, maxPercentage: 59.99, gpaValue: 2.0 },
  { grade: 'F', minPercentage: 0, maxPercentage: 39.99, gpaValue: 0.0 }
];

describe('Predictions API Endpoints', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/predictions/grade', () => {
    it('should return predicted grade correctly', async () => {
      const mockRequest = {
        json: async () => ({
          marks: [
            { componentName: 'Midterm', obtainedMarks: 80, maxMarks: 100 }
          ],
          components: [
            { name: 'Midterm', weight: 40, maxMarks: 100 },
            { name: 'Final', weight: 60, maxMarks: 100 }
          ],
          gradeScale: mockGradeScale
        })
      } as unknown as Request;

      const response = await gradePrediction(mockRequest);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json).toBeDefined();
      expect(json.predictedGrade).toBe('A');
      expect(json.bestPossibleGrade).toBe('A');
      expect(json.worstPossibleGrade).toBe('F');
    });

    it('should return 400 if required parameters are missing', async () => {
      const mockRequest = {
        json: async () => ({})
      } as unknown as Request;

      const response = await gradePrediction(mockRequest);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.error).toMatch(/Missing required parameters/);
    });
  });

  describe('POST /api/predictions/sgpa', () => {
    it('should calculate SGPA correctly', async () => {
      const mockRequest = {
        json: async () => ({
          subjects: [
            { credits: 3, percentage: 85 }, // A (4.0) -> 3 * 4.0 = 12
            { credits: 4, percentage: 65 }  // B (3.0) -> 4 * 3.0 = 12
          ],
          gradeScale: mockGradeScale
        })
      } as unknown as Request;

      const response = await sgpaPrediction(mockRequest);
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.sgpa).toBeCloseTo((12 + 12) / 7, 2);
    });

    it('should return 400 if required parameters are missing', async () => {
      const mockRequest = {
        json: async () => ({})
      } as unknown as Request;

      const response = await sgpaPrediction(mockRequest);
      expect(response.status).toBe(400);

      const json = await response.json();
      expect(json.error).toMatch(/Missing required parameters/);
    });
  });
});
