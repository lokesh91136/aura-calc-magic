type Language = 'en-US' | 'hi-IN' | 'ta-IN' | 'kn-IN' | 'es-ES' | 'fr-FR';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

const translations: Translations = {
  'Correct!': {
    'en-US': 'Correct!',
    'hi-IN': 'सही!',
    'ta-IN': 'சரியானது!',
    'kn-IN': 'ಸರಿ!',
    'es-ES': '¡Correcto!',
    'fr-FR': 'Correct!'
  },
  'Wrong!': {
    'en-US': 'Wrong!',
    'hi-IN': 'गलत!',
    'ta-IN': 'தவறு!',
    'kn-IN': 'ತಪ್ಪು!',
    'es-ES': '¡Incorrecto!',
    'fr-FR': 'Faux!'
  },
  'Game over! Your score is': {
    'en-US': 'Game over! Your score is',
    'hi-IN': 'खेल समाप्त! आपका स्कोर है',
    'ta-IN': 'விளையாட்டு முடிந்தது! உங்கள் மதிப்பெண்',
    'kn-IN': 'ಆಟ ಮುಗಿದಿದೆ! ನಿಮ್ಮ ಅಂಕ',
    'es-ES': '¡Juego terminado! Tu puntuación es',
    'fr-FR': 'Jeu terminé! Votre score est'
  },
  'Race finished! You reached the finish line with distance': {
    'en-US': 'Race finished! You reached the finish line with distance',
    'hi-IN': 'दौड़ समाप्त! आप दूरी के साथ अंतिम पंक्ति तक पहुंच गए',
    'ta-IN': 'ஓட்டம் முடிந்தது! நீங்கள் தூரத்துடன் இறுதி கோட்டை எட்டினீர்கள்',
    'kn-IN': 'ಓಟ ಮುಗಿದಿದೆ! ನೀವು ದೂರದೊಂದಿಗೆ ಅಂತಿಮ ರೇಖೆಯನ್ನು ತಲುಪಿದ್ದೀರಿ',
    'es-ES': '¡Carrera terminada! Alcanzaste la línea de meta con distancia',
    'fr-FR': 'Course terminée! Vous avez atteint la ligne d\'arrivée avec une distance de'
  },
  'Race finished! Your distance is': {
    'en-US': 'Race finished! Your distance is',
    'hi-IN': 'दौड़ समाप्त! आपकी दूरी है',
    'ta-IN': 'ஓட்டம் முடிந்தது! உங்கள் தூரம்',
    'kn-IN': 'ಓಟ ಮುಗಿದಿದೆ! ನಿಮ್ಮ ದೂರ',
    'es-ES': '¡Carrera terminada! Tu distancia es',
    'fr-FR': 'Course terminée! Votre distance est'
  },
  'Result is': {
    'en-US': 'Result is',
    'hi-IN': 'परिणाम है',
    'ta-IN': 'முடிவு',
    'kn-IN': 'ಫಲಿತಾಂಶ',
    'es-ES': 'El resultado es',
    'fr-FR': 'Le résultat est'
  },
  'Calculator cleared': {
    'en-US': 'Calculator cleared',
    'hi-IN': 'कैलकुलेटर साफ़ किया गया',
    'ta-IN': 'கால்குலேட்டர் அழிக்கப்பட்டது',
    'kn-IN': 'ಕ್ಯಾಲ್ಕುಲೇಟರ್ ತೆರವುಗೊಳಿಸಲಾಗಿದೆ',
    'es-ES': 'Calculadora borrada',
    'fr-FR': 'Calculatrice effacée'
  }
};

export function translate(text: string, language: Language): string {
  // Try exact match first
  if (translations[text] && translations[text][language]) {
    return translations[text][language];
  }
  
  // Try to find a matching pattern
  for (const key in translations) {
    if (text.startsWith(key)) {
      const translated = translations[key][language];
      const remainder = text.substring(key.length).trim();
      return `${translated} ${remainder}`;
    }
  }
  
  // Return original if no translation found
  return text;
}
