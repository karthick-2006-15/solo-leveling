import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';

const REDIS_URL = process.env.REDIS_URL;
const isDev = process.env.NODE_ENV === 'development' || !REDIS_URL;

export const redis = (process.env.QA_MODE === 'true' || isDev)
  ? new RedisMock() 
  : new Redis(REDIS_URL as string, {
      lazyConnect: true,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

redis.on('error', (err) => {
  // Suppress connection errors if redis is not running locally
});

let isRedisConnected = false;

export const connectRedis = async () => {
  if (isRedisConnected) return;
  try {
    if (process.env.QA_MODE !== 'true' && !isDev) {
      await redis.connect();
    }
    isRedisConnected = true;
    console.log(isDev ? 'Connected to Redis Cache (Mocked)' : 'Connected to Redis Cache');
  } catch (error) {
    console.error('Redis connection failed:', error);
  }
};

export const getCache = async (key: string): Promise<any | null> => {
  if (!isRedisConnected) return null;
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`Redis GET error for key ${key}:`, err);
    return null;
  }
};

export const setCache = async (key: string, value: any, expireSeconds: number = 3600): Promise<void> => {
  if (!isRedisConnected) return;
  try {
    await redis.setex(key, expireSeconds, JSON.stringify(value));
  } catch (err) {
    console.error(`Redis SET error for key ${key}:`, err);
  }
};

export const clearCachePattern = async (pattern: string): Promise<void> => {
  if (!isRedisConnected) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.error(`Redis CLEAR error for pattern ${pattern}:`, err);
  }
};
