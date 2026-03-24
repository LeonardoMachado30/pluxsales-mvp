
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Mic, MicOff, Loader2, Sparkles, Volume2 } from 'lucide-react';

interface AuraVoiceAssistantProps {
  onCommand: (command: string, params: any) => void;
}

export const AuraVoiceAssistant: React.FC<AuraVoiceAssistantProps> = ({ onCommand }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const sessionRef = useRef<any>(null);

  const startSession = async () => {
    setIsConnecting(true);
    // Use the API key directly from environment variables as per guidelines.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      const session = await ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: 'Você é a Aura, assistente de voz do sistema PluxSales. Você deve ajudar o atendente a gerenciar o pedido. Comandos suportados: "adicionar [item]", "remover [item]", "finalizar pedido". Responda de forma curta e gentil.',
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        },
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
          },
          onmessage: (msg) => {
            // Safely access transcription text using optional chaining as per guidelines.
            if (msg.serverContent?.inputTranscription?.text) {
              const text = msg.serverContent.inputTranscription.text.toLowerCase();
              console.log("Transcrição:", text);
              if (text.includes("adicionar")) onCommand("ADD", text.replace("adicionar", "").trim());
              if (text.includes("remover")) onCommand("REMOVE", text.replace("remover", "").trim());
              if (text.includes("finalizar")) onCommand("CHECKOUT", null);
            }
          },
          onclose: () => setIsActive(false),
          onerror: (e) => { 
            console.error("Live API Error", e);
            setIsActive(false); 
            setIsConnecting(false); 
          }
        }
      });
      sessionRef.current = session;
    } catch (e) {
      console.error(e);
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsActive(false);
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-3xl border border-white/10">
      <div className={`p-3 rounded-2xl transition-all ${isActive ? 'bg-indigo-500 animate-pulse shadow-lg shadow-indigo-500/20' : 'bg-slate-700'}`}>
        {isActive ? <Volume2 className="w-5 h-5 text-white" /> : <Sparkles className="w-5 h-5 text-indigo-400" />}
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Aura Voice Assistant</p>
        <p className="text-xs font-bold text-white">{isActive ? 'Ouvindo comandos...' : isConnecting ? 'Conectando...' : 'IA Inativa'}</p>
      </div>
      <button 
        onClick={isActive ? stopSession : startSession}
        disabled={isConnecting}
        className={`p-3 rounded-xl transition-all ${isActive ? 'bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
      >
        {isConnecting ? <Loader2 className="w-5 h-5 animate-spin" /> : isActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>
    </div>
  );
};
