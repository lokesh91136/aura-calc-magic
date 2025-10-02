import React, { useState, useRef, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Send, Bot, User, MessageCircle, Volume2, VolumeX, Calculator, ArrowLeft, 
  Lightbulb, Languages, Download, Trophy, Brain, Target, BookOpen 
} from 'lucide-react';
import { useVoice, type Language } from '@/contexts/VoiceContext';
import { translate, parseSpokenMath } from '@/utils/translations';
import { Link } from 'react-router-dom';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot' | 'challenge' | 'suggestion' | 'teaching' | 'system';
  content: string;
  timestamp: Date;
  isCorrect?: boolean;
  suggestion?: string;
  mode?: 'equation' | 'graph' | 'teaching' | 'game' | 'normal';
  score?: number;
}

interface CalcBotProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface GameState {
  isActive: boolean;
  score: number;
  questionCount: number;
  currentQuestion: { question: string; answer: number; difficulty: 'easy' | 'medium' | 'hard' } | null;
}

interface Memory {
  lastCalculation: string | null;
  context: string[];
  userPreferences: {
    language: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
}

export function CalcBot({ isOpen, onOpenChange }: CalcBotProps) {
  const { speak, language, setLanguage, isSupported } = useVoice();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m CalcBot, your friendly calculator tutor and assistant. I can help with math, finance, science formulas, and provide step-by-step explanations. Try:\n\n• "Solve 2x + 5 = 15" (Equation mode)\n• "Quiz me" (Game mode)\n• "Teach me percentages" (Interactive teaching)\n• "How to calculate EMI?"\n\nWhat would you like to learn today?',
      timestamp: new Date(),
      mode: 'normal'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [spokenMessages, setSpokenMessages] = useState<Set<string>>(new Set());
  const [gameState, setGameState] = useState<GameState>({
    isActive: false,
    score: 0,
    questionCount: 0,
    currentQuestion: null
  });
  const [memory, setMemory] = useState<Memory>({
    lastCalculation: null,
    context: [],
    userPreferences: {
      language: 'en-US',
      difficulty: 'medium'
    }
  });
  const [responseLanguage, setResponseLanguage] = useState('en');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const knowledgeBase = {
    emi: {
      formula: 'EMI = P × r × (1+r)^n / ((1+r)^n - 1)',
      steps: [
        '1. Convert annual interest rate to monthly (divide by 12)',
        '2. Convert percentage to decimal (divide by 100)', 
        '3. Apply the EMI formula',
        '4. Where P = Principal, r = monthly rate, n = tenure in months'
      ],
      example: 'For ₹5,00,000 at 10% for 20 years:\n- Monthly rate = 10%/12/100 = 0.008333\n- n = 20 × 12 = 240 months\n- EMI = ₹4,827'
    },
    sip: {
      formula: 'FV = PMT × [((1 + r)^n - 1) / r] × (1 + r)',
      steps: [
        '1. Convert annual return to monthly (divide by 12)',
        '2. Convert percentage to decimal (divide by 100)',
        '3. Apply the SIP formula',
        '4. Where PMT = monthly investment, r = monthly return, n = months'
      ],
      example: 'For ₹5,000/month at 12% for 10 years:\n- Monthly return = 12%/12/100 = 0.01\n- n = 10 × 12 = 120 months\n- Future Value = ₹11,61,695'
    },
    percentage: {
      formulas: {
        basic: '(Part/Whole) × 100',
        increase: '((New-Old)/Old) × 100',
        decrease: '((Old-New)/Old) × 100',
        of: '(Percentage/100) × Number'
      },
      steps: [
        '1. Identify what you need to find',
        '2. Choose the correct formula',
        '3. Substitute the values',
        '4. Calculate the result'
      ]
    },
    trigonometry: {
      functions: {
        sin: 'Sine: opposite/hypotenuse',
        cos: 'Cosine: adjacent/hypotenuse', 
        tan: 'Tangent: opposite/adjacent'
      },
      identities: [
        'sin²θ + cos²θ = 1',
        'tan θ = sin θ / cos θ',
        'sin(90° - θ) = cos θ'
      ]
    },
    physics: {
      mechanics: {
        'velocity': 'v = u + at',
        'displacement': 's = ut + ½at²',
        'force': 'F = ma',
        'momentum': 'p = mv',
        'work': 'W = F × s × cos θ',
        'power': 'P = W/t'
      },
      electricity: {
        'ohms law': 'V = IR',
        'power': 'P = VI = I²R = V²/R',
        'energy': 'E = Pt'
      }
    }
  };

  const translations = {
    'hi': {
      'Hello': 'नमस्ते',
      'Step': 'चरण',
      'Formula': 'सूत्र',
      'Example': 'उदाहरण',
      'Correct': 'सही',
      'Wrong': 'गलत',
      'Score': 'स्कोर'
    },
    'ta': {
      'Hello': 'வணக்கம்',
      'Step': 'படி',
      'Formula': 'சூத்திரம்',
      'Example': 'எடுத்துக்காட்டு',
      'Correct': 'சரி',
      'Wrong': 'தவறு',
      'Score': 'மதிப்பெண்'
    },
    'kn': {
      'Hello': 'ನಮಸ್ಕಾರ',
      'Step': 'ಹಂತ',
      'Formula': 'ಸೂತ್ರ',
      'Example': 'ಉದಾಹರಣೆ',
      'Correct': 'ಸರಿ',
      'Wrong': 'ತಪ್ಪು',
      'Score': 'ಅಂಕ'
    }
  };

  const translate = (text: string, lang: string): string => {
    if (lang === 'en' || !translations[lang as keyof typeof translations]) return text;
    const langTranslations = translations[lang as keyof typeof translations];
    return langTranslations[text as keyof typeof langTranslations] || text;
  };

  const toggleMute = () => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (newMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return newMuted;
    });
  };

  const speakMessage = (messageId: string, content: string) => {
    if (isMuted || !isSupported || spokenMessages.has(messageId)) return;
    speak(content);
    setSpokenMessages(prev => new Set(prev).add(messageId));
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const exportChat = () => {
    const chatHistory = messages.map(msg => 
      `[${msg.timestamp.toLocaleString()}] ${msg.type.toUpperCase()}: ${msg.content}`
    ).join('\n\n');
    
    const blob = new Blob([chatHistory], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CalcBot_Chat_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateQuestion = (difficulty: 'easy' | 'medium' | 'hard') => {
    const easy = [
      { min: 1, max: 20, ops: ['+', '-'] },
      { min: 1, max: 10, ops: ['*'] },
      { min: 2, max: 20, ops: ['/'], divisible: true }
    ];
    
    const medium = [
      { min: 10, max: 100, ops: ['+', '-', '*'] },
      { min: 1, max: 50, ops: ['/'], divisible: true },
      { min: 2, max: 10, ops: ['^'] }
    ];
    
    const hard = [
      { min: 50, max: 500, ops: ['+', '-', '*', '/'] },
      { min: 2, max: 15, ops: ['^'] },
      { min: 1, max: 10, ops: ['sqrt', 'factorial'] }
    ];
    
    const levels = { easy, medium, hard };
    const level = levels[difficulty];
    const config = level[Math.floor(Math.random() * level.length)];
    
    if (config.ops.includes('sqrt')) {
      const perfect = [4, 9, 16, 25, 36, 49, 64, 81, 100];
      const num = perfect[Math.floor(Math.random() * perfect.length)];
      return { question: `√${num}`, answer: Math.sqrt(num), difficulty };
    }
    
    if (config.ops.includes('factorial')) {
      const num = Math.floor(Math.random() * 6) + 3; // 3! to 8!
      const factorial = (n: number): number => n <= 1 ? 1 : n * factorial(n - 1);
      return { question: `${num}!`, answer: factorial(num), difficulty };
    }
    
    const num1 = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
    const num2 = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
    const op = config.ops[Math.floor(Math.random() * config.ops.length)];
    
    let question: string;
    let answer: number;
    
    switch (op) {
      case '+': question = `${num1} + ${num2}`; answer = num1 + num2; break;
      case '-': question = `${num1} - ${num2}`; answer = num1 - num2; break;
      case '*': question = `${num1} × ${num2}`; answer = num1 * num2; break;
      case '/': 
        const divisor = num2 === 0 ? 1 : num2;
        question = `${num1 * divisor} ÷ ${divisor}`; 
        answer = num1; 
        break;
      case '^': question = `${num1}^${Math.min(num2, 4)}`; answer = Math.pow(num1, Math.min(num2, 4)); break;
      default: question = `${num1} + ${num2}`; answer = num1 + num2;
    }
    
    return { question, answer, difficulty };
  };

  const solveEquation = (equation: string): string => {
    try {
      // Handle simple linear equations like "2x + 5 = 15"
      const match = equation.match(/(\d*)\s*x\s*([+-])\s*(\d+)\s*=\s*(\d+)/);
      if (match) {
        const [, coeff, operator, constant, result] = match;
        const a = parseInt(coeff) || 1;
        const b = parseInt(constant);
        const c = parseInt(result);
        
        const x = operator === '+' ? (c - b) / a : (c + b) / a;
        
        return `${translate('Step', responseLanguage)} 1: ${equation}
${translate('Step', responseLanguage)} 2: Isolate x term
${translate('Step', responseLanguage)} 3: x = ${x}

Verification: ${a}(${x}) ${operator} ${b} = ${a * x + (operator === '+' ? b : -b)} = ${c} ✓`;
      }
      
      return 'I can solve linear equations in the form ax + b = c. Please provide an equation like "2x + 5 = 15".';
    } catch {
      return 'Unable to solve this equation. Please provide a linear equation like "2x + 5 = 15".';
    }
  };

  const evaluateExpression = (expr: string): string | null => {
    try {
      let expression = expr.toLowerCase().replace(/\s/g, '');
      
      // Handle special functions
      expression = expression.replace(/sqrt\(([^)]+)\)/g, (_, num) => Math.sqrt(parseFloat(num)).toString());
      expression = expression.replace(/log\(([^)]+)\)/g, (_, num) => Math.log10(parseFloat(num)).toString());
      expression = expression.replace(/ln\(([^)]+)\)/g, (_, num) => Math.log(parseFloat(num)).toString());
      expression = expression.replace(/sin\(([^)]+)\)/g, (_, num) => Math.sin(parseFloat(num) * Math.PI / 180).toString());
      expression = expression.replace(/cos\(([^)]+)\)/g, (_, num) => Math.cos(parseFloat(num) * Math.PI / 180).toString());
      expression = expression.replace(/tan\(([^)]+)\)/g, (_, num) => Math.tan(parseFloat(num) * Math.PI / 180).toString());
      expression = expression.replace(/(\d+)!/g, (_, num) => {
        const n = parseInt(num);
        const factorial = (x: number): number => x <= 1 ? 1 : x * factorial(x - 1);
        return factorial(n).toString();
      });
      expression = expression.replace(/\^/g, '**');
      expression = expression.replace(/π/g, Math.PI.toString());
      expression = expression.replace(/e(?![0-9])/g, Math.E.toString());
      
      if (!/^[0-9+\-*/().\s**]+$/.test(expression)) return null;
      
      const result = new Function('return ' + expression)();
      return typeof result === 'number' && !isNaN(result) && isFinite(result) ? result.toString() : null;
    } catch {
      return null;
    }
  };

  const parseVoiceCalculation = (text: string): string | null => {
    // Parse spoken math using the selected language
    const processed = parseSpokenMath(text, language as Language);
    return evaluateExpression(processed);
  };

  const generateBotResponse = (query: string): ChatMessage => {
    const lowerQuery = query.toLowerCase().trim();
    
    // Try to parse as voice calculation first
    const calcResult = parseVoiceCalculation(query);
    if (calcResult !== null && /\d/.test(query)) {
      const response = translate(`The answer is ${calcResult}`, language as Language);
      
      return {
        id: crypto.randomUUID(),
        type: 'bot',
        content: response,
        timestamp: new Date(),
        mode: 'normal'
      };
    }
    
    // Update memory context
    setMemory(prev => ({
      ...prev,
      context: [...prev.context.slice(-4), query] // Keep last 5 queries
    }));

    // Handle language change requests
    if (lowerQuery.includes('teach me in') || lowerQuery.includes('speak in')) {
      const langMap: { [key: string]: string } = {
        'hindi': 'hi', 'हिंदी': 'hi',
        'tamil': 'ta', 'தமிழ்': 'ta', 
        'kannada': 'kn', 'ಕನ್ನಡ': 'kn',
        'english': 'en'
      };
      
      for (const [lang, code] of Object.entries(langMap)) {
        if (lowerQuery.includes(lang)) {
          setResponseLanguage(code);
          return {
            id: crypto.randomUUID(),
            type: 'system',
            content: `${translate('Hello', code)}! I'll now respond in ${lang}. How can I help with your calculations?`,
            timestamp: new Date(),
            mode: 'normal'
          };
        }
      }
    }

    // Game mode responses
    if (gameState.isActive && gameState.currentQuestion && /^[0-9.-]+$/.test(query.trim())) {
      const userAnswer = parseFloat(query.trim());
      const isCorrect = Math.abs(userAnswer - gameState.currentQuestion.answer) < 0.01;
      const points = isCorrect ? (gameState.currentQuestion.difficulty === 'hard' ? 3 : gameState.currentQuestion.difficulty === 'medium' ? 2 : 1) : 0;
      
      const newScore = gameState.score + points;
      const newQuestionCount = gameState.questionCount + 1;
      
      setGameState(prev => ({
        ...prev,
        score: newScore,
        questionCount: newQuestionCount,
        currentQuestion: null
      }));
      
      const responseText = isCorrect 
        ? `${translate('Correct', responseLanguage)}! +${points} points. ${translate('Score', responseLanguage)}: ${newScore}/${newQuestionCount * 3}` 
        : `${translate('Wrong', responseLanguage)}. Answer: ${gameState.currentQuestion.answer}. ${translate('Score', responseLanguage)}: ${newScore}/${newQuestionCount * 3}`;
      
      return {
        id: crypto.randomUUID(),
        type: 'challenge',
        content: responseText,
        timestamp: new Date(),
        isCorrect,
        score: newScore,
        mode: 'game'
      };
    }

    // Start/continue game mode
    if (lowerQuery.includes('quiz') || lowerQuery.includes('play') || lowerQuery.includes('game') || 
        (gameState.isActive && lowerQuery.includes('next'))) {
      
      if (!gameState.isActive) {
        setGameState({ isActive: true, score: 0, questionCount: 0, currentQuestion: null });
        return {
          id: crypto.randomUUID(),
          type: 'system',
          content: `🎮 Game Mode Activated! Choose difficulty: "easy", "medium", or "hard"`,
          timestamp: new Date(),
          mode: 'game'
        };
      }
      
      const difficulty = lowerQuery.includes('easy') ? 'easy' : 
                        lowerQuery.includes('hard') ? 'hard' : 'medium';
      
      const question = generateQuestion(difficulty);
      setGameState(prev => ({ ...prev, currentQuestion: question }));
      
      return {
        id: crypto.randomUUID(),
        type: 'challenge',
        content: `🎯 Question ${gameState.questionCount + 1} (${difficulty}): What is ${question.question}?`,
        timestamp: new Date(),
        mode: 'game'
      };
    }

    // End game
    if (gameState.isActive && (lowerQuery.includes('stop') || lowerQuery.includes('end game'))) {
      const finalScore = gameState.score;
      const totalQuestions = gameState.questionCount;
      setGameState({ isActive: false, score: 0, questionCount: 0, currentQuestion: null });
      
      return {
        id: crypto.randomUUID(),
        type: 'system',
        content: `🏁 Game Over! Final Score: ${finalScore}/${totalQuestions * 3}\n${finalScore >= totalQuestions * 2.5 ? 'Excellent!' : finalScore >= totalQuestions * 1.5 ? 'Good job!' : 'Keep practicing!'}`,
        timestamp: new Date(),
        mode: 'normal'
      };
    }

    // Equation solving mode
    if (lowerQuery.includes('solve') && (lowerQuery.includes('=') || lowerQuery.includes('equation'))) {
      const equation = query.replace(/solve/i, '').trim();
      const solution = solveEquation(equation);
      
      return {
        id: crypto.randomUUID(),
        type: 'bot',
        content: solution,
        timestamp: new Date(),
        mode: 'equation'
      };
    }

    // Graph helper mode
    if (lowerQuery.includes('graph') || lowerQuery.includes('plot')) {
      return {
        id: crypto.randomUUID(),
        type: 'bot',
        content: `📊 Graph Helper Mode:\n\nFor plotting functions:\n1. Identify the function type (linear, quadratic, exponential)\n2. Find key points (intercepts, vertex, asymptotes)\n3. Determine domain and range\n4. Plot points and draw smooth curve\n\nExample: y = 2x + 3\n- Slope: 2, y-intercept: 3\n- Plot (0,3) and (1,5)\n- Draw straight line through points\n\nWhat function would you like help graphing?`,
        timestamp: new Date(),
        mode: 'graph'
      };
    }

    // Interactive teaching mode
    if (lowerQuery.includes('teach') || lowerQuery.includes('learn') || lowerQuery.includes('explain')) {
      const topic = lowerQuery.includes('percentage') ? 'percentage' :
                   lowerQuery.includes('emi') ? 'emi' :
                   lowerQuery.includes('sip') ? 'sip' :
                   lowerQuery.includes('trigonometry') || lowerQuery.includes('trig') ? 'trigonometry' :
                   'general';
      
      if (topic === 'percentage') {
        return {
          id: crypto.randomUUID(),
          type: 'teaching',
          content: `📚 ${translate('Teaching', responseLanguage)} Mode: Percentages\n\n${translate('Formula', responseLanguage)}:\n• Basic: ${knowledgeBase.percentage.formulas.basic}\n• Increase: ${knowledgeBase.percentage.formulas.increase}\n• Of a number: ${knowledgeBase.percentage.formulas.of}\n\n${translate('Example', responseLanguage)}: What is 25% of 200?\n• (25/100) × 200 = 0.25 × 200 = 50\n\nNow you try: What is 15% of 80? Type your answer!`,
          timestamp: new Date(),
          mode: 'teaching'
        };
      }
      
      if (topic === 'emi') {
        return {
          id: crypto.randomUUID(),
          type: 'teaching',
          content: `📚 Teaching Mode: EMI Calculation\n\n${translate('Formula', responseLanguage)}: ${knowledgeBase.emi.formula}\n\n${translate('Step', responseLanguage)}s:\n${knowledgeBase.emi.steps.join('\n')}\n\n${translate('Example', responseLanguage)}:\n${knowledgeBase.emi.example}\n\nTo practice: Tell me loan amount, interest rate, and tenure, and I'll walk you through the calculation!`,
          timestamp: new Date(),
          mode: 'teaching',
          suggestion: '/emi'
        };
      }
    }

    // Context-aware follow-ups
    if (lowerQuery.includes('loan') && !lowerQuery.includes('amount') && !lowerQuery.includes('rate')) {
      return {
        id: crypto.randomUUID(),
        type: 'bot',
        content: `I can help calculate your EMI! I need:\n• Loan amount (Principal)\n• Interest rate (% per annum)\n• Tenure (years or months)\n\nFor example: "Calculate EMI for 5 lakh loan at 9% for 20 years"`,
        timestamp: new Date(),
        mode: 'normal',
        suggestion: '/emi'
      };
    }

    // Mathematical expression evaluation
    if (/[0-9+\-*/().\^√!]/.test(query) || /sqrt|log|ln|sin|cos|tan|pi|e/i.test(query)) {
      const result = evaluateExpression(query);
      if (result !== null) {
        setMemory(prev => ({ ...prev, lastCalculation: `${query} = ${result}` }));
        return {
          id: crypto.randomUUID(),
          type: 'bot',
          content: `${query} = ${result}`,
          timestamp: new Date(),
          mode: 'normal'
        };
      }
    }

    // Memory recall
    if (lowerQuery.includes('last') || lowerQuery.includes('previous') || lowerQuery.includes('recall')) {
      if (memory.lastCalculation) {
        return {
          id: crypto.randomUUID(),
          type: 'bot',
          content: `Your last calculation: ${memory.lastCalculation}`,
          timestamp: new Date(),
          mode: 'normal'
        };
      }
    }

    // Knowledge base responses
    const topics = ['emi', 'sip', 'percentage', 'gst', 'tax', 'discount', 'margin', 'compound interest', 'simple interest'];
    for (const topic of topics) {
      if (lowerQuery.includes(topic)) {
        if (topic === 'gst' || topic === 'tax') {
          return {
            id: crypto.randomUUID(),
            type: 'bot',
            content: `GST/Tax Calculator:\n\n• GST Exclusive: Final Price = Base Price + (Base Price × GST%/100)\n• GST Inclusive: Base Price = Final Price / (1 + GST%/100)\n\nExample: ₹1000 + 18% GST = ₹1000 + ₹180 = ₹1180\n\nNeed help with a specific GST calculation?`,
            timestamp: new Date(),
            mode: 'normal'
          };
        }
      }
    }

    // Check if calculator-related
    const calcKeywords = ['calculate', 'math', 'formula', 'equation', 'finance', 'percentage', 'profit', 'loss', 'interest'];
    if (calcKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return {
        id: crypto.randomUUID(),
        type: 'bot',
        content: `I'm here to help with math and calculations! Try:\n\n• "Solve 2x + 5 = 15" (equations)\n• "25% of 200" (math)\n• "Quiz me" (practice)\n• "Teach me EMI" (learning)\n• "Calculate 15 + 23 * 4"\n\nWhat specific calculation do you need help with?`,
        timestamp: new Date(),
        mode: 'normal'
      };
    }

    // Non-calculator topics
    return {
      id: crypto.randomUUID(),
      type: 'bot',
      content: `I focus on math and calculator-related topics. Can you rephrase your question about calculations, formulas, or mathematical concepts?`,
      timestamp: new Date(),
      mode: 'normal'
    };
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateBotResponse(input.trim());
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
      
      if (!isMuted && response.type === 'bot') {
        speakMessage(response.id, response.content);
      }
    }, 800);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-[420px] bg-gradient-card border-border/20 flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-foreground flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              CalcBot
              {gameState.isActive && (
                <Badge variant="secondary" className="ml-2">
                  <Trophy className="h-3 w-3 mr-1" />
                  {gameState.score}/{gameState.questionCount * 3}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={exportChat}
                className="text-muted-foreground hover:text-foreground"
                title="Export Chat"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleMute}
                className="text-muted-foreground hover:text-foreground"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/" onClick={() => onOpenChange(false)}>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </SheetTitle>
          
          <div className="flex items-center gap-2 mt-2">
            <Languages className="h-4 w-4 text-muted-foreground" />
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-28 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-US">English</SelectItem>
                <SelectItem value="hi-IN">हिंदी</SelectItem>
                <SelectItem value="ta-IN">தமிழ்</SelectItem>
                <SelectItem value="kn-IN">ಕನ್ನಡ</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">
              Speech: {isMuted ? 'Off' : 'On'}
            </span>
          </div>
        </SheetHeader>
        
        <ScrollArea ref={scrollAreaRef} className="flex-1 mt-4">
          <div className="space-y-3 pb-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`animate-fade-in ${
                  message.type === 'user' ? 'flex justify-end' : 'flex justify-start'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card className={`max-w-[90%] ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground border-primary/20' 
                    : message.type === 'challenge'
                    ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/30'
                    : message.type === 'teaching'
                    ? 'bg-gradient-to-r from-blue-500/10 to-green-500/10 border-blue-500/30'
                    : message.mode === 'equation'
                    ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30'
                    : message.isCorrect === true
                    ? 'bg-green-500/10 border-green-500/30'
                    : message.isCorrect === false
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-gradient-number border-border/20'
                } transition-all duration-300 hover:shadow-lg`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      {message.type === 'user' ? (
                        <User className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary-foreground" />
                      ) : message.type === 'challenge' ? (
                        <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      ) : message.type === 'teaching' ? (
                        <BookOpen className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      ) : message.mode === 'equation' ? (
                        <Calculator className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Brain className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      )}
                      <div className={`text-sm leading-relaxed flex-1 ${
                        message.type === 'user' ? 'text-primary-foreground' : 'text-foreground'
                      }`}>
                        <div className="whitespace-pre-line">{message.content}</div>
                        {message.suggestion && (
                          <div className="mt-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              asChild
                              className="h-7 text-xs"
                            >
                              <Link to={message.suggestion} onClick={() => onOpenChange(false)}>
                                Open Calculator
                              </Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-fade-in">
                <Card className="bg-gradient-number border-border/20">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-primary animate-pulse" />
                      <div className="text-sm text-muted-foreground">
                        CalcBot is thinking...
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="mt-4 space-y-2">
          {gameState.isActive && !gameState.currentQuestion && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleSend()}>
                Easy
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleSend()}>
                Medium  
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleSend()}>
                Hard
              </Button>
            </div>
          )}
          
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about math, calculations, or type 'quiz me'..."
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1"
            />
            <Button onClick={handleSend} size="icon" disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex gap-1 flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => setInput('Quiz me')}>
              🎮 Quiz
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setInput('Teach me percentages')}>
              📚 Learn
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setInput('Solve 2x + 5 = 15')}>
              🔧 Solve
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setInput('25% of 400')}>
              🔢 Calculate
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}