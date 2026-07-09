import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventoryApi';
import type { InventoryItem } from '../api/inventoryApi';

export const useInventory = (filters: any = {}) => {
  const queryClient = useQueryClient();
  const filterKey = JSON.stringify(filters);

  const { data: items, isLoading } = useQuery<InventoryItem[]>({
    queryKey: ['inventory', filterKey],
    queryFn: async () => {
      const res = await inventoryApi.getInventory(filters);
      return res.data;
    }
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['inventoryStats'],
    queryFn: async () => {
      const res = await inventoryApi.getInventoryStats();
      return res.data;
    }
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['inventoryHistory'],
    queryFn: async () => {
      const res = await inventoryApi.getInventoryHistory();
      return res.data;
    }
  });

  const toggleFavorite = useMutation({
    mutationFn: (id: string) => inventoryApi.toggleFavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    }
  });

  return {
    items,
    isLoading,
    stats,
    statsLoading,
    history,
    historyLoading,
    toggleFavorite
  };
};
