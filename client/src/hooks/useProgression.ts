import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProgression, devAwardXP, type ProgressionData, type AwardXPResult } from '../api/progressionApi';

import { useAuthStore } from '../store/useAuthStore';

export const useProgression = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const { data: progression, isLoading, isError } = useQuery<ProgressionData>({
    queryKey: ['progression'],
    queryFn: fetchProgression,
    enabled: isAuthenticated,
    // Add some default mock data for UI testing if backend is not wired yet or errors out
    initialData: {
      level: 1,
      rank: 'Beginner',
      currentXP: 0,
      xpRequired: 100,
      totalXP: 0,
      coins: 0,
      currentStreak: 0,
      longestStreak: 0,
      dailyXP: 0,
      weeklyXP: 0,
      monthlyXP: 0,
      skillPoints: 0,
      hunterScore: 0,
      activeTitle: 'Beginner Hunter',
      unlockedTitles: ['Beginner Hunter'],
      unlockedAchievements: []
    }
  });

  const awardMutation = useMutation<AwardXPResult, Error, { source: string, amount: number }>({
    mutationFn: ({ source, amount }) => devAwardXP(source, amount),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['progression'] });
    },
  });

  return {
    progression,
    isLoading,
    isError,
    awardDevXP: awardMutation.mutateAsync,
    isAwarding: awardMutation.isPending
  };
};
