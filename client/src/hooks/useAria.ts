import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ariaApi } from '../api/ariaApi';

export const useAriaChat = () => {
  return useMutation({
    mutationFn: (message: string) => ariaApi.chat(message),
  });
};

export const useAriaReports = () => {
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ['ariaReports'],
    queryFn: async () => {
      const res = await ariaApi.getReports();
      return res.data.reports;
    }
  });

  const generateMorning = useMutation({
    mutationFn: () => ariaApi.getMorningReport(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ariaReports'] })
  });

  const generateEvening = useMutation({
    mutationFn: () => ariaApi.getEveningReport(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ariaReports'] })
  });

  const getPredictions = useQuery({
    queryKey: ['ariaPredictions'],
    queryFn: async () => {
      const response = await ariaApi.getPredictions();
      return response.data;
    },
  });

  const getPlans = useQuery({
    queryKey: ['ariaPlans'],
    queryFn: async () => {
      const response = await ariaApi.getPlans();
      return response.data;
    },
  });

  const getDecision = useQuery({
    queryKey: ['ariaDecision'],
    queryFn: async () => {
      const response = await ariaApi.getDecision();
      return response.data;
    },
  });

  const getKnowledge = useQuery({
    queryKey: ['ariaKnowledge'],
    queryFn: async () => {
      const response = await ariaApi.getKnowledge();
      return response.data;
    },
  });

  const runPredictionSweep = useMutation({
    mutationFn: () => ariaApi.runPredictionSweep(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ariaPredictions'] })
  });

  const createPlan = useMutation({
    mutationFn: ({ type, goal }: { type: string, goal: string }) => ariaApi.createPlan(type, goal),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ariaPlans'] })
  });

  const getSchedule = useMutation({
    mutationFn: () => ariaApi.getSchedule(),
  });

  return {
    reports,
    isLoading,
    generateMorning,
    generateEvening,
    predictions: getPredictions.data?.predictions,
    isLoadingPredictions: getPredictions.isLoading,
    runPredictionSweep,
    plans: getPlans.data?.plans,
    isLoadingPlans: getPlans.isLoading,
    createPlan,
    decision: getDecision.data?.decision,
    isLoadingDecision: getDecision.isLoading,
    getSchedule,
    knowledge: getKnowledge.data?.nodes,
    isLoadingKnowledge: getKnowledge.isLoading,
  };
};

export const useAriaMemory = () => {
  return useQuery({
    queryKey: ['ariaMemory'],
    queryFn: async () => {
      const res = await ariaApi.getMemory();
      return res.data.memory;
    }
  });
};
