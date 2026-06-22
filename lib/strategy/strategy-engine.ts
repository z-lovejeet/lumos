import { predictGrade } from '../predictions/grade-predictor';
import { calculateSGPA, GradeRange, SubjectForSGPA } from '../calculations/sgpa';
import { CalculationComponent, CalculationMark } from '../calculations/percentage';

export interface SubjectROI {
  subjectId: string;
  subjectName: string;
  credits: number;
  currentPercentage: number;
  requiredMarksForNextGrade: number;
  nextGrade: string;
  roiScore: number; // Higher is better (e.g. less marks needed for higher credit subject)
}

export interface StrategyRecommendation {
  type: 'focus' | 'maintain' | 'drop';
  subjectId: string;
  subjectName: string;
  message: string;
  sgpaImpact: number;
}

export interface StrategyEngineData {
  subjects: {
    id: string;
    name: string;
    credits: number;
    marks: CalculationMark[];
    components: CalculationComponent[];
  }[];
  gradeScale: GradeRange[];
}

export function calculateSubjectROI(subject: StrategyEngineData['subjects'][0], gradeScale: GradeRange[]): SubjectROI | null {
  const prediction = predictGrade(subject.marks, subject.components, gradeScale);
  
  if (prediction.predictedPercentage >= 100) return null;

  // Find next grade bracket
  const currentGradeObj = gradeScale.find(g => g.grade === prediction.predictedGrade);
  if (!currentGradeObj) return null;

  // Assume gradeScale is sorted descending by minPercent
  const sortedScale = [...gradeScale].sort((a, b) => b.minPercent - a.minPercent);
  const currentIndex = sortedScale.findIndex(g => g.grade === prediction.predictedGrade);
  
  if (currentIndex <= 0) return null; // Already at top grade

  const nextGradeObj = sortedScale[currentIndex - 1];
  const percentNeeded = nextGradeObj.minPercent;

  // Marks needed to reach percentNeeded
  // We need to gain (percentNeeded - predictedPercentage) %
  const percentDelta = percentNeeded - prediction.predictedPercentage;
  
  // Roughly, how many absolute marks is that percent delta?
  const totalWeight = subject.components.reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight === 0) return null;

  // marksDelta = percentDelta * (maxMarks / weight) - roughly
  // It's easier to just use the percentage gap.
  // ROI = credits / percentageGap 
  // High credits and low percentage gap = High ROI
  
  const roiScore = (subject.credits * 10) / (percentDelta > 0 ? percentDelta : 1);

  return {
    subjectId: subject.id,
    subjectName: subject.name,
    credits: subject.credits,
    currentPercentage: prediction.predictedPercentage,
    requiredMarksForNextGrade: percentDelta, // using percent delta as a proxy for effort
    nextGrade: nextGradeObj.grade,
    roiScore
  };
}

export function generateStrategy(data: StrategyEngineData): StrategyRecommendation[] {
  const recommendations: StrategyRecommendation[] = [];
  
  const rois: SubjectROI[] = [];
  
  data.subjects.forEach(sub => {
    const roi = calculateSubjectROI(sub, data.gradeScale);
    if (roi) rois.push(roi);
  });

  // Sort by highest ROI
  rois.sort((a, b) => b.roiScore - a.roiScore);

  // Top 2 subjects to focus on
  rois.slice(0, 2).forEach(roi => {
    // Calculate potential SGPA impact
    const baseSgpaData = data.subjects.map(s => {
      const pred = predictGrade(s.marks, s.components, data.gradeScale);
      return { credits: s.credits, percentage: pred.predictedPercentage };
    });
    const baseSgpa = calculateSGPA(baseSgpaData, data.gradeScale);

    const improvedSgpaData = data.subjects.map(s => {
      const pred = predictGrade(s.marks, s.components, data.gradeScale);
      let newPercent = pred.predictedPercentage;
      if (s.id === roi.subjectId) {
        // Assume they hit the next grade
        const sortedScale = [...data.gradeScale].sort((x, y) => y.minPercent - x.minPercent);
        const currentIndex = sortedScale.findIndex(g => g.grade === pred.predictedGrade);
        if (currentIndex > 0) {
          newPercent = sortedScale[currentIndex - 1].minPercent;
        }
      }
      return { credits: s.credits, percentage: newPercent };
    });
    const improvedSgpa = calculateSGPA(improvedSgpaData, data.gradeScale);
    const impact = improvedSgpa - baseSgpa;

    recommendations.push({
      type: 'focus',
      subjectId: roi.subjectId,
      subjectName: roi.subjectName,
      message: `Focus on ${roi.subjectName}. Getting ${Math.ceil(roi.requiredMarksForNextGrade)}% more bumps you to ${roi.nextGrade}.`,
      sgpaImpact: impact
    });
  });

  return recommendations;
}
