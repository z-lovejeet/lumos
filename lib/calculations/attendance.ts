export function calculateAttendancePercent(attended: number, total: number): number {
  if (total === 0) return 100;
  return (attended / total) * 100;
}

export function predictAttendanceBuffer(attended: number, delivered: number, totalInSemester: number, targetPercent: number = 75): { canMiss: number, needToAttend: number, status: 'safe' | 'danger' | 'critical' } {
  if (totalInSemester === 0) return { canMiss: 0, needToAttend: 0, status: 'safe' };

  const targetRatio = targetPercent / 100;
  const requiredToAttend = Math.ceil(targetRatio * totalInSemester);
  const stillNeedToAttend = Math.max(0, requiredToAttend - attended);
  const classesLeft = Math.max(0, totalInSemester - delivered);
  
  if (stillNeedToAttend <= 0) {
    return {
      canMiss: classesLeft,
      needToAttend: 0,
      status: classesLeft > 0 ? 'safe' : 'safe'
    };
  }
  
  if (stillNeedToAttend > classesLeft) {
    return {
      canMiss: 0,
      needToAttend: stillNeedToAttend,
      status: 'critical'
    };
  }

  const missable = classesLeft - stillNeedToAttend;
  let status: 'safe' | 'danger' | 'critical' = 'safe';
  if (missable <= 2) {
    status = 'danger';
  }

  return {
    canMiss: Math.max(0, missable),
    needToAttend: Math.max(0, stillNeedToAttend),
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
