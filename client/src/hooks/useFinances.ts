import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApi } from '../api/financeApi';

export const useFinances = () => {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['financeProfile'],
    queryFn: async () => {
      const response = await financeApi.getProfile();
      return response.data;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => financeApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeProfile'] });
    },
  });

  return {
    profile: profileQuery.data?.profile,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
  };
};
