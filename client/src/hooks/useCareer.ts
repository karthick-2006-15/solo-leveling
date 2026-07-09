import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { careerApi } from '../api/careerApi';

export const useCareer = () => {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['careerProfile'],
    queryFn: async () => {
      const response = await careerApi.getProfile();
      return response.data;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => careerApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careerProfile'] });
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
