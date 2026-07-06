import Skill, { ISkill } from '../models/Skill';
import StudySession, { IStudySession } from '../models/StudySession';
import { UpdateQuery } from 'mongoose';

export const skillRepository = {
  findSkillsByUserId: async (userId: string): Promise<ISkill[]> => {
    return Skill.find({ userId });
  },

  findByIdAndUserId: async (id: string, userId: string): Promise<ISkill | null> => {
    return Skill.findOne({ _id: id, userId });
  },

  insertMany: async (skills: any[]): Promise<ISkill[]> => {
    return Skill.insertMany(skills) as unknown as ISkill[];
  },

  create: async (data: Partial<ISkill>): Promise<ISkill> => {
    return Skill.create(data);
  },

  update: async (id: string, userId: string, updates: UpdateQuery<ISkill>): Promise<ISkill | null> => {
    return Skill.findOneAndUpdate({ _id: id, userId }, updates, { new: true });
  },

  save: async (skill: ISkill): Promise<ISkill> => {
    return skill.save();
  },

  createStudySession: async (data: Partial<IStudySession>): Promise<IStudySession> => {
    return StudySession.create(data);
  }
};
