import { Link } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { AlertTriangle } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <GlassCard className="max-w-md text-center p-8 border-red-500/30">
        <div className="flex justify-center mb-6">
          <AlertTriangle size={64} className="text-red-500 animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
          Uncharted Dungeon
        </h1>
        <p className="text-textMuted mb-8">
          Warning: You've entered an area that doesn't exist yet. The system cannot map this sector.
        </p>
        <Link to="/">
          <PrimaryButton>
            Return to Dashboard
          </PrimaryButton>
        </Link>
      </GlassCard>
    </div>
  );
};
