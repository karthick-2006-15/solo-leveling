import { fetchWithAuth } from './fetchHelper';
import { type AwardXPResult } from './progressionApi';

export interface ExerciseSet {
  reps: number;
  weight: number;
}

export interface Exercise {
  name: string;
  targetSets: number;
  targetReps: number;
  targetWeight: number;
  restTimeSeconds: number;
}

export interface Routine {
  _id: string;
  name: string;
  splitType: string;
  exercises: Exercise[];
}

export interface SessionPayload {
  routineId?: string;
  durationMinutes?: number;
  exercises: Array<{
    name: string;
    restTimeSeconds: number;
    sets: ExerciseSet[];
  }>;
}

const API_BASE = '/api/workouts';

export const fetchRoutines = async (): Promise<Routine[]> => {
  const res = await fetchWithAuth(`${API_BASE}/routines`);
  const data = await res.json();
  return data.routines;
};

export const createRoutine = async (routineData: Omit<Routine, '_id'>): Promise<Routine> => {
  const res = await fetchWithAuth(`${API_BASE}/routines`, {
    method: 'POST',
    body: JSON.stringify(routineData)
  });
  const data = await res.json();
  return data.routine;
};

export const updateRoutine = async (id: string, routineData: Partial<Routine>): Promise<Routine> => {
  const res = await fetchWithAuth(`${API_BASE}/routines/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(routineData)
  });
  const data = await res.json();
  return data.routine;
};

export const deleteRoutine = async (id: string): Promise<void> => {
  await fetchWithAuth(`${API_BASE}/routines/${id}`, {
    method: 'DELETE'
  });
};

export const logSession = async (sessionData: SessionPayload): Promise<{ session: any, newPRs: any[], xpResult: AwardXPResult }> => {
  const res = await fetchWithAuth(`${API_BASE}/sessions`, {
    method: 'POST',
    body: JSON.stringify(sessionData)
  });
  return await res.json();
};

export const fetchSessions = async (): Promise<any[]> => {
  const res = await fetchWithAuth(`${API_BASE}/sessions`);
  const data = await res.json();
  return data.sessions;
};

export const fetchVolume = async (): Promise<any[]> => {
  const res = await fetchWithAuth(`${API_BASE}/volume`);
  const data = await res.json();
  return data.sessions;
};

export const fetchPRs = async (): Promise<any[]> => {
  const res = await fetchWithAuth(`${API_BASE}/prs`);
  const data = await res.json();
  return data.prs;
};
