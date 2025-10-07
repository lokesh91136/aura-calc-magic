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
      console.log('🎤 Speech recognition started | Language:', language);
      setIsListening(true);
    };
    
    recognition.onend = () => {
      console.log('🎤 Speech recognition ended | Language:', language);
      setIsListening(false);
    };
    
    recognition.onerror = (event: any) => {
      console.log('🎤 Speech recognition error:', event.error, '| Language:', language);
      setIsListening(false);
      
      // Handle specific errors without auto-restart
      if (event.error === 'no-speech') {
        console.log('⚠️ No speech detected');
        onResult('__NO_SPEECH__');
      } else if (event.error === 'audio-capture' || event.error === 'not-allowed') {
        console.log('❌ Audio capture error or permission denied');
        onResult('__AUDIO_ERROR__');
      } else if (event.error === 'aborted') {
        // User manually stopped - don't show error
        console.log('⏹️ Recognition aborted by user');
        return;
      } else {
        console.log('⚠️ Unknown error, treating as no speech');
        onResult('__NO_SPEECH__');
      }
    };
    
    recognition.onresult = (event: any) => {
      console.log('🎤 Speech recognition result event | Language:', language);
      const transcript = event.results[0]?.transcript?.trim() || '';
      console.log('✅ Transcript received:', transcript, '| Length:', transcript.length);
      
      // Stop listening immediately after getting result
      setIsListening(false);
      
      // Handle empty, missing, or too short transcript (background noise)
      if (!transcript || transcript === '' || transcript.length < 2) {
        console.log('⚠️ Empty or too short transcript - likely background noise');
        onResult('__NO_SPEECH__');
      } else {
        console.log('✅ Valid transcript - processing:', transcript);
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
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.log('Speech synthesis not supported');
      return;
    }

    // Translate text to selected language
    const translatedText = translate(text, language);
    console.log('🎤 Voice Assistant - Speaking:', translatedText, '| Language:', language);

    const synth = window.speechSynthesis;
    
    // Cancel any ongoing speech immediately to prevent loops/overlaps
    try {
      synth.cancel();
    } catch (e) {
      console.error('Error canceling speech:', e);
    }

    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.volume = 1.0;

    const assignBestVoice = (): boolean => {
      const voices = synth.getVoices();
      console.log('🔊 Available voices:', voices.length, '| Searching for:', language);
      
      // For Kannada, find kn-IN voices
      if (language === 'kn-IN') {
        const kannadaVoice = voices.find(voice =>
          voice.lang === 'kn-IN' || 
          voice.lang.toLowerCase().startsWith('kn') || 
          voice.name.toLowerCase().includes('kannada')
        );
        
        if (kannadaVoice) {
          console.log('✅ Using Kannada voice:', kannadaVoice.name, '| Lang:', kannadaVoice.lang);
          utterance.voice = kannadaVoice;
          return true;
        } else {
          console.error('❌ Kannada voice not available on this device');
          return false;
        }
      }
      
      // For other Indian languages, try exact match first
      if (language === 'en-IN' || language === 'hi-IN' || language === 'ta-IN' || language === 'te-IN') {
        let matchingVoice = voices.find(voice => voice.lang === language);
        
        // Try broader language code match
        if (!matchingVoice) {
          const langCode = language.split('-')[0];
          matchingVoice = voices.find(voice => 
            voice.lang.toLowerCase().includes(langCode) ||
            voice.lang.toLowerCase().startsWith(langCode)
          );
        }
        
        if (matchingVoice) {
          console.log('✅ Using voice:', matchingVoice.name, '| Lang:', matchingVoice.lang);
          utterance.voice = matchingVoice;
          return true;
        }
      }
      
      // For other languages (Spanish, French, etc.)
      const langCode = language.split('-')[0];
      const matchingVoice = voices.find(voice =>
        voice.lang.startsWith(langCode)
      );
      
      if (matchingVoice) {
        console.log('✅ Using voice:', matchingVoice.name, '| Lang:', matchingVoice.lang);
        utterance.voice = matchingVoice;
        return true;
      }
      
      console.log('⚠️ No matching voice found for:', language, '- using default');
      return true; // Use default voice
    };

    utterance.onstart = () => console.log('🔊 Speech started');
    utterance.onend = () => {
      console.log('✅ Speech ended - no repetition');
    };
    utterance.onerror = (event) => {
      console.error('❌ Speech error:', (event as any).error);
    };

    const speakNow = () => {
      const voiceAssigned = assignBestVoice();
      
      // For Kannada, only speak if voice is available
      if (language === 'kn-IN' && !voiceAssigned) {
        console.log('⚠️ Skipping speech - Kannada voice not available');
        return;
      }
      
      // Speak once only
      try {
        synth.speak(utterance);
        console.log('🎤 Speech utterance queued');
      } catch (e) {
        console.error('❌ Error speaking:', e);
      }
    };

    // Handle voice loading
    if (synth.getVoices().length === 0) {
      console.log('⏳ Waiting for voices to load...');
      // Set one-time handler to avoid multiple invocations
      const loadVoices = () => {
        synth.onvoiceschanged = null; // Remove handler immediately
        console.log('✅ Voices loaded:', synth.getVoices().length);
        speakNow();
      };
      synth.onvoiceschanged = loadVoices;
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