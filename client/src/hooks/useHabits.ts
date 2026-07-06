import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchHabits, createHabit, completeHabit, updateHabit, deleteHabit } from '../api/habitApi';

import { useAuthStore } from '../store/useAuthStore';

export const useHabits = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const { data: habits, isLoading } = useQuery({
    queryKey: ['habits'],
    queryFn: fetchHabits,
    enabled: isAuthenticated,
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: createHabit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] })
  });

  const completeMutation = useMutation({
    mutationFn: completeHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
      queryClient.invalidateQueries({ queryKey: ['progression'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateHabit(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] })
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHabit,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['habits'] })
  });

  return {
    habits,
    isLoading,
    addHabit: createMutation.mutateAsync,
    markComplete: completeMutation.mutateAsync,
    editHabit: updateMutation.mutateAsync,
    removeHabit: deleteMutation.mutateAsync,
    isCompleting: completeMutation.isPending
  };
};
