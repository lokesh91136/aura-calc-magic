import React, { createContext, useContext, useState, useCallback } from 'react';

type Language = 'en-US' | 'hi-IN' | 'ta-IN' | 'kn-IN' | 'es-ES' | 'fr-FR';

interface VoiceContextType {
  isListening: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
  startListening: (onResult: (text: string) => void) => void;
  stopListening: () => void;
  speak: (text: string) => void;
  isSupported: boolean;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

const languageConfig = {
  'en-US': { name: 'English', voice: 'en-US' },
  'hi-IN': { name: 'हिंदी', voice: 'hi-IN' },
  'ta-IN': { name: 'தமிழ்', voice: 'ta-IN' },
  'kn-IN': { name: 'ಕನ್ನಡ', voice: 'kn-IN' },
  'es-ES': { name: 'Español', voice: 'es-ES' },
  'fr-FR': { name: 'Français', voice: 'fr-FR' },
};

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<Language>('en-US');
  const [recognition, setRecognition] = useState<any>(null);

  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = useCallback((onResult: (text: string) => void) => {
    if (!isSupported || typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0]?.transcript || '';
      onResult(transcript);
    };
    
    recognition.start();
    setRecognition(recognition);
  }, [language, isSupported]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  const speak = useCallback((text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  }, [language]);

  return (
    <VoiceContext.Provider value={{
      isListening,
      language,
      setLanguage,
      startListening,
      stopListening,
      speak,
      isSupported
    }}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within VoiceProvider');
  }
  return context;
}

export { languageConfig, type Language };