import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

interface SystemScanHUDProps {
  isScanning: boolean;
  inputText: string;
}

export const SystemScanHUD: React.FC<SystemScanHUDProps> = ({ isScanning, inputText }) => {
  const [dots, setDots] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isScanning) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProgress(0);
      return;
    }
    
    // Simulate progress bar filling up
    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(100, p + Math.random() * 15));
    }, 200);

    // Animating dots
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);

    return () => {
      clearInterval(progressInterval);
      clearInterval(dotsInterval);
    };
  }, [isScanning]);

  if (!isScanning) return null;

  return (
    <div className="w-full bg-[rgba(0,10,20,0.8)] border border-[rgba(0,212,255,0.3)] rounded p-6 my-6 relative overflow-hidden shadow-[0_0_20px_rgba(0,212,255,0.15)]">
      {/* Scanning laser line animation */}
      <div className="absolute left-0 right-0 h-[2px] bg-cyan-400 opacity-50 shadow-[0_0_10px_#00d4ff] top-0 animate-[scan_1.5s_ease-in-out_infinite]" />
      
      <div className="flex items-center gap-4 mb-4">
        <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
        <h2 className="font-display font-bold text-xl text-cyan-400 uppercase tracking-widest">System Scan</h2>
      </div>

      <div className="space-y-4">
        <div className="text-cyan-100 font-mono text-sm tracking-wider">
          <span className="text-cyan-500 mr-2">&gt;</span>
          Analyzing Target: <span className="text-white">"{inputText}"</span>
        </div>
        
        <div className="text-cyan-300 font-mono text-sm font-bold tracking-widest">
          PROCESSING{dots}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-gray-900 rounded-full border border-cyan-900 overflow-hidden relative">
          <div 
            className="h-full bg-cyan-500 shadow-[0_0_10px_#00d4ff] transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-cyan-600 font-mono uppercase">
          <span>Target Acquired</span>
          <span>Initiating Deep Scan</span>
          <span>Matching Database</span>
        </div>
      </div>
      
      {/* CSS for Scan Animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
};
