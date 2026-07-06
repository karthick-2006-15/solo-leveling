export const calculateNewStreakState = (
  currentStreak: number,
  longestStreak: number,
  lastActiveDate: Date | null,
  newDate: Date = new Date()
) => {
  const newDateStart = new Date(Date.UTC(newDate.getUTCFullYear(), newDate.getUTCMonth(), newDate.getUTCDate()));
  let nextCurrentStreak = currentStreak;

  if (lastActiveDate) {
    const lastActiveStart = new Date(Date.UTC(
      lastActiveDate.getUTCFullYear(),
      lastActiveDate.getUTCMonth(),
      lastActiveDate.getUTCDate()
    ));

    const diffDays = Math.floor((newDateStart.getTime() - lastActiveStart.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      nextCurrentStreak += 1;
    } else if (diffDays > 1) {
      nextCurrentStreak = 1;
    }
  } else {
    nextCurrentStreak = 1;
  }

  const nextLongestStreak = Math.max(longestStreak, nextCurrentStreak);

  return {
    currentStreak: nextCurrentStreak,
    longestStreak: nextLongestStreak,
    lastActiveDate: newDate
  };
};
