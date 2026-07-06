import { userRepository } from '../repositories/userRepository';
import { AppError } from '../utils/AppError';
import { getCache, setCache, clearCachePattern } from '../config/redis';

export const userService = {
  getUserProfile: async (userId: string) => {
    const cacheKey = `user:${userId}`;
    const cachedUser = await getCache(cacheKey);
    if (cachedUser) return cachedUser;

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    await setCache(cacheKey, user, 3600); // 1 hour
    return user;
  },

  updateUserProfile: async (userId: string, updates: any) => {
    const safeUpdates = { ...updates };
    delete safeUpdates.passwordHash;
    delete safeUpdates.email;
    delete safeUpdates.googleId;
    delete safeUpdates._id;

    const user = await userRepository.updateById(userId, { $set: safeUpdates });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await clearCachePattern(`user:${userId}`);
    return user;
  }
};
