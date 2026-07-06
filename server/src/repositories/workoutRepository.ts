import WorkoutRoutine, { IWorkoutRoutine } from '../models/WorkoutRoutine';
import WorkoutSession, { IWorkoutSession } from '../models/WorkoutSession';
import PersonalRecord, { IPersonalRecord } from '../models/PersonalRecord';
import { UpdateQuery } from 'mongoose';

export const workoutRepository = {
  // Routines
  findRoutinesByUserId: async (userId: string): Promise<IWorkoutRoutine[]> => {
    return WorkoutRoutine.find({ userId });
  },

  createRoutine: async (data: Partial<IWorkoutRoutine>): Promise<IWorkoutRoutine> => {
    return WorkoutRoutine.create(data);
  },

  updateRoutine: async (id: string, userId: string, updates: UpdateQuery<IWorkoutRoutine>): Promise<IWorkoutRoutine | null> => {
    return WorkoutRoutine.findOneAndUpdate({ _id: id, userId }, updates, { new: true, runValidators: true });
  },

  deleteRoutine: async (id: string, userId: string): Promise<IWorkoutRoutine | null> => {
    return WorkoutRoutine.findOneAndDelete({ _id: id, userId });
  },

  // Sessions
  createSession: async (data: Partial<IWorkoutSession>): Promise<IWorkoutSession> => {
    return WorkoutSession.create(data);
  },

  findSessionsByUserId: async (userId: string): Promise<IWorkoutSession[]> => {
    return WorkoutSession.find({ userId }).sort({ date: -1 }).populate('routineId', 'name');
  },

  findVolumeHistory: async (userId: string, cutoffDate: Date): Promise<IWorkoutSession[]> => {
    return WorkoutSession.find({ userId, date: { $gte: cutoffDate } })
      .sort({ date: 1 })
      .select('date totalVolume');
  },

  // Personal Records
  findPR: async (userId: string, exerciseName: string): Promise<IPersonalRecord | null> => {
    return PersonalRecord.findOne({ userId, exerciseName });
  },

  findAllPRs: async (userId: string): Promise<IPersonalRecord[]> => {
    return PersonalRecord.find({ userId }).sort({ exerciseName: 1 });
  },

  createPR: async (data: Partial<IPersonalRecord>): Promise<IPersonalRecord> => {
    return PersonalRecord.create(data);
  },

  savePR: async (pr: IPersonalRecord): Promise<IPersonalRecord> => {
    return pr.save();
  }
};
