import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { GlassCard } from './ui/GlassCard';
import { PrimaryButton } from './ui/PrimaryButton';
import { AlertOctagon } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
          <GlassCard className="max-w-md w-full text-center p-8 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <div className="flex justify-center mb-6">
              <AlertOctagon size={64} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-white">System Malfunction</h1>
            <p className="text-red-400 text-sm mb-6 bg-red-500/10 p-3 rounded text-left overflow-auto max-h-32">
              {this.state.error?.message || 'Unknown error occurred in the UI.'}
            </p>
            <PrimaryButton onClick={() => window.location.href = '/'}>
              Reboot Interface
            </PrimaryButton>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}
