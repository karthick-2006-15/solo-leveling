import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { useStory } from '../hooks/useDungeons';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export const Story: React.FC = () => {
  const { chapters, isLoading } = useStory();

  if (isLoading) {
    return <div className="p-6 text-cyan-400 font-mono animate-pulse">Decrypting System Logs...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-black">
      <PageHeader
        title="System Logs"
        subtitle="The story of your Awakening."
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-20">
          {!chapters || chapters.length === 0 ? (
            <div className="text-center py-20">
              <Lock className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 font-mono uppercase tracking-widest">All System Logs Locked.</p>
              <p className="text-gray-600 text-sm mt-2">Level up to decrypt your story.</p>
            </div>
          ) : (
            chapters.map((chapter: any, index: number) => (
              <motion.div
                key={chapter._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-black/60 border border-[var(--color-system-border)] rounded-xl p-8 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
                
                <p className="text-cyan-400 font-mono text-sm uppercase tracking-widest mb-2">
                  Chapter {chapter.chapterNumber}
                </p>
                <h2 className="text-3xl font-display font-bold uppercase tracking-widest text-white mb-6">
                  {chapter.title}
                </h2>
                
                <div className="prose prose-invert prose-cyan max-w-none">
                  {/* For simplicity we split by double newline, a real markdown renderer could be used */}
                  {chapter.content.split('\n\n').map((paragraph: string, i: number) => (
                    <p key={i} className={`text-gray-300 leading-relaxed ${paragraph.startsWith('#') ? 'text-2xl font-display text-white mb-4' : 'mb-4'}`}>
                      {paragraph.replace(/^#\s*/, '')}
                    </p>
                  ))}
                </div>
                
                <div className="mt-8 text-right text-xs font-mono text-gray-600 uppercase tracking-widest">
                  Unlocked: {new Date(chapter.unlockedAt).toLocaleDateString()}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
