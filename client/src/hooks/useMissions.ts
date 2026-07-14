import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDailyQuests, fetchWeeklyBoss, fetchBadges, fetchShadows, resurrectShadow, type QuestInstance, type WeeklyBossInstance, type Badge } from '../api/missionApi';
import { useAuthStore } from '../store/useAuthStore';

export const useMissions = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const { data: quests, isLoading: questsLoading } = useQuery<QuestInstance[]>({
    queryKey: ['missions', 'dailyQuests'],
    queryFn: fetchDailyQuests,
    enabled: isAuthenticated
  });

  const { data: boss, isLoading: bossLoading } = useQuery<WeeklyBossInstance>({
    queryKey: ['missions', 'weeklyBoss'],
    queryFn: fetchWeeklyBoss,
    enabled: isAuthenticated
  });

  const { data: badges, isLoading: badgesLoading } = useQuery<Badge[]>({
    queryKey: ['missions', 'badges'],
    queryFn: fetchBadges,
    enabled: isAuthenticated
  });

  const { data: shadows, isLoading: shadowsLoading } = useQuery<QuestInstance[]>({
    queryKey: ['missions', 'shadows'],
    queryFn: fetchShadows,
    enabled: isAuthenticated
  });

  const resurrectMutation = useMutation({
    mutationFn: (shadowId: string) => resurrectShadow(shadowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['monarch'] });
    }
  });

  return {
    quests: quests || [],
    questsLoading,
    boss: boss || null,
    bossLoading,
    badges: badges || [],
    badgesLoading,
    shadows: shadows || [],
    shadowsLoading,
    resurrectShadow: resurrectMutation.mutateAsync,
    isResurrecting: resurrectMutation.isPending
  };
};
