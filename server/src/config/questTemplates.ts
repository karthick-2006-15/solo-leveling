export interface QuestTemplate {
  id: string;
  title: string;
  description: string;
  checkType: 'workout_logged_today' | 'protein_goal_met_today' | 'water_goal_met_today' | 'calorie_goal_met_today' | 'dsa_problems_today' | 'habit_completed_today' | 'habits_completed_count_today' | 'study_session_logged_today';
  targetValue?: number;
  habitKey?: string;
  xpReward: number;
  coinReward: number;
}

export const QUEST_TEMPLATES: QuestTemplate[] = [
  {
    id: 'quest_workout',
    title: 'Complete a Workout',
    description: 'Log any workout session today to stay active.',
    checkType: 'workout_logged_today',
    xpReward: 50,
    coinReward: 10
  },
  {
    id: 'quest_protein',
    title: 'Hit Your Protein Goal',
    description: 'Reach or exceed your daily protein target.',
    checkType: 'protein_goal_met_today',
    xpReward: 50,
    coinReward: 10
  },
  {
    id: 'quest_water',
    title: 'Hit Your Water Goal',
    description: 'Drink enough water to meet your daily hydration target.',
    checkType: 'water_goal_met_today',
    xpReward: 30,
    coinReward: 5
  },
  {
    id: 'quest_calorie',
    title: 'Hit Your Calorie Goal',
    description: 'Stay within your target calorie budget for the day.',
    checkType: 'calorie_goal_met_today',
    xpReward: 40,
    coinReward: 10
  },
  {
    id: 'quest_dsa',
    title: 'Solve 2 DSA Problems',
    description: 'Keep your algorithm skills sharp by solving 2 problems today.',
    checkType: 'dsa_problems_today',
    targetValue: 2,
    xpReward: 75,
    coinReward: 15
  },
  {
    id: 'quest_read',
    title: 'Complete Your Reading Habit',
    description: 'Check off your reading habit for today.',
    checkType: 'habit_completed_today',
    habitKey: 'read',
    xpReward: 30,
    coinReward: 5
  },
  {
    id: 'quest_habit_count',
    title: 'Complete 3 Habits Today',
    description: 'Build consistency by completing at least 3 distinct habits today.',
    checkType: 'habits_completed_count_today',
    targetValue: 3,
    xpReward: 40,
    coinReward: 10
  },
  {
    id: 'quest_study',
    title: 'Log a Study Session',
    description: 'Spend time studying and log your session to grow your skills.',
    checkType: 'study_session_logged_today',
    xpReward: 40,
    coinReward: 10
  }
];
