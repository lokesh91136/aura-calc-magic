import React, { createContext, useContext, useState, useCallback } from 'react';
import { translate } from '@/utils/translations';

type Language = 'en-IN' | 'hi-IN' | 'ta-IN' | 'kn-IN' | 'te-IN' | 'es-ES' | 'fr-FR';

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
  'en-IN': { name: 'English', voice: 'en-IN' },
  'hi-IN': { name: 'हिंदी', voice: 'hi-IN' },
  'ta-IN': { name: 'தமிழ்', voice: 'ta-IN' },
  'kn-IN': { name: 'ಕನ್ನಡ', voice: 'kn-IN' },
  'te-IN': { name: 'తెలుగు', voice: 'te-IN' },
  'es-ES': { name: 'Español', voice: 'es-ES' },
  'fr-FR': { name: 'Français', voice: 'fr-FR' },
};

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState<Language>('en-IN');
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
    recognition.maxAlternatives = 1;
    
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
      
      // Handle specific errors without auto-restart
      if (event.error === 'no-speech') {
        onResult('__NO_SPEECH__');
      } else if (event.error === 'audio-capture' || event.error === 'not-allowed') {
        onResult('__AUDIO_ERROR__');
      } else if (event.error === 'aborted') {
        // User manually stopped - don't show error
        return;
      } else {
        onResult('__RECOGNITION_ERROR__');
      }
    };
    
    recognition.onresult = (event: any) => {
      console.log('Speech recognition result event:', event);
      const transcript = event.results[0]?.transcript?.trim() || '';
      console.log('Transcript received:', transcript);
      
      // Stop listening immediately after getting result
      setIsListening(false);
      
      // Handle empty or missing transcript
      if (!transcript || transcript === '') {
        console.log('Empty transcript received');
        onResult('__EMPTY_TRANSCRIPT__');
      } else {
        onResult(transcript);
      }
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
      
      // For Kannada, ONLY use kn-IN voices - no fallbacks
      if (language === 'kn-IN') {
        const kannadaVoice = voices.find(voice =>
          voice.lang === 'kn-IN' || 
          voice.lang.toLowerCase().includes('kn') || 
          voice.name.toLowerCase().includes('kannada')
        );
        
        if (kannadaVoice) {
          console.log('Using Kannada voice:', kannadaVoice.name);
          utterance.voice = kannadaVoice;
        } else {
          console.error('Kannada voice not available');
          // Show error message instead of speaking in wrong language
          const errorMsg = translate('Kannada voice not available', language);
          console.log(errorMsg);
          return; // Don't speak if no Kannada voice
        }
      } else {
        // Try exact match first
        let matchingVoice = voices.find(voice =>
          voice.lang === language
        );
        
        // For Indian languages (including English), try broader match
        if (!matchingVoice && (language === 'en-IN' || language === 'hi-IN' || language === 'ta-IN' || language === 'te-IN')) {
          const langCode = language.split('-')[0];
          matchingVoice = voices.find(voice => 
            voice.lang.toLowerCase().includes(langCode) ||
            voice.lang.startsWith(langCode)
          );
        }
        
        // For other languages, try language code match
        if (!matchingVoice) {
          const langCode = language.split('-')[0];
          matchingVoice = voices.find(voice =>
            voice.lang.startsWith(langCode)
          );
        }
        
        if (matchingVoice) {
          console.log('Using voice:', matchingVoice.name, 'for language:', matchingVoice.lang);
          utterance.voice = matchingVoice;
        } else {
          console.log('No matching voice found for language:', language, 'using default');
        }
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
    console.warn('useVoice must be used within VoiceProvider - falling back to no-op context');
    // Graceful fallback to prevent runtime crash if provider is missing
    return {
      isListening: false,
      language: 'en-IN' as Language,
      setLanguage: () => {},
      startListening: () => {},
      stopListening: () => {},
      speak: () => {},
      isSupported: false,
    } as VoiceContextType;
  }
  return context;
}

export { languageConfig, type Language };