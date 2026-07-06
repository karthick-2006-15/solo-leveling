import ProgressionProfile, { IProgressionProfile } from '../models/ProgressionProfile';
import { UpdateQuery } from 'mongoose';

export const progressionRepository = {
  findByUserId: async (userId: string): Promise<IProgressionProfile | null> => {
    return ProgressionProfile.findOne({ userId });
  },

  create: async (profileData: Partial<IProgressionProfile>): Promise<IProgressionProfile> => {
    return ProgressionProfile.create(profileData);
  },

  updateByUserId: async (userId: string, updates: UpdateQuery<IProgressionProfile>): Promise<IProgressionProfile | null> => {
    return ProgressionProfile.findOneAndUpdate({ userId }, updates, { new: true });
  },
  
  save: async (profile: IProgressionProfile): Promise<IProgressionProfile> => {
    return profile.save();
  }
};
