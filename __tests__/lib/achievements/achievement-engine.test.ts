import { checkAchievements, AchievementState } from '../../../lib/achievements/achievement-engine';

describe('Achievement Engine', () => {
  it('should unlock first-subject when a subject is added', () => {
    const state: AchievementState = {
      hasSubjects: true,
      hasSgpaAbove8: false,
      hasPerfectAttendance: false,
      hasCareerPlan: false,
      hasPerfectSgpa: false,
      has7DayStreak: false,
    };

    const unlocked = checkAchievements(state, []);
    expect(unlocked).toContain('first-subject');
    expect(unlocked.length).toBe(1);
  });

  it('should not unlock first-subject again if already earned', () => {
    const state: AchievementState = {
      hasSubjects: true,
      hasSgpaAbove8: false,
      hasPerfectAttendance: false,
      hasCareerPlan: false,
      hasPerfectSgpa: false,
      has7DayStreak: false,
    };

    const unlocked = checkAchievements(state, ['first-subject']);
    expect(unlocked.length).toBe(0);
  });

  it('should unlock multiple achievements simultaneously', () => {
    const state: AchievementState = {
      hasSubjects: true,
      hasSgpaAbove8: true,
      hasPerfectAttendance: true,
      hasCareerPlan: true,
      hasPerfectSgpa: false,
      has7DayStreak: true,
    };

    const unlocked = checkAchievements(state, []);
    expect(unlocked).toContain('first-subject');
    expect(unlocked).toContain('high-achiever');
    expect(unlocked).toContain('perfect-attendance');
    expect(unlocked).toContain('planner');
    expect(unlocked).toContain('7-day-streak');
    expect(unlocked.length).toBe(5);
  });

  it('should unlock perfect semester when SGPA is 10.0', () => {
    const state: AchievementState = {
      hasSubjects: true,
      hasSgpaAbove8: true,
      hasPerfectAttendance: false,
      hasCareerPlan: false,
      hasPerfectSgpa: true,
      has7DayStreak: false,
    };

    const unlocked = checkAchievements(state, ['first-subject', 'high-achiever']);
    expect(unlocked).toContain('perfect-semester');
    expect(unlocked.length).toBe(1);
  });
});
