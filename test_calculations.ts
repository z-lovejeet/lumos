import { calculateSubjectPercentage, calculateEvaluatedPercentage } from './lib/calculations/percentage';
import { getGradeFromPercentage, getGPAValueFromPercentage } from './lib/calculations/sgpa';

const components = [
  { name: 'Midterm', maxMarks: 100, weight: 30 },
  { name: 'Final', maxMarks: 100, weight: 50 },
  { name: 'Assignment', maxMarks: 50, weight: 20 }
];

const marks = [
  { componentName: 'Midterm', maxMarks: 100, obtainedMarks: 80 }, // 80/100 * 30 = 24
  { componentName: 'Final', maxMarks: 100, obtainedMarks: null }, // not evaluated
  { componentName: 'Assignment', maxMarks: 50, obtainedMarks: 40 } // 40/50 * 20 = 16
];

const ranges = [
  { grade: 'A', minPercentage: 90, maxPercentage: 100, gpaValue: 4.0 },
  { grade: 'B', minPercentage: 80, maxPercentage: 89.99, gpaValue: 3.0 },
  { grade: 'C', minPercentage: 70, maxPercentage: 79.99, gpaValue: 2.0 },
  { grade: 'D', minPercentage: 60, maxPercentage: 69.99, gpaValue: 1.0 },
  { grade: 'F', minPercentage: 0, maxPercentage: 59.99, gpaValue: 0.0 }
];

function runTests() {
  console.log('--- Testing calculateSubjectPercentage ---');
  // Total expected = 24 + 0 + 16 = 40
  const total = calculateSubjectPercentage(marks, components);
  console.log(`Total Percentage: ${total} (Expected: 40)`);
  if (total !== 40) throw new Error('calculateSubjectPercentage failed');

  console.log('\n--- Testing calculateEvaluatedPercentage ---');
  // Evaluated weight = 30 + 20 = 50. Earned = 24 + 16 = 40. Current Standing = (40/50)*100 = 80
  const evaluated = calculateEvaluatedPercentage(marks, components);
  console.log(`Evaluated Percentage: ${evaluated} (Expected: 80)`);
  if (evaluated !== 80) throw new Error('calculateEvaluatedPercentage failed');

  console.log('\n--- Testing getGradeFromPercentage ---');
  const grade40 = getGradeFromPercentage(40, ranges);
  console.log(`Grade for 40%: ${grade40} (Expected: F)`);
  if (grade40 !== 'F') throw new Error('getGradeFromPercentage failed for 40%');

  const grade80 = getGradeFromPercentage(80, ranges);
  console.log(`Grade for 80%: ${grade80} (Expected: B)`);
  if (grade80 !== 'B') throw new Error('getGradeFromPercentage failed for 80%');

  const grade100 = getGradeFromPercentage(100, ranges);
  console.log(`Grade for 100%: ${grade100} (Expected: A)`);
  if (grade100 !== 'A') throw new Error('getGradeFromPercentage failed for 100%');

  console.log('\n--- Testing Edge Cases ---');
  // Above 100 shouldn't match any range or might fall to F due to strict bounds in ranges, but wait, 
  // calculateSubjectPercentage is capped at 100. Let's see what happens if percentage > 100.
  // It returns the lowest range grade if no range matches.
  const grade110 = getGradeFromPercentage(110, ranges);
  console.log(`Grade for 110%: ${grade110} (Expected: F as per logic if no match)`);

  const gpa85 = getGPAValueFromPercentage(85, ranges);
  console.log(`GPA for 85%: ${gpa85} (Expected: 3.0)`);
  if (gpa85 !== 3.0) throw new Error('getGPAValueFromPercentage failed for 85%');

  console.log('\nALL TESTS PASSED SUCCESSFULLY');
}

runTests();
