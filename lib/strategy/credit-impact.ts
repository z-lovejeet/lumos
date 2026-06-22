import { calculateSGPA, GradeRange } from '../calculations/sgpa';
import { calculateCGPA } from '../calculations/cgpa';

export interface CreditImpactAnalysis {
  originalSgpa: number;
  newSgpa: number;
  sgpaDiff: number;
  originalCgpa: number;
  newCgpa: number;
  cgpaDiff: number;
  isPositive: boolean;
  recommendation: string;
}

export interface SemesterHistory {
  sgpa: number;
  totalCredits: number;
}

export interface CurrentSemesterSubjects {
  id: string;
  name: string;
  credits: number;
  predictedPercentage: number;
}

export function analyzeCreditImpact(
  subjectIdToDrop: string,
  currentSubjects: CurrentSemesterSubjects[],
  gradeScale: GradeRange[],
  pastSemesters: SemesterHistory[]
): CreditImpactAnalysis {
  
  // 1. Calculate Original SGPA
  const originalSgpaData = currentSubjects.map(sub => ({
    credits: sub.credits,
    percentage: sub.predictedPercentage
  }));
  const originalSgpa = calculateSGPA(originalSgpaData, gradeScale);

  // 2. Calculate New SGPA
  const newSgpaData = currentSubjects
    .filter(sub => sub.id !== subjectIdToDrop)
    .map(sub => ({
      credits: sub.credits,
      percentage: sub.predictedPercentage
    }));
  const newSgpa = calculateSGPA(newSgpaData, gradeScale);

  // 3. Calculate Original CGPA
  const originalCgpaSemesters = [...pastSemesters];
  if (currentSubjects.length > 0) {
    originalCgpaSemesters.push({
      sgpa: originalSgpa,
      totalCredits: currentSubjects.reduce((acc, curr) => acc + curr.credits, 0)
    });
  }
  const originalCgpa = calculateCGPA(originalCgpaSemesters);

  // 4. Calculate New CGPA
  const newCgpaSemesters = [...pastSemesters];
  if (newSgpaData.length > 0) {
    newCgpaSemesters.push({
      sgpa: newSgpa,
      totalCredits: newSgpaData.reduce((acc, curr) => acc + curr.credits, 0)
    });
  }
  const newCgpa = calculateCGPA(newCgpaSemesters);

  const sgpaDiff = newSgpa - originalSgpa;
  const cgpaDiff = newCgpa - originalCgpa;
  const isPositive = cgpaDiff >= 0 && sgpaDiff >= 0;

  let recommendation = '';
  const droppedSubject = currentSubjects.find(s => s.id === subjectIdToDrop);
  
  if (isPositive) {
    if (cgpaDiff > 0.05) {
      recommendation = `Dropping ${droppedSubject?.name} significantly boosts your CGPA. Consider doing this if it's not a core requirement.`;
    } else {
      recommendation = `Dropping ${droppedSubject?.name} has a slight positive impact on your GPA.`;
    }
  } else {
    if (Math.abs(cgpaDiff) > 0.1) {
      recommendation = `Dropping ${droppedSubject?.name} severely harms your CGPA since it's a high-scoring or high-credit subject. Avoid dropping.`;
    } else {
      recommendation = `Dropping ${droppedSubject?.name} slightly lowers your GPA, but might free up time for other subjects.`;
    }
  }

  return {
    originalSgpa: Math.round(originalSgpa * 100) / 100,
    newSgpa: Math.round(newSgpa * 100) / 100,
    sgpaDiff: Math.round(sgpaDiff * 100) / 100,
    originalCgpa: Math.round(originalCgpa * 100) / 100,
    newCgpa: Math.round(newCgpa * 100) / 100,
    cgpaDiff: Math.round(cgpaDiff * 100) / 100,
    isPositive,
    recommendation
  };
}
