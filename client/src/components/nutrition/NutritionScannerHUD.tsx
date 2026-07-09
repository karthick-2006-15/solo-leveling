import React, { useEffect, useState, useRef } from 'react';
import { Mic, Activity, CheckCircle2 } from 'lucide-react';

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
  const [hudMessage, setHudMessage] = useState('TAP TO SPEAK or Hold to Record');
  
  // Scanning phases
  const [scanStep, setScanStep] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              setInputText(inputText + (inputText ? ' ' : '') + transcript);
            }
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          setHudMessage('VOICE CAPTURED ✓');
          setTimeout(() => setHudMessage('TAP TO SPEAK or Hold to Record'), 3000);
        };
        
        recognitionRef.current.onerror = (e: any) => {
          console.error("Speech Recognition Error:", e);
          setIsListening(false);
          setHudMessage('ERROR: CONNECTION LOST');
          setTimeout(() => setHudMessage('TAP TO SPEAK or Hold to Record'), 3000);
        };
      }
    }
    
    return () => {
      if (recognitionRef.current && isListening) recognitionRef.current.stop();
    };
  }, [inputText, setInputText, isListening]);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        alert("Voice recognition is not supported in this browser.");
        return;
      }
      setInputText('');
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(50);
      
      setHudMessage('SYSTEM ONLINE...');
      
      setTimeout(() => {
        if (recognitionRef.current) {
           recognitionRef.current.start();
           setIsListening(true);
           setHudMessage('SYSTEM LISTENING...');
        }
      }, 600);
    }
  };

  // Scanning sequence animation
  useEffect(() => {
    if (!isScanning) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScanStep(0);
      return;
    }
    
    setScanStep(1); // Identify
    const t1 = setTimeout(() => setScanStep(2), 600); // Parse qty
    const t2 = setTimeout(() => setScanStep(3), 1200); // Unit
    const t3 = setTimeout(() => setScanStep(4), 1800); // DB match
    
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
    };
  }, [isScanning]);

  return (
    <div className="relative w-full z-10 flex flex-col items-center">
      
      {/* Mobile Voice Input Section */}
      <div className="flex flex-col items-center w-full max-w-lg mx-auto bg-black/40 border border-cyan-900/50 rounded-xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md">
        
        {/* Hex Background pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyOCIgaGVpZ2h0PSI0OSIgdmlld0JveD0iMCAwIDI4IDQ5Ij48cGF0aCBmaWxsPSIjMDBkNGZmIiBkPSJNMTMuOTkgMTEuMjVMNSAyNi43OXYtMTUuNTRMMTMuOTkgNC4ydjcuMDV6TTI4IDI2Ljc5TTEzLjk5IDM3Ljc1TDIzIDEyLjJWMjcuNzRsLTkuMDEgMTB6Ii8+PC9zdmc+')] pointer-events-none" />

        {/* Large Circular Microphone */}
        <div className="relative mb-6">
          {isListening && (
            <>
              {/* Expanding Radar Rings */}
              <div className="absolute inset-0 rounded-full border border-cyan-400 animate-[ping_1.5s_infinite] opacity-60 scale-150" />
              <div className="absolute inset-0 rounded-full border border-cyan-500 animate-[ping_2s_infinite] opacity-40 scale-[2]" />
            </>
          )}
          
          <button 
            onClick={toggleListen}
            disabled={isScanning}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center border-2 transition-all duration-300 active:scale-95 ${
              isListening 
                ? 'bg-cyan-950 border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.6)]' 
                : 'bg-black/80 border-cyan-800 hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] animate-[pulse_3s_ease-in-out_infinite]'
            }`}
          >
            <Mic className={`w-10 h-10 ${isListening ? 'text-white animate-pulse' : 'text-cyan-500'}`} />
          </button>
        </div>

        {/* HUD Message & Waveform */}
        <div className="h-8 mb-4 flex flex-col items-center justify-center w-full">
          {isListening ? (
             <div className="flex gap-1 items-end h-6">
               {[1,2,3,4,5,6,7].map(i => (
                 <div key={i} className="w-1.5 bg-cyan-400 animate-[bounce_1s_infinite]" style={{ animationDelay: `${i * 0.1}s`, height: `${((i * 37) % 80) + 20}%` }} />
               ))}
             </div>
          ) : (
            <span className={`font-mono text-[12px] uppercase tracking-widest font-bold ${hudMessage.includes('✓') ? 'text-green-400' : 'text-cyan-500'}`}>
              {hudMessage}
            </span>
          )}
        </div>

        {/* Multiline Text Input */}
        <div className="w-full relative group mb-6">
          {/* Scanning Beam Effect */}
          {hudMessage === 'SYSTEM ONLINE...' && (
            <div className="absolute top-0 bottom-0 w-1 bg-cyan-300 animate-[scan_1s_ease-in-out_forwards] z-20 shadow-[0_0_10px_#00d4ff]" />
          )}

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isScanning}
            rows={3}
            placeholder="Speak or type your meal...&#10;&#10;Example:&#10;'2 boiled eggs and 1 banana'"
            className="w-full min-h-[80px] bg-black/60 border-2 border-cyan-900/60 group-hover:border-cyan-700 focus:border-cyan-500 rounded-lg p-4 font-mono text-[16px] text-white tracking-wide resize-none outline-none placeholder-cyan-900/60 transition-all shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] focus:shadow-[0_0_20px_rgba(0,212,255,0.15)] leading-relaxed"
          />
        </div>

        {/* Massive Analyze Button */}
        <button 
          onClick={() => {
            if (navigator.vibrate) navigator.vibrate(50);
            onAnalyze();
          }}
          disabled={isScanning || !inputText.trim()}
          className="w-full h-16 bg-cyan-950 border border-cyan-500 hover:bg-cyan-900 active:scale-[0.98] rounded-lg font-display font-bold uppercase tracking-[0.2em] text-[18px] text-cyan-300 hover:text-white transition-all shadow-[0_0_15px_rgba(0,212,255,0.1)] hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden"
        >
          {isScanning ? (
            <span className="animate-pulse">ANALYZING TARGET...</span>
          ) : (
            <span>ANALYZE</span>
          )}
          {/* Button Shine */}
          <div className="absolute top-0 -bottom-full w-12 bg-white/20 skew-x-[-20deg] -translate-x-[200%] animate-[shimmer_3s_infinite]" />
        </button>
      </div>

      {/* Premium Analysis Card (Replaces Full-screen Radar) */}
      {isScanning && (
        <div className="w-full max-w-lg mt-6 animate-[fade-in_0.3s_ease-out]">
          <div className="bg-black/80 border border-cyan-800 rounded-lg p-6 relative overflow-hidden shadow-[0_0_30px_rgba(0,212,255,0.1)] backdrop-blur-xl">
            {/* Scanning line inside card */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_15px_#00d4ff] animate-[scan-vertical_2s_linear_infinite]" />
            
            <h3 className="font-display text-2xl text-cyan-400 tracking-[0.2em] uppercase mb-6 flex items-center gap-3 border-b border-cyan-900/50 pb-4">
              <Activity className="w-6 h-6 animate-pulse" /> SYSTEM SCAN
            </h3>

            <div className="space-y-4 font-mono text-[14px] tracking-widest uppercase">
              <div className={`flex items-center gap-3 transition-all duration-500 ${scanStep >= 1 ? 'text-white translate-x-0 opacity-100' : 'text-gray-700 -translate-x-4 opacity-0'}`}>
                <CheckCircle2 className="w-5 h-5 text-cyan-500" /> Food Identified
              </div>
              <div className={`flex items-center gap-3 transition-all duration-500 ${scanStep >= 2 ? 'text-white translate-x-0 opacity-100' : 'text-gray-700 -translate-x-4 opacity-0'}`}>
                <CheckCircle2 className="w-5 h-5 text-cyan-500" /> Quantity Parsed
              </div>
              <div className={`flex items-center gap-3 transition-all duration-500 ${scanStep >= 3 ? 'text-white translate-x-0 opacity-100' : 'text-gray-700 -translate-x-4 opacity-0'}`}>
                <CheckCircle2 className="w-5 h-5 text-cyan-500" /> Unit Parsed
              </div>
              <div className={`flex items-center gap-3 transition-all duration-500 ${scanStep >= 4 ? 'text-white translate-x-0 opacity-100' : 'text-gray-700 -translate-x-4 opacity-0'}`}>
                <CheckCircle2 className="w-5 h-5 text-cyan-500" /> Database Match
              </div>
            </div>

            <div className={`mt-8 pt-4 border-t border-cyan-900/50 flex justify-between items-end transition-all duration-500 delay-500 ${scanStep >= 4 ? 'opacity-100' : 'opacity-0'}`}>
              <span className="text-[10px] text-cyan-600 font-mono tracking-widest uppercase">DATA SYNCHRONIZED</span>
              <span className="text-[18px] text-cyan-400 font-display tracking-wider">Confidence: 98%</span>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { transform: translateX(0); }
          100% { transform: translateX(400px); }
        }
        @keyframes scan-vertical {
          0% { transform: translateY(0); }
          100% { transform: translateY(300px); }
        }
      `}} />
    </div>
  );
};
