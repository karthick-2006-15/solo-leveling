import DSAProblem, { IDSAProblem } from '../models/DSAProblem';
import { UpdateQuery } from 'mongoose';

export const dsaRepository = {
  findProblems: async (filter: any): Promise<IDSAProblem[]> => {
    return DSAProblem.find(filter).sort({ solvedAt: -1 });
  },

  createProblem: async (data: Partial<IDSAProblem>): Promise<IDSAProblem> => {
    return DSAProblem.create(data);
  },

  updateProblem: async (id: string, userId: string, updates: UpdateQuery<IDSAProblem>): Promise<IDSAProblem | null> => {
    return DSAProblem.findOneAndUpdate({ _id: id, userId }, updates, { new: true, runValidators: true });
  },

  deleteProblem: async (id: string, userId: string): Promise<IDSAProblem | null> => {
    return DSAProblem.findOneAndDelete({ _id: id, userId });
  }
};
