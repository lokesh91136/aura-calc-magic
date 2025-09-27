import React, { useState, useRef, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Bot, User, MessageCircle, Volume2 } from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatBotProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatBot({ isOpen, onOpenChange }: ChatBotProps) {
  const { speak } = useVoice();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your AuraCalc assistant. I can help with calculator questions, math problems, and financial calculations. What would you like to calculate?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
      const botMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'bot',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      
      // Optional speech synthesis
      speak(response);
    }, 800);
  };

  const evaluateArithmetic = (expression: string): string | null => {
    try {
      // Clean the expression - remove spaces and validate characters
      const cleanExpr = expression.replace(/\s/g, '');
      
      // Only allow numbers, operators, parentheses, and decimal points
      if (!/^[0-9+\-*/().]+$/.test(cleanExpr)) {
        return null;
      }

      // Prevent dangerous operations
      if (cleanExpr.includes('**') || cleanExpr.includes('Math') || cleanExpr.includes('eval')) {
        return null;
      }

      // Use Function constructor for safe evaluation
      const result = new Function('return ' + cleanExpr)();
      
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        return result.toString();
      }
      
      return null;
    } catch {
      return null;
    }
  };

  const generateBotResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // Check if it's a math expression
    if (/[0-9+\-*/().]/.test(query)) {
      const result = evaluateArithmetic(query);
      if (result !== null) {
        return `The answer is: ${result}`;
      }
    }

    // Calculator-related knowledge base
    const responses: { [key: string]: string } = {
      // SIP related
      'sip': 'SIP (Systematic Investment Plan) helps you invest regularly. The formula is: Future Value = PMT × [((1 + r)^n - 1) / r] × (1 + r), where PMT is monthly payment, r is monthly return rate, and n is number of months.',
      'investment': 'For investments, consider SIP calculators for mutual funds, or compound interest calculators for fixed deposits. The power of compounding works best over longer periods.',
      'mutual fund': 'Use our SIP calculator to estimate mutual fund returns. Regular investments with compound growth can build significant wealth over time.',
      
      // EMI related
      'emi': 'EMI calculation uses: EMI = P × r × (1+r)^n / ((1+r)^n - 1), where P is principal, r is monthly interest rate, and n is number of months.',
      'loan': 'For loan calculations, use our EMI calculator. Consider the total interest cost, not just the monthly EMI amount when comparing loans.',
      'mortgage': 'Home loans typically have longer tenures (15-30 years). Use EMI calculators to compare different interest rates and tenures.',
      
      // Percentage related
      'percentage': 'Percentage calculations: (Part/Whole) × 100. For percentage change: ((New Value - Old Value) / Old Value) × 100.',
      'percent': 'Common percentage calculations include discounts, profit margins, tax calculations, and investment returns.',
      'discount': 'Discount calculation: Discounted Price = Original Price × (1 - Discount Percentage/100)',
      'profit': 'Profit percentage = ((Selling Price - Cost Price) / Cost Price) × 100',
      
      // Basic math operations
      'add': 'Addition combines numbers. Use the + operator. Example: 5 + 3 = 8',
      'subtract': 'Subtraction finds the difference. Use the - operator. Example: 8 - 3 = 5',
      'multiply': 'Multiplication repeats addition. Use the * operator. Example: 4 * 3 = 12',
      'divide': 'Division splits into equal parts. Use the / operator. Example: 12 / 3 = 4',
      
      // Calculator usage
      'calculator': 'AuraCalc includes Standard Calculator, SIP Calculator, EMI Calculator, Percentage Calculator, and Tally Calculator. Each is designed for specific calculation needs.',
      'tally': 'The Tally Calculator helps track running totals and balances. Great for budgeting and keeping track of expenses.',
      
      // Compound interest
      'compound': 'Compound Interest = P(1 + r/n)^(nt) - P, where P is principal, r is annual rate, n is compounding frequency, and t is time in years.',
      'interest': 'Simple Interest = P × r × t. Compound Interest includes earning interest on interest, making it more powerful for long-term investments.',
    };

    // Find matching response
    for (const [keyword, response] of Object.entries(responses)) {
      if (lowerQuery.includes(keyword)) {
        return response;
      }
    }

    // Check if it's calculator-related
    const calculatorKeywords = ['calculate', 'math', 'number', 'formula', 'equation', 'sum', 'total', 'finance', 'money', 'cost', 'price', 'rate', 'return', 'growth'];
    const isCalculatorRelated = calculatorKeywords.some(keyword => lowerQuery.includes(keyword));

    if (isCalculatorRelated) {
      return 'I help with calculator and math-related questions. Try asking about specific calculations like "10 + 5", EMI calculations, SIP planning, percentages, or how to use our calculators.';
    }

    // Non-calculator related query
    return 'I only help with calculator and math-related questions. Please ask about calculations, mathematical operations, or how to use AuraCalc\'s calculators.';
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-[400px] bg-gradient-card border-border/20 flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-foreground flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Calculator Assistant
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea ref={scrollAreaRef} className="flex-1 mt-4">
          <div className="space-y-3 pb-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`animate-fade-in`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card className={`${
                  message.type === 'user' 
                    ? 'bg-primary/10 ml-8 border-primary/20' 
                    : 'bg-gradient-number mr-8 border-border/20'
                } transition-all duration-300 hover:shadow-lg`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      {message.type === 'user' ? (
                        <User className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      ) : (
                        <Bot className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      )}
                      <div className="text-sm text-foreground leading-relaxed">
                        {message.content}
                      </div>
                      {message.type === 'bot' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 ml-auto flex-shrink-0"
                          onClick={() => speak(message.content)}
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
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

        <div className="flex gap-2 mt-4">
          <Input
            placeholder="Ask about calculations..."
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
      </SheetContent>
    </Sheet>
  );
}

// Floating Chat Button Component
export function ChatBotTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-primary shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 z-50"
      size="icon"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
}