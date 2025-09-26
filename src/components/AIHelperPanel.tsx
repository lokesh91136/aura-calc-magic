import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Bot, User } from 'lucide-react';
import { useHistory } from '@/contexts/HistoryContext';

interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIHelperPanel() {
  const { isAIHelperOpen, setAIHelperOpen } = useHistory();
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hi! I\'m your AuraCalc AI assistant. I can help explain calculations, suggest formulas, and provide financial guidance. What would you like to know?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: AIMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const response = generateAIResponse(input.trim());
      const aiMessage: AIMessage = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const generateAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('sip') || lowerQuery.includes('investment')) {
      return 'SIP (Systematic Investment Plan) helps you invest regularly. The power of compounding works best with longer time periods. For example, investing ₹5,000 monthly for 20 years at 12% returns can grow to over ₹49 lakhs!';
    }
    
    if (lowerQuery.includes('emi') || lowerQuery.includes('loan')) {
      return 'EMI calculation uses the formula: EMI = P × r × (1+r)^n / ((1+r)^n - 1). Lower interest rates and longer tenure reduce EMI but increase total interest. Always compare total cost, not just EMI amount.';
    }
    
    if (lowerQuery.includes('percentage') || lowerQuery.includes('percent')) {
      return 'Percentage calculations are everywhere in finance! Profit margin, tax rates, discounts, returns. Remember: Percentage change = (New Value - Old Value) / Old Value × 100.';
    }
    
    if (lowerQuery.includes('tally') || lowerQuery.includes('balance')) {
      return 'Keeping track of running balances helps with budgeting and cash flow. Always reconcile your calculations with bank statements to catch any errors early.';
    }
    
    return 'I can help with calculations, financial formulas, and planning advice. Try asking about SIP returns, EMI planning, percentage calculations, or general finance tips!';
  };

  return (
    <Sheet open={isAIHelperOpen} onOpenChange={setAIHelperOpen}>
      <SheetContent className="w-full sm:w-[400px] bg-gradient-card border-border/20 flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-foreground flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            AI Helper
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="flex-1 mt-4">
          <div className="space-y-3 pb-4">
            {messages.map((message) => (
              <Card key={message.id} className={`${
                message.type === 'user' 
                  ? 'bg-primary/10 ml-8' 
                  : 'bg-gradient-number mr-8'
              } border-border/20`}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    {message.type === 'user' ? (
                      <User className="h-4 w-4 text-primary mt-0.5" />
                    ) : (
                      <Bot className="h-4 w-4 text-primary mt-0.5" />
                    )}
                    <div className="text-sm text-foreground leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-2 mt-4">
          <Input
            placeholder="Ask about calculations..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-gradient-number border-border/20"
          />
          <Button onClick={handleSend} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}