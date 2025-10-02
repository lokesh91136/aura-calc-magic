import React, { createContext, useContext, useState, useCallback } from 'react';
import { translate } from '@/utils/translations';

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
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Translate text to selected language
    const translatedText = translate(text, language);
    console.log('Speaking text:', translatedText, 'in language:', language);

    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = language;
    utterance.rate = 0.9;

    const assignBestVoice = () => {
      const voices = synth.getVoices();
      console.log('Available voices:', voices.map(v => ({ name: v.name, lang: v.lang })));
      
      // Try exact language match first
      let matchingVoice = voices.find(voice =>
        voice.lang === language || voice.lang.startsWith(language.split('-')[0])
      );
      
      // Kannada-specific fallback strategy
      if (!matchingVoice && language === 'kn-IN') {
        console.log('Primary Kannada voice not found, trying fallbacks...');
        
        // Try variations of Kannada
        matchingVoice = voices.find(voice => 
          voice.lang.toLowerCase().includes('kn') || 
          voice.name.toLowerCase().includes('kannada')
        );
        
        // If still not found, use any Indian language voice (Hindi, Tamil) as fallback
        if (!matchingVoice) {
          matchingVoice = voices.find(voice =>
            voice.lang.startsWith('hi-') || voice.lang.startsWith('ta-')
          );
          console.log('Using Indian language fallback voice for Kannada');
        }
      }
      
      // Similar fallback for other Indian languages
      if (!matchingVoice && (language === 'hi-IN' || language === 'ta-IN')) {
        const langCode = language.split('-')[0];
        matchingVoice = voices.find(voice => 
          voice.lang.toLowerCase().includes(langCode)
        );
      }
      
      if (matchingVoice) {
        console.log('Using voice:', matchingVoice.name, 'for language:', matchingVoice.lang);
        utterance.voice = matchingVoice;
      } else {
        console.log('No matching voice found for language:', language, 'using default but will still speak');
        // Even without perfect voice, we still speak the translated text
      }
    };

    assignBestVoice();

    utterance.onstart = () => console.log('Speech started');
    utterance.onend = () => console.log('Speech ended');
    utterance.onerror = (event) => console.log('Speech error:', (event as any).error);

    const speakNow = () => {
      // Cancel any queued/ongoing speech before speaking to prevent overlaps/loops
      try { synth.cancel(); } catch {}
      synth.speak(utterance);
    };

    if (synth.getVoices().length === 0) {
      synth.onvoiceschanged = () => {
        // One-time handler to avoid multiple speaks when event fires repeatedly
        synth.onvoiceschanged = null;
        assignBestVoice();
        speakNow();
      };
    } else {
      speakNow();
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