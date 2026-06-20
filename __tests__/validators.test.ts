import { 
  semesterSchema, 
  subjectSchema, 
  markingSchemeSchema, 
  markUpdateSchema 
} from '../lib/validators';

describe('Zod Validation Schemas', () => {
  
  describe('markUpdateSchema', () => {
    it('should validate correctly when obtainedMarks <= maxMarks', () => {
      const result = markUpdateSchema.safeParse({
        componentName: 'CA',
        maxMarks: 25,
        obtainedMarks: 20,
      });
      expect(result.success).toBe(true);
    });

    it('should fail when obtainedMarks > maxMarks', () => {
      const result = markUpdateSchema.safeParse({
        componentName: 'CA',
        maxMarks: 25,
        obtainedMarks: 30,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Obtained marks cannot exceed max marks");
      }
    });

    it('should fail when obtainedMarks is negative', () => {
      const result = markUpdateSchema.safeParse({
        componentName: 'CA',
        maxMarks: 25,
        obtainedMarks: -5,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Obtained marks cannot be negative");
      }
    });

    it('should allow null obtainedMarks', () => {
      const result = markUpdateSchema.safeParse({
        componentName: 'CA',
        maxMarks: 25,
        obtainedMarks: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('semesterSchema', () => {
    it('should validate correctly with valid dates', () => {
      const result = semesterSchema.safeParse({
        name: 'Fall 2026',
        startDate: new Date('2026-08-01'),
        endDate: new Date('2026-12-15'),
      });
      expect(result.success).toBe(true);
    });

    it('should fail if name is missing', () => {
      const result = semesterSchema.safeParse({
        name: '',
        startDate: new Date('2026-08-01'),
        endDate: new Date('2026-12-15'),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('markingSchemeSchema', () => {
    it('should fail if total weight is not 100', () => {
      const result = markingSchemeSchema.safeParse({
        name: 'Invalid Scheme',
        components: [
          { id: '1', name: 'CA', weight: 50, maxMarks: 50 },
          { id: '2', name: 'MTE', weight: 40, maxMarks: 40 }
        ]
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Total weight must equal exactly 100%");
      }
    });

    it('should pass if total weight is exactly 100', () => {
      const result = markingSchemeSchema.safeParse({
        name: 'Valid Scheme',
        components: [
          { id: '1', name: 'CA', weight: 60, maxMarks: 60 },
          { id: '2', name: 'MTE', weight: 40, maxMarks: 40 }
        ]
      });
      expect(result.success).toBe(true);
    });
  });
});
