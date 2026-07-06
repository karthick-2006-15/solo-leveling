import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProblems, logProblem, updateProblem, deleteProblem, fetchDSAStats } from '../api/dsaApi';

import { useAuthStore } from '../store/useAuthStore';

export const useDSA = (filters?: { topic?: string; difficulty?: string; revisionStatus?: string }) => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const queryKey = ['dsaProblems', filters];

  const problemsQuery = useQuery({
    queryKey,
    queryFn: () => fetchProblems(filters),
    enabled: isAuthenticated
  });

  const statsQuery = useQuery({
    queryKey: ['dsaStats'],
    queryFn: fetchDSAStats,
    enabled: isAuthenticated
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['dsaProblems'] });
    queryClient.invalidateQueries({ queryKey: ['dsaStats'] });
    queryClient.invalidateQueries({ queryKey: ['skills'] });
    queryClient.invalidateQueries({ queryKey: ['progression'] });
  };

  const logMut = useMutation({ mutationFn: logProblem, onSuccess: invalidate });
  const updateMut = useMutation({ mutationFn: ({ id, data }: any) => updateProblem(id, data), onSuccess: invalidate });
  const delMut = useMutation({ mutationFn: deleteProblem, onSuccess: invalidate });

  return {
    problems: problemsQuery.data || [],
    stats: statsQuery.data,
    isLoading: problemsQuery.isLoading || statsQuery.isLoading,
    logProblem: logMut.mutateAsync,
    updateProblem: updateMut.mutateAsync,
    deleteProblem: delMut.mutateAsync
  };
};
