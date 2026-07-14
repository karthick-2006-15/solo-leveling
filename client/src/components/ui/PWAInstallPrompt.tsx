import React, { useEffect, useState } from 'react';
import { GlassCard } from './GlassCard';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed', platform: string }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Only show if user hasn't explicitly dismissed it recently
    const hasDismissed = sessionStorage.getItem('pwa-prompt-dismissed');
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!hasDismissed) {
        // Delay prompt slightly to not interrupt immediate boot
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the PWA install');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md transform transition-all animate-in zoom-in-95 duration-500">
        <GlassCard className="relative overflow-hidden border border-neonBlue shadow-[0_0_30px_rgba(0,212,255,0.2)]">
          {/* Ambient Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[150%] bg-neonBlue/10 blur-[100px] pointer-events-none" />
          
          <button 
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-textMuted hover:text-white transition-colors z-10"
          >
            <X size={20} />
          </button>
          
          <div className="relative z-10 flex flex-col items-center text-center p-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-900 to-black border border-neonBlue flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.3)] mb-6 relative group">
              <Download size={32} className="text-neonBlue group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 rounded-2xl border border-neonBlue animate-ping opacity-20" />
            </div>
            
            <h2 className="text-2xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-neonBlue to-white mb-2 uppercase tracking-widest">
              System Integration
            </h2>
            
            <p className="text-textMuted text-sm mb-8 leading-relaxed">
              Install the Solo Leveling Life System directly to your device for offline access, enhanced performance, and fullscreen immersion.
            </p>
            
            <div className="flex flex-col w-full gap-3">
              <button 
                onClick={handleInstall}
                className="w-full bg-neonBlue text-black font-bold py-3 px-6 rounded relative overflow-hidden group hover:shadow-[0_0_20px_rgba(0,212,255,0.5)] transition-all"
              >
                <span className="relative z-10">INITIALIZE INSTALLATION</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
              </button>
              
              <button 
                onClick={handleDismiss}
                className="w-full bg-transparent border border-white/10 text-textMuted hover:text-white hover:bg-white/5 font-bold py-3 px-6 rounded transition-all uppercase text-sm tracking-widest"
              >
                Later
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
