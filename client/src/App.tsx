import { Suspense, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { BottomNav } from './components/layout/BottomNav';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { MissionToastManager } from './components/ui/MissionToastManager';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AnimatedRoutes } from './components/AnimatedRoutes';
import { GlobalFloatingAIButton } from './components/ui/GlobalFloatingAIButton';
import { SystemBootSequence } from './components/ui/SystemBootSequence';
import { LevelUpCinematic } from './components/ui/LevelUpCinematic';
import { BossWarning } from './components/ui/BossWarning';
import { DungeonPortal } from './components/ui/DungeonPortal';
import { HunterTrainingBackground } from './components/training/HunterTrainingBackground';
import { SettingsProvider } from './contexts/SettingsContext';
import { GlobalThemeState } from './components/ui/GlobalThemeState';
import { PWAInstallPrompt } from './components/ui/PWAInstallPrompt';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
      retryDelay: (attempt) => Math.min(attempt * 2000, 10000), // Exponential backoff
    },
  },
});

function App() {
  // Check if we've already booted this session
  const [hasBooted, setHasBooted] = useState(() => {
    return localStorage.getItem('systemBooted') === 'true';
  });

  const handleBootComplete = () => {
    localStorage.setItem('systemBooted', 'true');
    setHasBooted(true);
  };

  return (
    <SettingsProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <GlobalThemeState />
          {/* Cinematic Overlays */}
          <LevelUpCinematic />
          <BossWarning />
          <DungeonPortal />
          <PWAInstallPrompt />

          <div className="min-h-screen flex flex-col relative overflow-hidden bg-[var(--color-system-black)] pb-safe md:pb-0 md:pt-16 selection:bg-cyan-900 selection:text-white">
            
            {!hasBooted && <SystemBootSequence onComplete={handleBootComplete} />}
            
            {/* Global Dynamic Background replacing the simple ParticleField */}
            <div className="fixed inset-0 pointer-events-none z-0">
              <HunterTrainingBackground />
            </div>

            <Toaster 
              position="bottom-right" 
              toastOptions={{ 
                style: { 
                  background: 'rgba(5, 10, 20, 0.9)', 
                  color: '#00d4ff', 
                  border: '1px solid rgba(0, 212, 255, 0.4)', 
                  backdropFilter: 'blur(12px)',
                  fontFamily: 'JetBrains Mono, monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontSize: '12px'
                } 
              }} 
            />
            <MissionToastManager />
            
            <div className="relative z-10 flex flex-col flex-grow w-full">
              <BottomNav />
              <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full relative">
                
                {/* Global Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none mix-blend-screen" />

                <ErrorBoundary>
                  <Suspense fallback={
                    <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-[100]">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 border-4 border-cyan-900 border-t-cyan-400 rounded-full animate-spin mb-4" />
                        <h2 className="font-mono text-sm text-cyan-500 uppercase tracking-[0.3em] animate-pulse">Initializing Component...</h2>
                      </div>
                    </div>
                  }>
                    <AnimatedRoutes />
                  </Suspense>
                </ErrorBoundary>
              </main>
              <GlobalFloatingAIButton />
            </div>

          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </SettingsProvider>
  );
}

export default App;
