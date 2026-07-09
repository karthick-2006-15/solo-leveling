import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dungeonApi } from '../api/dungeonApi';

export const useDungeons = () => {
  const queryClient = useQueryClient();

  const { data: dungeons, isLoading } = useQuery({
    queryKey: ['activeDungeons'],
    queryFn: async () => {
      const res = await dungeonApi.getActiveDungeons();
      return res.data;
    }
  });

  const generateDailyDungeon = useMutation({
    mutationFn: () => dungeonApi.generateDailyDungeon(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeDungeons'] });
      queryClient.invalidateQueries({ queryKey: ['activeBosses'] });
    }
  });

  return { dungeons, isLoading, generateDailyDungeon };
};

export const useBosses = () => {
  const { data: bosses, isLoading } = useQuery({
    queryKey: ['activeBosses'],
    queryFn: async () => {
      const res = await dungeonApi.getActiveBosses();
      return res.data;
    }
  });

  return { bosses, isLoading };
};

export const useStory = () => {
  const { data: chapters, isLoading } = useQuery({
    queryKey: ['storyChapters'],
    queryFn: async () => {
      const res = await dungeonApi.getStoryChapters();
      return res.data;
    }
  });

  return { chapters, isLoading };
};
