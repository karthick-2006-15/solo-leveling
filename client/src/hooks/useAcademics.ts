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

  const completeTaskMutation = useMutation({
    mutationFn: ({ taskId, taskType }: { taskId: string; taskType: 'assignment' | 'exam' }) => 
      academicApi.completeTask(taskId, taskType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicProfile'] });
      queryClient.invalidateQueries({ queryKey: ['progression'] });
      queryClient.invalidateQueries({ queryKey: ['monarch'] });
      queryClient.invalidateQueries({ queryKey: ['missions'] });
    },
  });

  return {
    profile: profileQuery.data?.profile,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
    completeTask: completeTaskMutation.mutateAsync,
    isCompletingTask: completeTaskMutation.isPending,
  };
};
