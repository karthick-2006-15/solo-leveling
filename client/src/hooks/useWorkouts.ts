import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRoutines, createRoutine, updateRoutine, deleteRoutine, logSession, fetchSessions, fetchVolume, fetchPRs } from '../api/workoutApi';

import { useAuthStore } from '../store/useAuthStore';

export const useWorkouts = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const routinesQuery = useQuery({ queryKey: ['routines'], queryFn: fetchRoutines, enabled: isAuthenticated });
  const sessionsQuery = useQuery({ queryKey: ['sessions'], queryFn: fetchSessions, enabled: isAuthenticated });
  const volumeQuery = useQuery({ queryKey: ['volume'], queryFn: fetchVolume, enabled: isAuthenticated });
  const prsQuery = useQuery({ queryKey: ['prs'], queryFn: fetchPRs, enabled: isAuthenticated });

  const addRoutineMutation = useMutation({
    mutationFn: createRoutine,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routines'] })
  });

  const logSessionMutation = useMutation({
    mutationFn: logSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['volume'] });
      queryClient.invalidateQueries({ queryKey: ['prs'] });
      queryClient.invalidateQueries({ queryKey: ['progression'] });
    }
  });

  const updateRoutineMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: any }) => updateRoutine(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routines'] })
  });

  const deleteRoutineMutation = useMutation({
    mutationFn: deleteRoutine,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routines'] })
  });

  return {
    routines: routinesQuery.data || [],
    sessions: sessionsQuery.data || [],
    volume: volumeQuery.data || [],
    prs: prsQuery.data || [],
    isLoading: routinesQuery.isLoading || sessionsQuery.isLoading,
    addRoutine: addRoutineMutation.mutateAsync,
    editRoutine: updateRoutineMutation.mutateAsync,
    removeRoutine: deleteRoutineMutation.mutateAsync,
    logWorkoutSession: logSessionMutation.mutateAsync,
    isLoggingSession: logSessionMutation.isPending
  };
};
