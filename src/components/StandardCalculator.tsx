import React, { useState } from 'react';
import { CalculatorButton } from '@/components/ui/calculator-button';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';
import { useHistory } from '@/contexts/HistoryContext';
import { useToast } from '@/hooks/use-toast';

export function StandardCalculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNext, setWaitingForNext] = useState(false);
  
  const { isListening, startListening, stopListening, speak, isSupported } = useVoice();
  const { addToHistory } = useHistory();
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
      const calculation = `${previousValue} ${operation} ${inputValue}`;
      
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForNext(true);
      
      // Save to history
      addToHistory({
        type: 'standard',
        calculation,
        result: newValue,
      });
      
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

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
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
    console.log('Voice transcript received:', transcript);
    
    // Enhanced voice command parsing
    const cleanText = transcript.toLowerCase().trim();
    console.log('Clean text:', cleanText);
    
    // Handle different ways of saying operations
    let processedText = cleanText
      .replace(/\bplus\b/g, '+')
      .replace(/\badd\b/g, '+')
      .replace(/\bminus\b/g, '-')
      .replace(/\bsubtract\b/g, '-')
      .replace(/\btimes\b/g, '×')
      .replace(/\bmultiply\b/g, '×')
      .replace(/\bmultiplied by\b/g, '×')
      .replace(/\bdivided by\b/g, '÷')
      .replace(/\bdivide\b/g, '÷');

    console.log('Processed text:', processedText);

    // Handle basic math expressions
    const operators = ['+', '-', '×', '÷'];
    let operatorFound = null;
    let operatorIndex = -1;

    for (const op of operators) {
      const index = processedText.indexOf(op);
      if (index !== -1) {
        operatorFound = op;
        operatorIndex = index;
        break;
      }
    }

    console.log('Operator found:', operatorFound, 'at index:', operatorIndex);

    if (operatorFound && operatorIndex !== -1) {
      const leftPart = processedText.substring(0, operatorIndex).trim();
      const rightPart = processedText.substring(operatorIndex + 1).trim();
      
      console.log('Left part:', leftPart, 'Right part:', rightPart);
      
      const num1 = parseFloat(leftPart.replace(/[^\d.]/g, ''));
      const num2 = parseFloat(rightPart.replace(/[^\d.]/g, ''));
      
      console.log('Numbers parsed:', num1, num2);
      
      if (!isNaN(num1) && !isNaN(num2)) {
        const result = calculate(num1, num2, operatorFound);
        setDisplay(String(result));
        
        // Save to history
        addToHistory({
          type: 'standard',
          calculation: `${num1} ${operatorFound} ${num2}`,
          result,
        });
        
        // Speak result with operation name
        const operationName = {
          '+': 'plus',
          '-': 'minus',
          '×': 'times',
          '÷': 'divided by'
        }[operatorFound];
        
        speak(`${num1} ${operationName} ${num2} equals ${result}`);
        return;
      }
    }
    
    // Handle single numbers
    const number = parseFloat(cleanText.replace(/[^\d.]/g, ''));
    console.log('Single number parsed:', number);
    
    if (!isNaN(number) && number.toString() !== 'NaN') {
      setDisplay(String(number));
      speak(`Number ${number}`);
    } else {
      console.log('No valid input found, showing error toast');
      toast({
        title: "Voice command not recognized",
        description: `I heard: "${transcript}". Try saying something like "10 plus 20" or "5 times 3"`,
      });
    }
  };

  const buttons = [
    { label: 'C', variant: 'clear' as const, action: clear },
    { label: '⌫', variant: 'function' as const, action: backspace },
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