import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicApi } from '../api/academicApi';

export const useAcademics = () => {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['academicProfile'],
    queryFn: async () => {
      const response = await academicApi.getProfile();
      return response.data;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => academicApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicProfile'] });
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
