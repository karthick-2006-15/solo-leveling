import { useAuthStore } from '../store/useAuthStore';

// Deduplication Map to track in-flight GET requests
const inFlightRequests = new Map<string, Promise<Response>>();

// Helper to wait
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const method = options.method?.toUpperCase() || 'GET';
  
  // Only deduplicate GET requests
  if (method === 'GET') {
    const existingReq = inFlightRequests.get(endpoint);
    if (existingReq) {
      // Clone the response so multiple callers can read the body
      const res = await existingReq;
      return res.clone();
    }
  }

  // Create the actual promise
  const requestPromise = executeFetchWithRetry(endpoint, options);
  
  if (method === 'GET') {
    inFlightRequests.set(endpoint, requestPromise);
    // Remove from map once settled
    requestPromise.finally(() => {
      inFlightRequests.delete(endpoint);
    });
  }

  const response = await requestPromise;
  
  // For deduplicated GET requests, we need to return a clone of the original response so the caller can consume it safely
  return method === 'GET' ? response.clone() : response;
};

const executeFetchWithRetry = async (endpoint: string, options: RequestInit = {}, maxRetries = 3): Promise<Response> => {
  let attempt = 0;

  while (attempt < maxRetries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(endpoint, {
        credentials: 'include',
        ...options,
        headers,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        await processMissionTriggers(response);
        return response;
      }

      // Handle 429 Too Many Requests
      if (response.status === 429) {
        attempt++;
        if (attempt >= maxRetries) {
          throw new Error('Too many requests. Please try again later.');
        }
        
        // Check for Retry-After header
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff max 10s
        
        console.warn(`[429] Rate limited at ${endpoint}. Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
        await wait(delay);
        continue;
      }

      // Handle other errors gracefully
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: `HTTP Error: ${response.status}` };
      }
      
      // Prevent console spam in production
      if (import.meta.env.MODE !== 'production') {
        console.error(`API Error [${response.status}] at ${endpoint}:`, errorData);
      }
      
      if (response.status === 401) {
        useAuthStore.getState().logout();
      }
      
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);

    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if ((error as Error)?.name === 'AbortError') {
        if (attempt >= maxRetries - 1) {
          throw new Error('Request timed out after 10 seconds.', { cause: error });
        }
        attempt++;
        await wait(1000 * Math.pow(2, attempt));
        continue;
      }

      // Re-throw if it's already an error we handled (like 429 exhaustion or 401)
      throw error;
    }
  }

  throw new Error('Request failed after maximum retries');
};

const processMissionTriggers = async (response: Response) => {
  try {
    const clone = response.clone();
    const data = await clone.json();
    if (data.newlyCompletedQuests && data.newlyCompletedQuests.length > 0) {
      window.dispatchEvent(new CustomEvent('mission:questsCompleted', { detail: data.newlyCompletedQuests }));
    }
    if (data.newlyDefeatedBoss) {
      window.dispatchEvent(new CustomEvent('mission:bossDefeated', { detail: data.newlyDefeatedBoss }));
    }
    if (data.newlyUnlockedAchievements && data.newlyUnlockedAchievements.length > 0) {
      window.dispatchEvent(new CustomEvent('mission:achievementsUnlocked', { detail: data.newlyUnlockedAchievements }));
    }
  } catch {
    // Ignore JSON parse errors for non-JSON responses
  }
};
