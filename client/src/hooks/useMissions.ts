import { useQuery } from '@tanstack/react-query';
import { fetchDailyQuests, fetchWeeklyBoss, fetchBadges, type QuestInstance, type WeeklyBossInstance, type Badge } from '../api/missionApi';
import { useAuthStore } from '../store/useAuthStore';

export const useMissions = () => {
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

  return {
    quests: quests || [],
    questsLoading,
    boss: boss || null,
    bossLoading,
    badges: badges || [],
    badgesLoading
  };
};
