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

// Word to number mapping for speech recognition
const wordToNumber: { [lang in Language]: { [word: string]: string } } = {
  'kn-IN': {
    'ಸೊನ್ನೆ': '0', 'ಒಂದು': '1', 'ಎರಡು': '2', 'ಮೂರು': '3', 'ನಾಲ್ಕು': '4',
    'ಐದು': '5', 'ಆರು': '6', 'ಏಳು': '7', 'ಎಂಟು': '8', 'ಒಂಬತ್ತು': '9',
    'ಹತ್ತು': '10', 'ಹನ್ನೊಂದು': '11', 'ಹನ್ನೆರಡು': '12', 'ಹದಿಮೂರು': '13',
    'ಹದಿನಾಲ್ಕು': '14', 'ಹದಿನೈದು': '15', 'ಹದಿನಾರು': '16', 'ಹದಿನೇಳು': '17',
    'ಹದಿನೆಂಟು': '18', 'ಹತ್ತೊಂಬತ್ತು': '19', 'ಇಪ್ಪತ್ತು': '20',
    'ಜೊತೆಗೆ': '+', 'ಮತ್ತು': '+', 'ಕಳೆಯಿರಿ': '-', 'ಗುಣಿಸಿ': '*', 'ಭಾಗಿಸಿ': '/'
  },
  'hi-IN': {
    'शून्य': '0', 'एक': '1', 'दो': '2', 'तीन': '3', 'चार': '4',
    'पाँच': '5', 'छह': '6', 'सात': '7', 'आठ': '8', 'नौ': '9',
    'दस': '10', 'ग्यारह': '11', 'बारह': '12', 'तेरह': '13', 'चौदह': '14',
    'पंद्रह': '15', 'सोलह': '16', 'सत्रह': '17', 'अठारह': '18', 'उन्नीस': '19',
    'बीस': '20', 'तीस': '30', 'चालीस': '40', 'पचास': '50',
    'साथ': '+', 'जोड़': '+', 'घटाएं': '-', 'गुणा': '*', 'भाग': '/'
  },
  'ta-IN': {
    'பூஜ்யம்': '0', 'ஒன்று': '1', 'இரண்டு': '2', 'மூன்று': '3', 'நான்கு': '4',
    'ஐந்து': '5', 'ஆறு': '6', 'ஏழு': '7', 'எட்டு': '8', 'ஒன்பது': '9',
    'பத்து': '10', 'பதினொன்று': '11', 'பன்னிரண்டு': '12', 'பதின்மூன்று': '13',
    'பதினான்கு': '14', 'பதினைந்து': '15', 'பதினாறு': '16', 'பதினேழு': '17',
    'பதினெட்டு': '18', 'பத்தொன்பது': '19', 'இருபது': '20',
    'கூட்டல்': '+', 'சேர்': '+', 'கழித்தல்': '-', 'பெருக்கல்': '*', 'வகுத்தல்': '/'
  },
  'en-US': {
    'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
    'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
    'ten': '10', 'eleven': '11', 'twelve': '12', 'thirteen': '13',
    'fourteen': '14', 'fifteen': '15', 'sixteen': '16', 'seventeen': '17',
    'eighteen': '18', 'nineteen': '19', 'twenty': '20', 'thirty': '30',
    'forty': '40', 'fifty': '50', 'sixty': '60', 'seventy': '70',
    'eighty': '80', 'ninety': '90', 'hundred': '100',
    'plus': '+', 'add': '+', 'minus': '-', 'subtract': '-',
    'times': '*', 'multiply': '*', 'divided': '/', 'divide': '/'
  },
  'es-ES': {},
  'fr-FR': {}
};

export function parseSpokenMath(text: string, language: Language): string {
  let processed = text.toLowerCase().trim();
  
  // Replace spoken words with numbers/operators for the selected language
  const mapping = wordToNumber[language];
  if (mapping) {
    for (const [word, num] of Object.entries(mapping)) {
      const regex = new RegExp(word, 'gi');
      processed = processed.replace(regex, ` ${num} `);
    }
  }
  
  // Also handle English fallbacks
  processed = processed
    .replace(/plus/gi, '+')
    .replace(/add/gi, '+')
    .replace(/minus/gi, '-')
    .replace(/subtract/gi, '-')
    .replace(/times/gi, '*')
    .replace(/multiply/gi, '*')
    .replace(/divided\s*by/gi, '/')
    .replace(/divide/gi, '/');
  
  return processed.replace(/\s+/g, ' ').trim();
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
