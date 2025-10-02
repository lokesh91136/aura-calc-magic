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
  },
  'The answer is': {
    'en-US': 'The answer is',
    'hi-IN': 'उत्तर है',
    'ta-IN': 'விடை',
    'kn-IN': 'ಉತ್ತರ',
    'es-ES': 'La respuesta es',
    'fr-FR': 'La réponse est'
  }
};

// Number to words translation for different languages
const numberToWords: { [lang in Language]: (num: number) => string } = {
  'kn-IN': (num: number) => {
    const kannadaNumbers: { [key: number]: string } = {
      0: 'ಸೊನ್ನೆ', 1: 'ಒಂದು', 2: 'ಎರಡು', 3: 'ಮೂರು', 4: 'ನಾಲ್ಕು', 
      5: 'ಐದು', 6: 'ಆರು', 7: 'ಏಳು', 8: 'ಎಂಟು', 9: 'ಒಂಬತ್ತು',
      10: 'ಹತ್ತು', 20: 'ಇಪ್ಪತ್ತು', 30: 'ಮೂವತ್ತು', 40: 'ನಲವತ್ತು',
      50: 'ಐವತ್ತು', 60: 'ಅರವತ್ತು', 70: 'ಎಪ್ಪತ್ತು', 80: 'ಎಂಬತ್ತು',
      90: 'ತೊಂಬತ್ತು', 100: 'ನೂರು', 1000: 'ಸಾವಿರ'
    };
    
    if (kannadaNumbers[num]) return kannadaNumbers[num];
    if (num < 100) {
      const tens = Math.floor(num / 10) * 10;
      const ones = num % 10;
      return `${kannadaNumbers[tens]} ${kannadaNumbers[ones]}`;
    }
    return num.toString();
  },
  'hi-IN': (num: number) => {
    const hindiNumbers: { [key: number]: string } = {
      0: 'शून्य', 1: 'एक', 2: 'दो', 3: 'तीन', 4: 'चार',
      5: 'पाँच', 6: 'छह', 7: 'सात', 8: 'आठ', 9: 'नौ',
      10: 'दस', 20: 'बीस', 30: 'तीस', 40: 'चालीस',
      50: 'पचास', 60: 'साठ', 70: 'सत्तर', 80: 'अस्सी',
      90: 'नब्बे', 100: 'सौ', 1000: 'हज़ार'
    };
    
    if (hindiNumbers[num]) return hindiNumbers[num];
    if (num < 100) {
      const tens = Math.floor(num / 10) * 10;
      const ones = num % 10;
      return `${hindiNumbers[tens]} ${hindiNumbers[ones]}`;
    }
    return num.toString();
  },
  'ta-IN': (num: number) => {
    const tamilNumbers: { [key: number]: string } = {
      0: 'பூஜ்யம்', 1: 'ஒன்று', 2: 'இரண்டு', 3: 'மூன்று', 4: 'நான்கு',
      5: 'ஐந்து', 6: 'ஆறு', 7: 'ஏழு', 8: 'எட்டு', 9: 'ஒன்பது',
      10: 'பத்து', 20: 'இருபது', 30: 'முப்பது', 40: 'நாற்பது',
      50: 'ஐம்பது', 60: 'அறுபது', 70: 'எழுபது', 80: 'எண்பது',
      90: 'தொண்ணூறு', 100: 'நூறு', 1000: 'ஆயிரம்'
    };
    
    if (tamilNumbers[num]) return tamilNumbers[num];
    if (num < 100) {
      const tens = Math.floor(num / 10) * 10;
      const ones = num % 10;
      return `${tamilNumbers[tens]} ${tamilNumbers[ones]}`;
    }
    return num.toString();
  },
  'es-ES': (num: number) => num.toString(),
  'fr-FR': (num: number) => num.toString(),
  'en-US': (num: number) => num.toString()
};

export function translateNumber(num: number, language: Language): string {
  return numberToWords[language](num);
}

export function translate(text: string, language: Language): string {
  // Try exact match first
  if (translations[text] && translations[text][language]) {
    return translations[text][language];
  }
  
  // Try to find a matching pattern and translate numbers
  for (const key in translations) {
    if (text.startsWith(key)) {
      const translated = translations[key][language];
      const remainder = text.substring(key.length).trim();
      
      // Check if remainder is a number
      const numMatch = remainder.match(/^[\d.]+$/);
      if (numMatch) {
        const num = parseFloat(remainder);
        if (!isNaN(num) && Number.isInteger(num)) {
          return `${translated} ${translateNumber(num, language)}`;
        }
      }
      
      return `${translated} ${remainder}`;
    }
  }
  
  // Return original if no translation found
  return text;
}
