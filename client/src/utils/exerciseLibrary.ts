export interface LibraryExercise {
  name: string;
  category: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core' | 'Full Body';
  equipment: 'Barbell' | 'Dumbbell' | 'Bodyweight' | 'Kettlebell' | 'Machine';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  defaultSets: number;
  defaultReps: number;
  defaultWeight: number;
  description: string;
}

export const EXERCISE_LIBRARY: LibraryExercise[] = [
  {
    name: 'Barbell Squat',
    category: 'Legs',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    defaultSets: 4,
    defaultReps: 8,
    defaultWeight: 60,
    description: 'A fundamental lower body movement targeting quadriceps, hamstrings, and glutes.'
  },
  {
    name: 'Bench Press',
    category: 'Chest',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    defaultSets: 4,
    defaultReps: 10,
    defaultWeight: 50,
    description: 'A compound horizontal pressing movement targeting the pectorals, anterior deltoids, and triceps.'
  },
  {
    name: 'Deadlift',
    category: 'Full Body',
    equipment: 'Barbell',
    difficulty: 'Advanced',
    defaultSets: 3,
    defaultReps: 5,
    defaultWeight: 80,
    description: 'A massive compound pull targeting the entire posterior chain (lower back, glutes, hamstrings, traps).'
  },
  {
    name: 'Pull-Up',
    category: 'Back',
    equipment: 'Bodyweight',
    difficulty: 'Intermediate',
    defaultSets: 4,
    defaultReps: 8,
    defaultWeight: 0,
    description: 'An upper body pull-up targeting the latissimus dorsi, rhomboids, and biceps.'
  },
  {
    name: 'Overhead Press',
    category: 'Shoulders',
    equipment: 'Barbell',
    difficulty: 'Intermediate',
    defaultSets: 4,
    defaultReps: 8,
    defaultWeight: 30,
    description: 'A compound vertical pressing movement targeting the deltoids, triceps, and core stability.'
  },
  {
    name: 'Dumbbell Curl',
    category: 'Arms',
    equipment: 'Dumbbell',
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 10,
    description: 'Isolation exercise targeting the biceps brachii.'
  },
  {
    name: 'Tricep Dip',
    category: 'Arms',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 0,
    description: 'Pressing exercise targeting the triceps brachii and pectorals.'
  },
  {
    name: 'Push-Up',
    category: 'Chest',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultReps: 15,
    defaultWeight: 0,
    description: 'Horizontal pressing exercise targeting chest, shoulders, and triceps.'
  },
  {
    name: 'Dumbbell Lunge',
    category: 'Legs',
    equipment: 'Dumbbell',
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeight: 12,
    description: 'Unilateral leg exercise targeting quadriceps, glutes, and balance.'
  },
  {
    name: 'Plank',
    category: 'Core',
    equipment: 'Bodyweight',
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultReps: 60,
    defaultWeight: 0,
    description: 'Isometric core stability holds targeting the rectus abdominis and obliques.'
  },
  {
    name: 'Kettlebell Swing',
    category: 'Full Body',
    equipment: 'Kettlebell',
    difficulty: 'Intermediate',
    defaultSets: 4,
    defaultReps: 15,
    defaultWeight: 16,
    description: 'Ballistic hip hinge exercise targeting the glutes, hamstrings, and cardiovascular endurance.'
  },
  {
    name: 'Lateral Raise',
    category: 'Shoulders',
    equipment: 'Dumbbell',
    difficulty: 'Beginner',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeight: 6,
    description: 'Isolation exercise targeting the lateral head of the deltoid for shoulder width.'
  }
];
