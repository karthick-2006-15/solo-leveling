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
    const prDocsToSave = [];

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
          const prData = {
            userId: userId as any,
            exerciseName: exerciseNameLower,
            maxWeight: maxWeightInSet,
            repsAtMaxWeight,
          };
          const createdPr = await workoutRepository.createPR(prData);
          newPRs.push({ exerciseName: ex.name, maxWeight: maxWeightInSet, reps: repsAtMaxWeight });
          prDocsToSave.push(createdPr);
        } else if (maxWeightInSet > pr.maxWeight) {
          // Updated PR
          pr.maxWeight = maxWeightInSet;
          pr.repsAtMaxWeight = repsAtMaxWeight;
          pr.achievedAt = new Date();
          newPRs.push({ exerciseName: ex.name, maxWeight: maxWeightInSet, reps: repsAtMaxWeight });
          prDocsToSave.push(pr);
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

    // Update PRs with the new sessionId
    const prResults = [];
    for (let i = 0; i < prDocsToSave.length; i++) {
      const prDoc = prDocsToSave[i];
      prDoc.sessionId = session._id;
      await workoutRepository.savePR(prDoc);
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
