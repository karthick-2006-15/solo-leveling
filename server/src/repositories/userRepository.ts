import User, { IUser } from '../models/User';
import { UpdateQuery } from 'mongoose';

export const userRepository = {
  findById: async (id: string): Promise<IUser | null> => {
    return User.findById(id).select('-passwordHash');
  },
  
  findByEmail: async (email: string): Promise<IUser | null> => {
    return User.findOne({ email });
  },

  create: async (userData: Partial<IUser>): Promise<IUser> => {
    return User.create(userData);
  },

  updateById: async (id: string, updates: UpdateQuery<IUser>): Promise<IUser | null> => {
    return User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-passwordHash');
  },
  
  save: async (user: IUser): Promise<IUser> => {
    return user.save();
  }
};
