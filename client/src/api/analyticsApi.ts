import { fetchWithAuth } from './fetchHelper';

export interface BucketedPoint {
  dateLabel: string;
  value: number;
}

export const fetchAnalytics = async (
  metric: string,
  granularity: 'day' | 'week' | 'month' | 'year',
  exercise?: string,
  habitId?: string
): Promise<BucketedPoint[]> => {
  let url = `/api/analytics/${metric}?granularity=${granularity}`;
  if (exercise) url += `&exercise=${encodeURIComponent(exercise)}`;
  if (habitId) url += `&habitId=${encodeURIComponent(habitId)}`;

  const res = await fetchWithAuth(url);
  const data = await res.json();
  return data.data;
};
