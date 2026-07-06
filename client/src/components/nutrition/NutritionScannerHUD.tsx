import React, { useEffect, useState, useRef } from 'react';
import { Mic, Activity } from 'lucide-react';

interface NutritionScannerHUDProps {
  isScanning: boolean;
  inputText: string;
  setInputText: (text: string) => void;
  onAnalyze: () => void;
}

export const NutritionScannerHUD: React.FC<NutritionScannerHUDProps> = ({ 
  isScanning, 
  inputText, 
  setInputText,
  onAnalyze
}) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [loadingPhase, setLoadingPhase] = useState('Scanning Food...');

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              setInputText(inputText + (inputText ? ' ' : '') + transcript);
            } else {
              interimTranscript += transcript;
            }
          }
          // Note: Full UI updates with interimTranscript could be handled here if needed
        };

        recognitionRef.current.onend = () => setIsListening(false);
        recognitionRef.current.onerror = (e: any) => {
          console.error("Speech Recognition Error:", e);
          setIsListening(false);
        };
      }
    }
    
    return () => {
      if (recognitionRef.current && isListening) recognitionRef.current.stop();
    };
  }, [inputText, setInputText]);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        alert("Voice recognition is not supported in this browser.");
        return;
      }
      setInputText(''); // clear on new listen for better UX
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Rotating loading text when scanning
  useEffect(() => {
    if (!isScanning) return;
    const phases = ['Scanning Target...', 'Reading Database...', 'Calculating Macros...', 'Hunter System Analysis Complete'];
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < phases.length) setLoadingPhase(phases[step]);
    }, 600);
    return () => clearInterval(interval);
  }, [isScanning]);

  return (
    <div className="relative w-full z-10">
      
      {/* Search Input Bar */}
      <div className="flex gap-4 items-center">
        {/* Voice Button */}
        <button 
          onClick={toggleListen}
          disabled={isScanning}
          className={`relative flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-300 ${
            isListening 
              ? 'bg-cyan-900 border-cyan-400 shadow-[0_0_20px_#00d4ff]' 
              : 'bg-black/60 border-cyan-800 hover:border-cyan-500 hover:bg-cyan-950/50'
          }`}
        >
          {isListening && (
            <div className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-50" />
          )}
          <Mic className={`w-6 h-6 ${isListening ? 'text-white animate-pulse' : 'text-cyan-500'}`} />
        </button>

        {/* Text Input */}
        <div className="flex-1 relative group">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isScanning}
            placeholder={isListening ? "Listening..." : "Target parameters (e.g. '2 bananas')"}
            className="w-full h-16 bg-black/60 border border-cyan-900/80 group-hover:border-cyan-700 focus:border-cyan-500 rounded px-6 font-mono text-white tracking-widest uppercase transition-all shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] focus:shadow-[0_0_15px_rgba(0,212,255,0.2)] outline-none placeholder-cyan-900"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
             {isListening && (
               <div className="flex gap-1 items-center h-4">
                 {[1,2,3,4,5].map(i => (
                   <div key={i} className="w-1 bg-cyan-400 animate-[bounce_1s_infinite]" style={{ animationDelay: `${i * 0.1}s` }} />
                 ))}
               </div>
             )}
          </div>
        </div>

        {/* Analyze Button */}
        <button 
          onClick={onAnalyze}
          disabled={isScanning || !inputText.trim()}
          className="flex-shrink-0 h-16 px-8 bg-cyan-950 border border-cyan-500 hover:bg-cyan-900 rounded font-display font-bold uppercase tracking-[0.2em] text-cyan-400 hover:text-white transition-all shadow-[0_0_10px_rgba(0,212,255,0.1)] hover:shadow-[0_0_20px_rgba(0,212,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isScanning ? 'Scanning...' : 'Analyze'}
        </button>
      </div>

      {/* Full screen Radar Overlay when scanning */}
      {isScanning && (
        <div className="fixed inset-0 z-50 bg-[#00050b]/80 backdrop-blur-md flex flex-col items-center justify-center animate-[fade-in_0.3s_ease-out]">
          
          <div className="relative w-64 h-64 rounded-full border border-cyan-500/30 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 rounded-full border border-cyan-500/10 scale-75" />
            <div className="absolute inset-0 rounded-full border border-cyan-500/5 scale-50" />
            
            <Activity className="w-12 h-12 text-cyan-400 absolute z-10 animate-pulse" />
            
            {/* Radar Sweep */}
            <div 
              className="absolute inset-0 bg-gradient-to-tr from-cyan-400/0 via-cyan-400/10 to-cyan-400/40 origin-center animate-[spin_2s_linear_infinite]"
              style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 50%)' }}
            />
          </div>

          <div className="mt-8 text-center">
            <h2 className="font-display text-2xl text-cyan-400 tracking-[0.3em] uppercase animate-pulse">
              System Scan
            </h2>
            <p className="font-mono text-cyan-100/50 mt-2 tracking-widest text-[12px] uppercase">
              {loadingPhase}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
