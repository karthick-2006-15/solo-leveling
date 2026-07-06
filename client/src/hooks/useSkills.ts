import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchSkills, addCustomSkill, editSkillNotes, addResource, deleteResource, 
  addMilestone, completeMilestone, logStudySession 
} from '../api/skillApi';

import { useAuthStore } from '../store/useAuthStore';

export const useSkills = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  const skillsQuery = useQuery({ queryKey: ['skills'], queryFn: fetchSkills, enabled: isAuthenticated });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['skills'] });
  const invalidateAll = () => {
    invalidate();
    queryClient.invalidateQueries({ queryKey: ['progression'] });
  };

  const addSkillMut = useMutation({ mutationFn: addCustomSkill, onSuccess: invalidate });
  const editNotesMut = useMutation({ mutationFn: ({ id, notes }: any) => editSkillNotes(id, notes), onSuccess: invalidate });
  const addResourceMut = useMutation({ mutationFn: ({ id, resource }: any) => addResource(id, resource), onSuccess: invalidate });
  const delResourceMut = useMutation({ mutationFn: ({ id, resourceId }: any) => deleteResource(id, resourceId), onSuccess: invalidate });
  const addMilestoneMut = useMutation({ mutationFn: ({ id, milestone }: any) => addMilestone(id, milestone), onSuccess: invalidate });
  const compMilestoneMut = useMutation({ mutationFn: ({ id, milestoneId }: any) => completeMilestone(id, milestoneId), onSuccess: invalidateAll });
  const studySessionMut = useMutation({ mutationFn: logStudySession, onSuccess: invalidateAll });

  return {
    skills: skillsQuery.data || [],
    isLoading: skillsQuery.isLoading,
    addSkill: addSkillMut.mutateAsync,
    editNotes: editNotesMut.mutateAsync,
    addResource: addResourceMut.mutateAsync,
    deleteResource: delResourceMut.mutateAsync,
    addMilestone: addMilestoneMut.mutateAsync,
    completeMilestone: compMilestoneMut.mutateAsync,
    logStudySession: studySessionMut.mutateAsync
  };
};
