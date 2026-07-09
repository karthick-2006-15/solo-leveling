import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rewardApi } from '../api/rewardApi';

export const useShop = () => {
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ['shopItems'],
    queryFn: async () => {
      const res = await rewardApi.getShopItems();
      return res.data;
    }
  });

  const purchaseItem = useMutation({
    mutationFn: (itemId: string) => rewardApi.purchaseItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['progression'] });
    }
  });

  return { items, isLoading, purchaseItem };
};

export const useChest = () => {
  const queryClient = useQueryClient();

  const openChest = useMutation({
    mutationFn: (chestId: string) => rewardApi.openChest(chestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['progression'] });
    }
  });

  return { openChest };
};

export const useRelic = () => {
  const queryClient = useQueryClient();

  const equipRelic = useMutation({
    mutationFn: (itemDocId: string) => rewardApi.equipRelic(itemDocId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['progression'] });
    }
  });

  const unequipRelic = useMutation({
    mutationFn: (itemDocId: string) => rewardApi.unequipRelic(itemDocId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['progression'] });
    }
  });

  return { equipRelic, unequipRelic };
};

export const useMuseum = () => {
  const { data: crystals, isLoading } = useQuery({
    queryKey: ['memoryCrystals'],
    queryFn: async () => {
      const res = await rewardApi.getMemoryCrystals();
      return res.data;
    }
  });

  return { crystals, isLoading };
};

export const useEvents = () => {
  const { data: events } = useQuery({
    queryKey: ['activeEvents'],
    queryFn: async () => {
      const res = await rewardApi.getActiveEvents();
      return res.data;
    }
  });

  return { events };
};
