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
  const [retryCount, setRetryCount] = useState(0);

  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = useCallback((onResult: (text: string) => void) => {
    if (!isSupported || typeof window === 'undefined') {
      console.log('❌ Speech recognition not supported or no window');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.log('❌ SpeechRecognition not available');
      return;
    }
    
    console.log('🎤 Creating new speech recognition instance | Language:', language, '| Retry count:', retryCount);
    const recognition = new SpeechRecognition();
    
    // Improved settings for better speech detection
    recognition.continuous = false;
    recognition.interimResults = true; // Enable interim results for better detection
    recognition.lang = language;
    recognition.maxAlternatives = 3; // Increased for better accuracy
    
    recognition.onstart = () => {
      console.log('🎤 Speech recognition started | Language:', language);
      setIsListening(true);
    };
    
    recognition.onend = () => {
      console.log('🎤 Speech recognition ended | Language:', language);
      setIsListening(false);
    };
    
    recognition.onerror = (event: any) => {
      console.log('❌ Speech recognition error:', event.error, '| Language:', language, '| Retry count:', retryCount);
      setIsListening(false);
      
      // Handle specific errors with retry logic
      if (event.error === 'no-speech') {
        console.log('⚠️ No speech detected | Retry count:', retryCount);
        // Auto-retry once if this is first attempt
        if (retryCount === 0) {
          console.log('🔄 Auto-retrying speech recognition (attempt 2)...');
          setRetryCount(1);
          setTimeout(() => startListening(onResult), 300);
          return;
        }
        setRetryCount(0);
        onResult('__NO_SPEECH__');
      } else if (event.error === 'audio-capture' || event.error === 'not-allowed') {
        console.log('❌ Audio capture error or permission denied');
        setRetryCount(0);
        onResult('__AUDIO_ERROR__');
      } else if (event.error === 'aborted') {
        console.log('⏹️ Recognition aborted by user');
        setRetryCount(0);
        return;
      } else {
        console.log('⚠️ Unknown error:', event.error);
        // Auto-retry once for unknown errors too
        if (retryCount === 0) {
          console.log('🔄 Auto-retrying after unknown error...');
          setRetryCount(1);
          setTimeout(() => startListening(onResult), 300);
          return;
        }
        setRetryCount(0);
        onResult('__NO_SPEECH__');
      }
    };
    
    recognition.onresult = (event: any) => {
      console.log('🎤 Speech recognition result event | Language:', language, '| Results count:', event.results.length);
      
      // Get the final result (last result is usually the most complete)
      let transcript = '';
      let isFinal = false;
      
      // Check all results to get the most complete transcript
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const resultTranscript = result[0]?.transcript?.trim() || '';
        console.log(`  Result ${i}: "${resultTranscript}" | Final: ${result.isFinal} | Confidence: ${result[0]?.confidence || 0}`);
        
        if (resultTranscript.length > transcript.length) {
          transcript = resultTranscript;
          isFinal = result.isFinal;
        }
      }
      
      console.log('✅ Best transcript:', transcript, '| Length:', transcript.length, '| Final:', isFinal, '| Retry count:', retryCount);
      
      // Only process if we have actual content (removed overly strict length check)
      if (!transcript || transcript === '') {
        console.log('⚠️ Empty transcript received');
        // Auto-retry once if this is first attempt and transcript is empty
        if (retryCount === 0) {
          console.log('🔄 Auto-retrying for empty transcript...');
          setRetryCount(1);
          setTimeout(() => startListening(onResult), 300);
          return;
        }
        setIsListening(false);
        setRetryCount(0);
        onResult('__NO_SPEECH__');
      } else {
        console.log('✅ Valid transcript detected - processing:', transcript);
        setIsListening(false);
        setRetryCount(0);
        onResult(transcript);
      }
    };
    
    try {
      console.log('🚀 Starting speech recognition with config:', {
        language,
        continuous: false,
        interimResults: true,
        maxAlternatives: 3,
        retryCount
      });
      recognition.start();
      setRecognition(recognition);
    } catch (error) {
      console.error('❌ Error starting speech recognition:', error);
      setIsListening(false);
      setRetryCount(0);
    }
  }, [language, isSupported, retryCount]);

  const stopListening = useCallback(() => {
    if (recognition) {
      console.log('⏹️ Manually stopping speech recognition');
      recognition.stop();
      setIsListening(false);
      setRetryCount(0);
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