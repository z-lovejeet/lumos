import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ExportSemester {
  name: string;
  number: number;
  sgpa: number;
  totalCredits: number;
  subjects: {
    code: string;
    name: string;
    credits: number;
    grade: string;
  }[];
}

export function generatePDFReport(
  userName: string, 
  cgpa: number, 
  semesters: ExportSemester[]
): Buffer {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.text('Lumos Academic Report', 14, 22);
  
  doc.setFontSize(12);
  doc.text(`Name: ${userName || 'Student'}`, 14, 32);
  doc.text(`Cumulative GPA (CGPA): ${cgpa.toFixed(2)}`, 14, 40);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 48);

  let currentY = 58;

  semesters.forEach((sem) => {
    // Add new page if we are too low
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(14);
    doc.text(`${sem.name} (SGPA: ${sem.sgpa.toFixed(2)})`, 14, currentY);
    
    const tableData = sem.subjects.map(sub => [
      sub.code,
      sub.name,
      sub.credits.toString(),
      sub.grade
    ]);

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Code', 'Subject Name', 'Credits', 'Grade']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }, // Tailwind blue-500
      margin: { left: 14 }
    });

    // @ts-ignore - jspdf-autotable adds lastAutoTable
    currentY = doc.lastAutoTable.finalY + 15;
  });

  // Grade Distribution
  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  }
  
  doc.setFontSize(14);
  doc.text('Overall Grade Distribution', 14, currentY);

  const gradeCounts: Record<string, number> = {};
  semesters.forEach(sem => {
    sem.subjects.forEach(sub => {
      gradeCounts[sub.grade] = (gradeCounts[sub.grade] || 0) + 1;
    });
  });

  const distTableData = Object.entries(gradeCounts)
    .sort((a, b) => b[1] - a[1]) // Sort by count descending
    .map(([grade, count]) => [grade, count.toString()]);

  if (distTableData.length > 0) {
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Grade', 'Count']],
      body: distTableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14 }
    });
  }

  // We have to cast output to any, since depending on environment, we want a buffer for Node
  return Buffer.from(doc.output('arraybuffer'));
}
