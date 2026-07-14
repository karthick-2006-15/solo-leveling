import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProgression, devAwardXP, completeFocusSession, type ProgressionData, type AwardXPResult } from '../api/progressionApi';

import { useAuthStore } from '../store/useAuthStore';

export const useProgression = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const { data: progression, isLoading, isError } = useQuery<ProgressionData>({
    queryKey: ['progression'],
    queryFn: fetchProgression,
    enabled: isAuthenticated
  });

  const awardMutation = useMutation<AwardXPResult, Error, { source: string, amount: number }>({
    mutationFn: ({ source, amount }) => devAwardXP(source, amount),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['progression'] });
    },
  });

  const focusMutation = useMutation<AwardXPResult, Error, number>({
    mutationFn: (durationMinutes) => completeFocusSession(durationMinutes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progression'] });
      queryClient.invalidateQueries({ queryKey: ['monarch'] });
    },
  });

  return {
    progression,
    isLoading,
    isError,
    awardDevXP: awardMutation.mutateAsync,
    isAwarding: awardMutation.isPending,
    completeFocusSession: focusMutation.mutateAsync,
    isCompletingFocus: focusMutation.isPending
  };
};
