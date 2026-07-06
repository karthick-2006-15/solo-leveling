import { format, isValid, parseISO } from 'date-fns';

/**
 * Safely parses a date string, number, or Date object into a valid Date.
 * Returns null if the date is invalid.
 */
export const safeDate = (value: any): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return isValid(value) ? value : null;
  
  try {
    // Attempt to parse string/number
    let parsed: Date;
    if (typeof value === 'string') {
      // Handles both ISO strings and standard date strings
      parsed = value.includes('T') ? parseISO(value) : new Date(value);
    } else {
      parsed = new Date(value);
    }
    
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/**
 * Safely formats a date, returning a fallback string if invalid.
 */
export const formatSafeDate = (value: any, formatString: string = 'MMM dd, yyyy', fallback: string = 'N/A'): string => {
  const date = safeDate(value);
  if (!date) return fallback;
  try {
    return format(date, formatString);
  } catch {
    return fallback;
  }
};

/**
 * Safely formats a date relative to today (e.g. "Today", "Yesterday", "2 days ago")
 * Note: requires date-fns `formatRelative` or simple custom logic.
 */
export const formatRelativeDate = (value: any, fallback: string = 'N/A'): string => {
  const date = safeDate(value);
  if (!date) return fallback;
  
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return formatSafeDate(date, 'MMM dd', fallback);
};
