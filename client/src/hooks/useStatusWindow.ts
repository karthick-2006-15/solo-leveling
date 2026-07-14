import { useQuery } from '@tanstack/react-query';
import { fetchStatusWindow } from '../api/statusApi';

export const useStatusWindow = () => {
  return useQuery({
    queryKey: ['statusWindow'],
    queryFn: fetchStatusWindow,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
