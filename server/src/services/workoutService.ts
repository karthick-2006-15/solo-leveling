import { workoutRepository } from '../repositories/workoutRepository';
import { awardXP } from '../services/progressionService';
import { AppError } from '../utils/AppError';

export const workoutService = {
  getRoutines: async (userId: string) => {
    return workoutRepository.findRoutinesByUserId(userId);
  },

  createRoutine: async (userId: string, data: any) => {
    return workoutRepository.createRoutine({ ...data, userId });
  },

  updateRoutine: async (id: string, userId: string, data: any) => {
    const routine = await workoutRepository.updateRoutine(id, userId, data);
    if (!routine) throw new AppError('Routine not found', 404);
    return routine;
  },

  deleteRoutine: async (id: string, userId: string) => {
    const routine = await workoutRepository.deleteRoutine(id, userId);
    if (!routine) throw new AppError('Routine not found', 404);
    return routine;
  },

  logSession: async (userId: string, data: any) => {
    const { routineId, exercises, durationMinutes } = data;

    let totalVolume = 0;
    const newPRs = [];
    const prOperations: Array<{
      type: 'create' | 'update';
      prDoc?: any;
      prData?: any;
    }> = [];

    // Calculate volume & PRs
    for (const ex of exercises) {
      const exerciseNameLower = ex.name.toLowerCase();
      let maxWeightInSet = 0;
      let repsAtMaxWeight = 0;

      for (const set of ex.sets) {
        totalVolume += set.reps * set.weight;
        if (set.weight > maxWeightInSet) {
          maxWeightInSet = set.weight;
          repsAtMaxWeight = set.reps;
        } else if (set.weight === maxWeightInSet && set.reps > repsAtMaxWeight) {
          repsAtMaxWeight = set.reps;
        }
      }

      if (maxWeightInSet > 0) {
        const pr = await workoutRepository.findPR(userId, exerciseNameLower);
        if (!pr) {
          // New PR
          prOperations.push({
            type: 'create',
            prData: {
              userId: userId as any,
              exerciseName: exerciseNameLower,
              maxWeight: maxWeightInSet,
              repsAtMaxWeight,
            }
          });
          newPRs.push({ exerciseName: ex.name, maxWeight: maxWeightInSet, reps: repsAtMaxWeight });
        } else if (maxWeightInSet > pr.maxWeight) {
          // Updated PR
          prOperations.push({
            type: 'update',
            prDoc: pr,
            prData: {
              maxWeight: maxWeightInSet,
              repsAtMaxWeight
            }
          });
          newPRs.push({ exerciseName: ex.name, maxWeight: maxWeightInSet, reps: repsAtMaxWeight });
        }
      }
    }

    const session = await workoutRepository.createSession({
      userId: userId as any,
      routineId,
      exercises,
      totalVolume,
      durationMinutes
    });

    // Create / Update PRs with the new sessionId
    const prResults = [];
    for (let i = 0; i < prOperations.length; i++) {
      const op = prOperations[i];
      if (op.type === 'create') {
        await workoutRepository.createPR({
          ...op.prData,
          sessionId: session._id
        });
      } else {
        const pr = op.prDoc;
        pr.maxWeight = op.prData.maxWeight;
        pr.repsAtMaxWeight = op.prData.repsAtMaxWeight;
        pr.sessionId = session._id;
        pr.achievedAt = new Date();
        await workoutRepository.savePR(pr);
      }
      prResults.push(newPRs[i]);
    }

    const xpResult = await awardXP(userId, 'workout_completed', 100);

    return { session, newPRs: prResults, xpResult };
  },

  getSessions: async (userId: string) => {
    return workoutRepository.findSessionsByUserId(userId);
  },

  getPRs: async (userId: string) => {
    return workoutRepository.findAllPRs(userId);
  },

  getVolumeHistory: async (userId: string) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90); 
    return workoutRepository.findVolumeHistory(userId, cutoff);
  }
};
