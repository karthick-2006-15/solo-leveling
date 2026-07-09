import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { economyApi } from '../api/economyApi';

export const useEconomy = () => {
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['economyStats'],
    queryFn: async () => {
      const res = await economyApi.getEconomyStats();
      return res.data;
    }
  });

  const { data: timeline, isLoading: timelineLoading } = useQuery({
    queryKey: ['rewardTimeline'],
    queryFn: async () => {
      const res = await economyApi.getRewardTimeline();
      return res.data;
    }
  });

  const claimDailyLogin = useMutation({
    mutationFn: () => economyApi.claimDailyLogin(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['economyStats'] });
      queryClient.invalidateQueries({ queryKey: ['rewardTimeline'] });
      queryClient.invalidateQueries({ queryKey: ['progression'] });
    }
  });

  const claimPerfectDay = useMutation({
    mutationFn: () => economyApi.claimPerfectDay(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['economyStats'] });
      queryClient.invalidateQueries({ queryKey: ['rewardTimeline'] });
      queryClient.invalidateQueries({ queryKey: ['progression'] });
    }
  });

  return {
    stats,
    timeline,
    isLoading: statsLoading || timelineLoading,
    claimDailyLogin,
    claimPerfectDay
  };
};
