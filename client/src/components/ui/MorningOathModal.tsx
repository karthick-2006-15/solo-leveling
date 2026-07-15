import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { guardianApi } from '../../api/guardianApi';
import { ShieldCheck } from 'lucide-react';
import { useSystemSound } from '../../hooks/useSystemSound';

export const MorningOathModal = () => {
  const queryClient = useQueryClient();
  const { play } = useSystemSound();
  
  const { data } = useQuery({
    queryKey: ['guardianDashboard'],
    queryFn: guardianApi.getDashboard,
    staleTime: 5 * 60 * 1000
  });

  const acceptOathMutation = useMutation({
    mutationFn: guardianApi.acceptMorningOath,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardianDashboard'] });
      play('success');
    }
  });

  const profile = data?.profile;
  const isVisible = profile && !profile.morningOathAccepted;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="max-w-md w-full hud-glass p-8 text-center border-cyan-500/50"
        >
          <ShieldCheck className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl text-cyan-400 tracking-widest uppercase mb-4">Daily Oath</h2>
          
          <div className="space-y-4 mb-8">
            <p className="text-gray-300 font-mono text-sm leading-relaxed">
              "I commit to maintaining my guard today. I will not surrender my energy, focus, or potential to cheap dopamine."
            </p>
            <p className="text-cyan-500/70 font-mono text-xs italic">
              - The Hunter's Resolve
            </p>
          </div>

          <button
            onClick={() => acceptOathMutation.mutate()}
            disabled={acceptOathMutation.isPending}
            className="w-full py-4 bg-cyan-950/50 hover:bg-cyan-900/80 border border-cyan-400/50 rounded font-display text-lg uppercase tracking-widest text-cyan-300 transition-all active:scale-95 disabled:opacity-50"
          >
            {acceptOathMutation.isPending ? 'Confirming...' : 'I Accept'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
