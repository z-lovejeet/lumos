export const ACHIEVEMENT_DEFINITIONS = [
  {
    key: 'first-subject',
    title: 'First Steps',
    description: 'Added your first subject to AcademiQ.',
  },
  {
    key: 'high-achiever',
    title: 'High Achiever',
    description: 'Achieved an SGPA > 8.0 in any semester.',
  },
  {
    key: 'perfect-attendance',
    title: 'Perfect Attendance',
    description: 'Maintained 100% attendance in a subject.',
  },
  {
    key: 'planner',
    title: 'Master Planner',
    description: 'Created a career plan for MS Abroad, TUM, or Internships.',
  },
  {
    key: 'perfect-semester',
    title: 'Perfect Semester',
    description: 'Achieved a perfect 10.0 SGPA in any semester.',
  }
];

export interface AchievementState {
  hasSubjects: boolean;
  hasSgpaAbove8: boolean;
  hasPerfectAttendance: boolean;
  hasCareerPlan: boolean;
  hasPerfectSgpa: boolean;
}

export function checkAchievements(
  state: AchievementState,
  existingKeys: string[]
): string[] {
  const newAchievements: string[] = [];

  if (state.hasSubjects && !existingKeys.includes('first-subject')) {
    newAchievements.push('first-subject');
  }

  if (state.hasSgpaAbove8 && !existingKeys.includes('high-achiever')) {
    newAchievements.push('high-achiever');
  }

  if (state.hasPerfectAttendance && !existingKeys.includes('perfect-attendance')) {
    newAchievements.push('perfect-attendance');
  }

  if (state.hasCareerPlan && !existingKeys.includes('planner')) {
    newAchievements.push('planner');
  }
  
  if (state.hasPerfectSgpa && !existingKeys.includes('perfect-semester')) {
    newAchievements.push('perfect-semester');
  }

  return newAchievements;
}
