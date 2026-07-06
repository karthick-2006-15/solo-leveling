import { startOfDay, startOfWeek, startOfMonth, startOfYear, format } from 'date-fns';

export type Granularity = 'day' | 'week' | 'month' | 'year';

export interface BucketedPoint {
  dateLabel: string;
  value: number;
}

/**
 * Generalized bucketing function for analytics data.
 * @param data Array of raw MongoDB documents
 * value extraction logic, or simply 1 for count).
 * @param dateField The field on the document containing the Date object
 * @param granularity 'day', 'week', 'month', 'year'
 * @param aggregation 'sum', 'max', 'average', 'count'
 * @param valueExtractor Function to extract the numerical value from the document (if not just counting)
 */
export const bucketByGranularity = (
  data: any[],
  dateField: string,
  granularity: Granularity,
  aggregation: 'sum' | 'max' | 'average' | 'count',
  valueExtractor: (item: any) => number = () => 1
): BucketedPoint[] => {
  const buckets: Record<string, number[]> = {};

  // 1. Group data into buckets
  for (const item of data) {
    const dateStr = item[dateField];
    if (!dateStr) continue;
    
    const date = new Date(dateStr);
    let bucketDate: Date;
    let labelFormat: string;

    switch (granularity) {
      case 'week':
        bucketDate = startOfWeek(date, { weekStartsOn: 1 });
        labelFormat = 'MMM d';
        break;
      case 'month':
        bucketDate = startOfMonth(date);
        labelFormat = 'MMM yyyy';
        break;
      case 'year':
        bucketDate = startOfYear(date);
        labelFormat = 'yyyy';
        break;
      case 'day':
      default:
        bucketDate = startOfDay(date);
        labelFormat = 'MMM d';
        break;
    }

    const label = format(bucketDate, labelFormat);
    if (!buckets[label]) buckets[label] = [];
    
    buckets[label].push(valueExtractor(item));
  }

  // 2. Aggregate each bucket
  const result: BucketedPoint[] = [];
  
  for (const [dateLabel, values] of Object.entries(buckets)) {
    let value = 0;
    
    switch (aggregation) {
      case 'sum':
        value = values.reduce((a, b) => a + b, 0);
        break;
      case 'max':
        value = Math.max(...values);
        break;
      case 'average':
        value = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        break;
      case 'count':
        value = values.length;
        break;
    }

    result.push({ dateLabel, value: Number(value.toFixed(2)) });
  }

  // Sorting could be done here if necessary, but often Recharts prefers chronological data.
  // We'll leave it as is, assuming input data or Object.entries preserves rough order, 
  // but to be safe, we can sort by parsing the label back to date, but label formats are lossy.
  // We assume the caller sorts the DB query properly, but `Object.entries` on string keys 
  // doesn't guarantee chronological order for formatted strings.
  // Better approach: store timestamp in bucket key, sort, then format label.

  return result;
};

// Safer version that guarantees chronological sorting
export const bucketAndAggregate = (
  data: any[],
  dateField: string,
  granularity: Granularity,
  aggregation: 'sum' | 'max' | 'average' | 'count',
  valueExtractor: (item: any) => number = () => 1
): BucketedPoint[] => {
  const buckets: Record<string, number[]> = {};

  for (const item of data) {
    const dateStr = item[dateField];
    if (!dateStr) continue;
    
    const date = new Date(dateStr);
    let bucketDate: Date;

    switch (granularity) {
      case 'week':
        bucketDate = startOfWeek(date, { weekStartsOn: 1 });
        break;
      case 'month':
        bucketDate = startOfMonth(date);
        break;
      case 'year':
        bucketDate = startOfYear(date);
        break;
      case 'day':
      default:
        bucketDate = startOfDay(date);
        break;
    }

    const ts = bucketDate.getTime().toString();
    if (!buckets[ts]) buckets[ts] = [];
    
    buckets[ts].push(valueExtractor(item));
  }

  const result: BucketedPoint[] = [];
  
  // Sort by timestamp
  const sortedTimestamps = Object.keys(buckets).sort((a, b) => Number(a) - Number(b));

  for (const ts of sortedTimestamps) {
    const values = buckets[ts];
    let value = 0;
    
    switch (aggregation) {
      case 'sum':
        value = values.reduce((a, b) => a + b, 0);
        break;
      case 'max':
        value = Math.max(...values);
        break;
      case 'average':
        value = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        break;
      case 'count':
        value = values.length;
        break;
    }

    const bucketDate = new Date(Number(ts));
    let labelFormat = 'MMM d';
    if (granularity === 'month') labelFormat = 'MMM yyyy';
    if (granularity === 'year') labelFormat = 'yyyy';

    result.push({ 
      dateLabel: format(bucketDate, labelFormat), 
      value: Number(value.toFixed(2)) 
    });
  }

  return result;
};
