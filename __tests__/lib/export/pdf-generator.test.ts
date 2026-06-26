import { TextEncoder, TextDecoder } from 'util';
Object.assign(global, { TextDecoder, TextEncoder });

describe('PDF Generator', () => {
  it('should generate a valid Buffer containing PDF data', () => {
    const { generatePDFReport } = require('../../../lib/export/pdf-generator');
    const mockSemesters = [
      {
        name: 'Fall 2023',
        number: 1,
        sgpa: 8.5,
        totalCredits: 20,
        subjects: [
          {
            code: 'CS101',
            name: 'Intro to CS',
            credits: 4,
            grade: 'A+'
          }
        ]
      }
    ];

    const buffer = generatePDFReport('Test User', 8.5, mockSemesters);
    
    // Assert buffer is valid
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
    
    // PDF Magic Number (header signature %PDF)
    const pdfHeader = buffer.toString('utf-8', 0, 4);
    expect(pdfHeader).toBe('%PDF');
  });
});
