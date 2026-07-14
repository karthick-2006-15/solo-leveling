import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { monarchApi } from '../api/monarchApi';

export const useMonarch = () => {
  const queryClient = useQueryClient();

  const monarchQuery = useQuery({
    queryKey: ['monarch'],
    queryFn: async () => {
      const res = await monarchApi.getMonarchState();
      return res.data;
    }
  });

  const battleMutation = useMutation({
    mutationFn: () => monarchApi.triggerManualBattle(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monarch'] });
    }
  });

  const adjustAttributes = useMutation({
    mutationFn: (changes: Record<string, number>) => monarchApi.adjustAttributes(changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monarch'] });
    }
  });

  return {
    monarchData: monarchQuery.data,
    isLoading: monarchQuery.isLoading,
    battleMutation,
    adjustAttributes
  };
};
