import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  searchFoodDatabase,
  parseFood, 
  logFood, 
  logManualFood, 
  fetchFoodLogs, 
  deleteFoodLog, 
  fetchNutritionSummary,
  logWater,
  fetchWater
} from '../api/nutritionApi';
import { useAuthStore } from '../store/useAuthStore';

export const useNutrition = (dateStr: string = new Date().toISOString().split('T')[0]) => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const logsQuery = useQuery({ 
    queryKey: ['foodLogs', dateStr], 
    queryFn: () => fetchFoodLogs(dateStr),
    enabled: isAuthenticated
  });
  
  const summaryQuery = useQuery({ 
    queryKey: ['nutritionSummary', 'week'], 
    queryFn: () => fetchNutritionSummary('week'),
    enabled: isAuthenticated
  });

  const waterQuery = useQuery({
    queryKey: ['water', dateStr],
    queryFn: () => fetchWater(dateStr),
    enabled: isAuthenticated
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['foodLogs'] });
    queryClient.invalidateQueries({ queryKey: ['nutritionSummary'] });
    queryClient.invalidateQueries({ queryKey: ['progression'] });
  };

  const logFoodMut = useMutation({
    mutationFn: logFood,
    onSuccess: invalidateAll
  });

  const logManualFoodMut = useMutation({
    mutationFn: logManualFood,
    onSuccess: invalidateAll
  });

  const deleteFoodMut = useMutation({
    mutationFn: deleteFoodLog,
    onSuccess: invalidateAll
  });

  const logWaterMut = useMutation({
    mutationFn: logWater,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water'] });
      queryClient.invalidateQueries({ queryKey: ['progression'] });
    }
  });

  return {
    logs: logsQuery.data || [],
    summary: summaryQuery.data || [],
    waterMl: waterQuery.data || 0,
    isLoading: logsQuery.isLoading || summaryQuery.isLoading || waterQuery.isLoading,
    searchFoodDatabase,
    parseFoodText: parseFood,
    logFood: logFoodMut.mutateAsync,
    logManualFood: logManualFoodMut.mutateAsync,
    deleteLog: deleteFoodMut.mutateAsync,
    logWater: logWaterMut.mutateAsync,
  };
};
