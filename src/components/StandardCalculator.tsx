import React, { useState } from 'react';
import { CalculatorButton } from '@/components/ui/calculator-button';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';
import { useToast } from '@/hooks/use-toast';

export function StandardCalculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNext, setWaitingForNext] = useState(false);
  
  const { isListening, startListening, stopListening, speak, isSupported } = useVoice();
  const { toast } = useToast();

  const inputNumber = (num: string) => {
    if (waitingForNext) {
      setDisplay(num);
      setWaitingForNext(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);
      
      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForNext(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+':
        return firstValue + secondValue;
      case '-':
        return firstValue - secondValue;
      case '×':
        return firstValue * secondValue;
      case '÷':
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);
    
    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNext(true);
      
      // Speak result
      speak(`Result is ${newValue}`);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNext(false);
    speak('Calculator cleared');
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening((transcript) => {
        parseVoiceInput(transcript.toLowerCase());
      });
    }
  };

  const parseVoiceInput = (transcript: string) => {
    // Simple voice command parsing
    const cleanText = transcript.replace(/[^\d+\-×÷*/=\s]/g, '');
    
    // Handle basic math expressions
    if (cleanText.includes('+')) {
      const parts = cleanText.split('+');
      if (parts.length === 2) {
        const num1 = parseFloat(parts[0].trim());
        const num2 = parseFloat(parts[1].trim());
        if (!isNaN(num1) && !isNaN(num2)) {
          const result = num1 + num2;
          setDisplay(String(result));
          speak(`${num1} plus ${num2} equals ${result}`);
          return;
        }
      }
    }
    
    // Handle numbers
    const number = parseFloat(cleanText);
    if (!isNaN(number)) {
      setDisplay(String(number));
      speak(`Number ${number}`);
    } else {
      toast({
        title: "Voice command not recognized",
        description: "Try saying something like '10 plus 20'",
      });
    }
  };

  const buttons = [
    { label: 'C', variant: 'clear' as const, action: clear },
    { label: '±', variant: 'function' as const, action: () => {} },
    { label: '%', variant: 'function' as const, action: () => {} },
    { label: '÷', variant: 'operator' as const, action: () => inputOperation('÷') },
    
    { label: '7', variant: 'number' as const, action: () => inputNumber('7') },
    { label: '8', variant: 'number' as const, action: () => inputNumber('8') },
    { label: '9', variant: 'number' as const, action: () => inputNumber('9') },
    { label: '×', variant: 'operator' as const, action: () => inputOperation('×') },
    
    { label: '4', variant: 'number' as const, action: () => inputNumber('4') },
    { label: '5', variant: 'number' as const, action: () => inputNumber('5') },
    { label: '6', variant: 'number' as const, action: () => inputNumber('6') },
    { label: '-', variant: 'operator' as const, action: () => inputOperation('-') },
    
    { label: '1', variant: 'number' as const, action: () => inputNumber('1') },
    { label: '2', variant: 'number' as const, action: () => inputNumber('2') },
    { label: '3', variant: 'number' as const, action: () => inputNumber('3') },
    { label: '+', variant: 'operator' as const, action: () => inputOperation('+') },
    
    { label: '0', variant: 'number' as const, action: () => inputNumber('0'), colSpan: 2 },
    { label: '.', variant: 'number' as const, action: () => inputNumber('.') },
    { label: '=', variant: 'equals' as const, action: performCalculation },
  ];

  return (
    <div className="w-full max-w-md mx-auto space-y-4 animate-slide-up">
      <Card className="bg-gradient-card border-border/20 shadow-2xl">
        <CardContent className="p-6">
          {/* Display */}
          <div className="bg-gradient-number rounded-lg p-4 mb-4 shadow-inner">
            <div className="text-right">
              <div className="text-4xl font-mono font-bold text-foreground mb-1 break-words">
                {display}
              </div>
              {operation && (
                <div className="text-sm text-muted-foreground">
                  {previousValue} {operation}
                </div>
              )}
            </div>
          </div>

          {/* Voice Controls */}
          {isSupported && (
            <div className="flex gap-2 mb-4">
              <Button
                variant={isListening ? "destructive" : "secondary"}
                size="sm"
                onClick={handleVoiceInput}
                className="flex-1"
              >
                {isListening ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                {isListening ? 'Stop' : 'Voice'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => speak(display)}
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Button Grid */}
          <div className="grid grid-cols-4 gap-3">
            {buttons.map((btn, index) => (
              <CalculatorButton
                key={index}
                variant={btn.variant}
                onClick={btn.action}
                className={btn.colSpan ? `col-span-${btn.colSpan}` : ''}
              >
                {btn.label}
              </CalculatorButton>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}