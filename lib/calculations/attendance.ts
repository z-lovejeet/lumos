export function calculateAttendancePercent(attended: number, total: number): number {
  if (total === 0) return 100;
  return (attended / total) * 100;
}

export function predictAttendanceBuffer(attended: number, total: number, targetPercent: number = 75): { canMiss: number, needToAttend: number, status: 'safe' | 'danger' | 'critical' } {
  const currentPercent = calculateAttendancePercent(attended, total);
  
  if (total === 0) return { canMiss: 0, needToAttend: 0, status: 'safe' };

  const targetFraction = targetPercent / 100;

  // If you attend next N classes, what happens?
  // Current equation: (attended + needToAttend) / (total + needToAttend) = targetFraction
  // attended + needToAttend = targetFraction * total + targetFraction * needToAttend
  // needToAttend - targetFraction * needToAttend = targetFraction * total - attended
  // needToAttend * (1 - targetFraction) = targetFraction * total - attended
  // needToAttend = (targetFraction * total - attended) / (1 - targetFraction)

  let needToAttend = 0;
  if (currentPercent < targetPercent) {
    needToAttend = Math.ceil((targetFraction * total - attended) / (1 - targetFraction));
  }

  // How many can you miss and stay >= targetPercent?
  // attended / (total + canMiss) = targetFraction
  // attended = targetFraction * total + targetFraction * canMiss
  // targetFraction * canMiss = attended - targetFraction * total
  // canMiss = (attended - targetFraction * total) / targetFraction

  let canMiss = 0;
  if (currentPercent >= targetPercent) {
    canMiss = Math.floor((attended - targetFraction * total) / targetFraction);
  }

  let status: 'safe' | 'danger' | 'critical' = 'safe';
  if (currentPercent < targetPercent) {
    status = 'critical';
  } else if (canMiss <= 2) {
    status = 'danger';
  }

  return {
    canMiss: Math.max(0, canMiss),
    needToAttend: Math.max(0, needToAttend),
    status
  };
}

export function calculateAttendanceMarks(attendancePercent: number, totalAttendanceMarks: number, scale: { min: number, max: number, marks: number }[]): number {
  // scale example: [{ min: 95, max: 100, marks: 5 }, { min: 90, max: 94, marks: 4 }]
  for (const bracket of scale) {
    if (attendancePercent >= bracket.min && attendancePercent <= bracket.max) {
      return Math.min(bracket.marks, totalAttendanceMarks);
    }
  }
  return 0;
}
