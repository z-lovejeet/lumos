import * as XLSX from 'xlsx';
import { ExportSemester } from './pdf-generator';

export function generateExcelReport(
  userName: string,
  cgpa: number,
  semesters: ExportSemester[]
): Buffer {
  const wb = XLSX.utils.book_new();

  // Create Summary Sheet
  const summaryData = [
    ['AcademiQ Academic Report'],
    [''],
    ['Name', userName || 'Student'],
    ['Current CGPA', cgpa.toFixed(2)],
    ['Generated On', new Date().toLocaleDateString()],
    [''],
    ['Semester', 'Credits', 'SGPA']
  ];

  semesters.forEach(sem => {
    summaryData.push([sem.name, sem.totalCredits.toString(), sem.sgpa.toFixed(2)]);
  });

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // Create Subjects Sheet
  const subjectsData = [
    ['Semester', 'Course Code', 'Course Name', 'Credits', 'Grade']
  ];

  semesters.forEach(sem => {
    sem.subjects.forEach(sub => {
      subjectsData.push([
        sem.name,
        sub.code,
        sub.name,
        sub.credits.toString(),
        sub.grade
      ]);
    });
  });

  const wsSubjects = XLSX.utils.aoa_to_sheet(subjectsData);
  XLSX.utils.book_append_sheet(wb, wsSubjects, 'All Subjects');

  // Generate buffer
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}
