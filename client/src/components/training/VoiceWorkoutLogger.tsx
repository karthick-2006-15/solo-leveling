import React, { useState, useEffect, useRef } from 'react';
import { Mic } from 'lucide-react';

interface VoiceWorkoutLoggerProps {
  onVoiceCommand: (text: string) => void;
  disabled: boolean;
}

export const VoiceWorkoutLogger: React.FC<VoiceWorkoutLoggerProps> = ({ onVoiceCommand, disabled }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              onVoiceCommand(currentTranscript);
              setTranscript('');
            } else {
              setTranscript(currentTranscript);
            }
          }
        };

        recognitionRef.current.onend = () => setIsListening(false);
        recognitionRef.current.onerror = () => setIsListening(false);
      }
    }
    
    return () => {
      if (recognitionRef.current && isListening) recognitionRef.current.stop();
    };
  }, [onVoiceCommand, isListening]);

  const toggleListen = () => {
    if (disabled) return;
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        alert("Voice recognition is not supported in this browser.");
        return;
      }
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <div className="flex items-center gap-3 bg-black/60 border border-cyan-900/50 rounded-full p-2 pr-6 backdrop-blur-md shadow-[0_0_15px_rgba(8,145,178,0.2)]">
      <button 
        onClick={toggleListen}
        disabled={disabled}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
          isListening 
            ? 'bg-cyan-500 text-black shadow-[0_0_15px_#00d4ff]' 
            : 'bg-cyan-950/50 text-cyan-500 hover:bg-cyan-900 hover:text-cyan-300'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
      </button>
      
      <div className="font-mono text-[10px] uppercase tracking-widest text-cyan-400/80 min-w-[200px]">
        {isListening ? (
          transcript || 'Listening for target params...'
        ) : (
          'Voice Logger Ready'
        )}
      </div>
    </div>
  );
};
