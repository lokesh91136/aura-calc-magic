import React, { useState, useRef, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Bot, User, MessageCircle, Volume2, VolumeX, Calculator, ArrowLeft, Lightbulb, Languages } from 'lucide-react';
import { useVoice, type Language } from '@/contexts/VoiceContext';
import { translate, parseSpokenMath } from '@/utils/translations';
import { Link } from 'react-router-dom';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot' | 'challenge' | 'suggestion';
  content: string;
  timestamp: Date;
  isCorrect?: boolean;
  suggestion?: string;
}

interface ChatBotProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatBot({ isOpen, onOpenChange }: ChatBotProps) {
  const { speak, language, setLanguage, isSupported } = useVoice();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your AuraCalc assistant. I can help with calculator questions, math problems, EMI/SIP calculations, and more. Try asking me to calculate something or say "challenge me" for a quick math question!',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [spokenMessages, setSpokenMessages] = useState<Set<string>>(new Set());
  const [currentChallenge, setCurrentChallenge] = useState<{question: string, answer: number} | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const toggleMute = () => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (newMuted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        // Stop any ongoing speech when muting
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    // Simulate typing delay
    setTimeout(() => {
      const response = generateBotResponse(input.trim());
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
      
      // Speak the response only once and if not muted
      if (!isMuted && response.type === 'bot') {
        speakMessage(response.id, response.content);
      }
    }, 800);
  };

  // Advanced math functions
  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    return n * factorial(n - 1);
  };

  const evaluateAdvancedMath = (expression: string): string | null => {
    try {
      let expr = expression.toLowerCase().replace(/\s/g, '');
      
      // Handle special functions
      expr = expr.replace(/sqrt\(([^)]+)\)/g, (match, num) => {
        const n = parseFloat(num);
        return Math.sqrt(n).toString();
      });
      
      expr = expr.replace(/square\(([^)]+)\)/g, (match, num) => {
        const n = parseFloat(num);
        return (n * n).toString();
      });
      
      expr = expr.replace(/pow\(([^,]+),([^)]+)\)/g, (match, base, exp) => {
        const b = parseFloat(base);
        const e = parseFloat(exp);
        return Math.pow(b, e).toString();
      });
      
      expr = expr.replace(/factorial\(([^)]+)\)/g, (match, num) => {
        const n = parseInt(num);
        return factorial(n).toString();
      });
      
      // Handle power operator (^)
      expr = expr.replace(/([0-9.]+)\^([0-9.]+)/g, (match, base, exp) => {
        const b = parseFloat(base);
        const e = parseFloat(exp);
        return Math.pow(b, e).toString();
      });
      
      // Only allow safe characters
      if (!/^[0-9+\-*/().]+$/.test(expr)) {
        return null;
      }

      // Use Function constructor for safe evaluation
      const result = new Function('return ' + expr)();
      
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        return result.toString();
      }
      
      return null;
    } catch {
      return null;
    }
  };

  const generateChallenge = (): {question: string, answer: number} => {
    const operations = ['+', '-', '*', '/'];
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    let question = `${num1} ${op} ${num2}`;
    let answer: number;
    
    switch (op) {
      case '+': answer = num1 + num2; break;
      case '-': answer = num1 - num2; break;
      case '*': answer = num1 * num2; break;
      case '/': answer = Math.round((num1 / num2) * 100) / 100; break;
      default: answer = 0;
    }
    
    return { question, answer };
  };

  const getStepByStepGuidance = (type: string): string => {
    switch (type) {
      case 'emi':
        return 'Step-by-step EMI calculation:\n1. Convert annual interest rate to monthly (divide by 12)\n2. Apply formula: EMI = P × r × (1+r)^n / ((1+r)^n - 1)\n3. Where P = Principal, r = monthly rate, n = tenure in months\n\nExample: ₹5,00,000 loan at 10% for 20 years\n- Monthly rate = 10%/12 = 0.833%\n- EMI = ₹4,827';
      case 'sip':
        return 'Step-by-step SIP calculation:\n1. Convert annual return to monthly (divide by 12)\n2. Apply formula: FV = PMT × [((1 + r)^n - 1) / r] × (1 + r)\n3. Where PMT = monthly investment, r = monthly return, n = months\n\nExample: ₹5,000/month at 12% for 10 years\n- Monthly return = 12%/12 = 1%\n- Future Value = ₹11,61,695';
      case 'percentage':
        return 'Step-by-step percentage calculation:\n1. Basic percentage: (Part/Whole) × 100\n2. Percentage increase: ((New-Old)/Old) × 100\n3. Find percentage of number: (Percentage/100) × Number\n\nExample: 25% of 200\n- (25/100) × 200 = 50';
      default:
        return 'I can provide step-by-step guidance for EMI, SIP, and percentage calculations. Which one would you like help with?';
    }
  };

  const parseVoiceCalculation = (text: string): string | null => {
    // Parse spoken math using the selected language
    const processed = parseSpokenMath(text, language as Language);
    return evaluateAdvancedMath(processed);
  };

  const generateBotResponse = (query: string): ChatMessage => {
    const lowerQuery = query.toLowerCase();
    
    // Try to parse as voice calculation first
    const calcResult = parseVoiceCalculation(query);
    if (calcResult !== null && /\d/.test(query)) {
      const response = translate(`The answer is ${calcResult}`, language as Language);
      
      return {
        id: crypto.randomUUID(),
        type: 'bot',
        content: response,
        timestamp: new Date(),
        isCorrect: true
      };
    }
    
    // Handle challenge responses
    if (currentChallenge && /^[0-9.-]+$/.test(query.trim())) {
      const userAnswer = parseFloat(query.trim());
      const isCorrect = Math.abs(userAnswer - currentChallenge.answer) < 0.01;
      setCurrentChallenge(null);
      
      return {
        id: crypto.randomUUID(),
        type: 'bot',
        content: isCorrect ? 
          `Correct! The answer is ${currentChallenge.answer}. Great job! 🎉` : 
          `Not quite. The correct answer is ${currentChallenge.answer}. Try another challenge?`,
        timestamp: new Date(),
        isCorrect
      };
    }
    
    // Generate challenge
    if (lowerQuery.includes('challenge') || lowerQuery.includes('quiz')) {
      const challenge = generateChallenge();
      setCurrentChallenge(challenge);
      return {
        id: crypto.randomUUID(),
        type: 'challenge',
        content: `Quick Math Challenge: What is ${challenge.question}?`,
        timestamp: new Date()
      };
    }
    
    // Step-by-step guidance
    if (lowerQuery.includes('step') || lowerQuery.includes('guide') || lowerQuery.includes('how to')) {
      if (lowerQuery.includes('emi')) {
        return {
          id: crypto.randomUUID(),
          type: 'bot',
          content: getStepByStepGuidance('emi'),
          timestamp: new Date(),
          suggestion: '/emi'
        };
      } else if (lowerQuery.includes('sip')) {
        return {
          id: crypto.randomUUID(),
          type: 'bot',
          content: getStepByStepGuidance('sip'),
          timestamp: new Date(),
          suggestion: '/sip'
        };
      } else if (lowerQuery.includes('percentage') || lowerQuery.includes('percent')) {
        return {
          id: crypto.randomUUID(),
          type: 'bot',
          content: getStepByStepGuidance('percentage'),
          timestamp: new Date(),
          suggestion: '/percentage'
        };
      }
    }
    
    // Check if it's a math expression (including advanced functions)
    if (/[0-9+\-*/().\^]/.test(query) || /sqrt|square|pow|factorial/i.test(query)) {
      const result = evaluateAdvancedMath(query);
      if (result !== null) {
        return {
          id: crypto.randomUUID(),
          type: 'bot',
          content: `The answer is: ${result}`,
          timestamp: new Date(),
          isCorrect: true
        };
      }
    }

    // Calculator-related knowledge base with suggestions
    const responses: { [key: string]: {content: string, suggestion?: string} } = {
      'sip': {
        content: 'SIP (Systematic Investment Plan) helps you invest regularly. The formula is: Future Value = PMT × [((1 + r)^n - 1) / r] × (1 + r), where PMT is monthly payment, r is monthly return rate, and n is number of months.',
        suggestion: '/sip'
      },
      'emi': {
        content: 'EMI calculation uses: EMI = P × r × (1+r)^n / ((1+r)^n - 1), where P is principal, r is monthly interest rate, and n is number of months.',
        suggestion: '/emi'
      },
      'percentage': {
        content: 'Percentage calculations: (Part/Whole) × 100. For percentage change: ((New Value - Old Value) / Old Value) × 100.',
        suggestion: '/percentage'
      },
      'tally': {
        content: 'The Tally Calculator helps track running totals and balances. Great for budgeting and keeping track of expenses.',
        suggestion: '/tally'
      },
      'square': {
        content: 'Square of a number: n² or n × n. You can also use square(number) function. Example: square(5) = 25'
      },
      'sqrt': {
        content: 'Square root finds the number that when multiplied by itself gives the original number. Use sqrt(number). Example: sqrt(25) = 5'
      },
      'power': {
        content: 'Power operation raises a number to an exponent. Use pow(base, exponent) or base^exponent. Example: pow(2, 3) = 8 or 2^3 = 8'
      },
      'factorial': {
        content: 'Factorial of n is the product of all positive integers less than or equal to n. Use factorial(number). Example: factorial(5) = 120'
      }
    };

    // Find matching response
    for (const [keyword, response] of Object.entries(responses)) {
      if (lowerQuery.includes(keyword)) {
        return {
          id: crypto.randomUUID(),
          type: 'bot',
          content: response.content,
          timestamp: new Date(),
          suggestion: response.suggestion
        };
      }
    }

    // Check if it's calculator-related
    const calculatorKeywords = ['calculate', 'math', 'number', 'formula', 'equation', 'sum', 'total', 'finance', 'money', 'cost', 'price', 'rate', 'return', 'growth'];
    const isCalculatorRelated = calculatorKeywords.some(keyword => lowerQuery.includes(keyword));

    if (isCalculatorRelated) {
      return {
        id: crypto.randomUUID(),
        type: 'bot',
        content: 'I help with calculator and math-related questions. Try asking about specific calculations like "10 + 5", EMI calculations, SIP planning, percentages, or say "challenge me" for a quick math question!',
        timestamp: new Date()
      };
    }

    // Non-calculator related query
    return {
      id: crypto.randomUUID(),
      type: 'bot',
      content: 'I only help with calculator and math-related questions. Please ask about calculations, mathematical operations, or how to use AuraCalc\'s calculators.',
      timestamp: new Date()
    };
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-[400px] bg-gradient-card border-border/20 flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-foreground flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Calculator Chatbot
            </div>
            <div className="flex items-center gap-2">
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
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Link>
              </Button>
            </div>
          </SheetTitle>
          
          {/* Voice Settings */}
          <div className="flex items-center gap-2 mt-2">
            <Languages className="h-4 w-4 text-muted-foreground" />
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32 h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-US">English</SelectItem>
                <SelectItem value="hi-IN">हिंदी</SelectItem>
                <SelectItem value="ta-IN">தமிழ்</SelectItem>
                <SelectItem value="kn-IN">ಕನ್ನಡ</SelectItem>
                <SelectItem value="es-ES">Español</SelectItem>
                <SelectItem value="fr-FR">Français</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">
              {isMuted ? 'Speech: Off' : 'Speech: On'}
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
                <Card className={`max-w-[85%] ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground border-primary/20' 
                    : message.type === 'challenge'
                    ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/30'
                    : message.isCorrect === true
                    ? 'bg-green-500/10 border-green-500/30'
                    : message.isCorrect === false
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-gradient-number border-border/20'
                } transition-all duration-300 hover:shadow-lg`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      {message.type === 'user' ? (
                        <User className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                          message.type === 'user' ? 'text-primary-foreground' : 'text-primary'
                        }`} />
                      ) : message.type === 'challenge' ? (
                        <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      ) : (
                        <Bot className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
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
                      {message.type === 'bot' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-6 w-6 p-0 ml-2 flex-shrink-0 transition-opacity ${
                            isMuted ? 'opacity-30' : 'opacity-60 hover:opacity-100'
                          }`}
                          onClick={() => !isMuted && speak(message.content)}
                          disabled={isMuted}
                        >
                          {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                        </Button>
                      )}
                    </div>
                    {message.type === 'challenge' && (
                      <Badge variant="secondary" className="mt-2 text-xs">
                        <Lightbulb className="h-3 w-3 mr-1" />
                        Challenge Mode
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
            
            {isTyping && (
              <Card className="bg-gradient-number mr-8 border-border/20 animate-pulse">
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <Bot className="h-4 w-4 text-primary mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      Typing...
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        <div className="mt-4 space-y-2">
          <div className="flex gap-1 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setInput('challenge me')}
              className="text-xs h-7"
            >
              Challenge Me
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setInput('how to calculate EMI step by step')}
              className="text-xs h-7"
            >
              EMI Guide
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setInput('sqrt(25) + 5^2')}
              className="text-xs h-7"
            >
              Advanced Math
            </Button>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder={currentChallenge ? "Enter your answer..." : "Ask about calculations, math functions, or say 'challenge me'..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-gradient-number border-border/20 focus:border-primary/50 transition-colors"
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isTyping}
              className="bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Floating Chat Button Component (removed as it's now integrated in sidebar)