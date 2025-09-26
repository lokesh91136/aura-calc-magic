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
    if (!isSupported || typeof window === 'undefined') {
      console.log('Speech recognition not supported or no window');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.log('SpeechRecognition not available');
      return;
    }
    
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language;
    
    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsListening(true);
    };
    
    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsListening(false);
    };
    
    recognition.onerror = (event: any) => {
      console.log('Speech recognition error:', event.error);
      setIsListening(false);
    };
    
    recognition.onresult = (event: any) => {
      console.log('Speech recognition result event:', event);
      const transcript = event.results[0]?.transcript || '';
      console.log('Transcript received:', transcript);
      onResult(transcript);
    };
    
    try {
      recognition.start();
      setRecognition(recognition);
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
    }
  }, [language, isSupported]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  const speak = useCallback((text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      console.log('Speaking text:', text, 'in language:', language);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9;
      
      // Get available voices and try to find the best match for the selected language
      const voices = speechSynthesis.getVoices();
      console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })));
      
      // Find voice that matches the current language
      const matchingVoice = voices.find(voice => 
        voice.lang === language || 
        voice.lang.startsWith(language.split('-')[0])
      );
      
      if (matchingVoice) {
        console.log('Using voice:', matchingVoice.name, 'for language:', matchingVoice.lang);
        utterance.voice = matchingVoice;
      } else {
        console.log('No matching voice found for language:', language, 'using default');
      }
      
      utterance.onstart = () => console.log('Speech started');
      utterance.onend = () => console.log('Speech ended');
      utterance.onerror = (event) => console.log('Speech error:', event.error);
      
      // Ensure voices are loaded before speaking
      if (voices.length === 0) {
        speechSynthesis.onvoiceschanged = () => {
          const newVoices = speechSynthesis.getVoices();
          const newMatchingVoice = newVoices.find(voice => 
            voice.lang === language || 
            voice.lang.startsWith(language.split('-')[0])
          );
          if (newMatchingVoice) {
            utterance.voice = newMatchingVoice;
          }
          speechSynthesis.speak(utterance);
        };
      } else {
        speechSynthesis.speak(utterance);
      }
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