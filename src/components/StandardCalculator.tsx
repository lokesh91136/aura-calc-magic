import React, { useState, useEffect } from 'react';
import { CalculatorButton } from '@/components/ui/calculator-button';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, MicOff, Volume2, Languages } from 'lucide-react';
import { useVoice } from '@/contexts/VoiceContext';
import { useHistory } from '@/contexts/HistoryContext';
import { useToast } from '@/hooks/use-toast';
import { languageConfig, type Language } from '@/contexts/VoiceContext';
import { translate, parseSpokenMath } from '@/utils/translations';

export function StandardCalculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState<string>('');
  const [lastHeard, setLastHeard] = useState<string>('');
  const [parsedExpression, setParsedExpression] = useState<string>('');
  
  const { isListening, language, setLanguage, startListening, stopListening, speak, isSupported } = useVoice();
  const { addToHistory } = useHistory();
  const { toast } = useToast();

  // Request microphone permission on mount
  useEffect(() => {
    if (isSupported && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => console.log('Microphone access granted'))
        .catch(err => console.error('Microphone access denied:', err));
    }
  }, [isSupported]);

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
      
      // Speak result in selected language
      speak(translate(`Your answer is`, language) + ' ' + newValue);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNext(false);
    setLastHeard('');
    setVoiceStatus('');
    setParsedExpression('');
    speak(translate('Calculator cleared', language));
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
      setVoiceStatus('');
      setLastHeard('');
    } else {
      setVoiceStatus(translate('Listening...', language));
      setLastHeard('');
      startListening((transcript) => {
        // Clear status immediately
        setVoiceStatus('');
        
        // Handle error signals - show error once, don't auto-restart
        if (transcript === '__NO_SPEECH__') {
          const errorMsg = translate('I didn\'t hear anything', language);
          const retryMsg = translate('Please say again', language);
          setLastHeard(errorMsg);
          speak(errorMsg);
          toast({
            title: errorMsg,
            description: retryMsg,
            variant: "destructive",
          });
          return;
        }
        
        if (transcript === '__AUDIO_ERROR__') {
          const errorMsg = translate('Could not understand. Please try again', language);
          setLastHeard(errorMsg);
          speak(errorMsg);
          toast({
            title: errorMsg,
            variant: "destructive",
          });
          return;
        }
        
        // Valid transcript received
        console.log('✅ Valid transcript received:', transcript, '| Language:', language);
        setLastHeard(transcript);
        parseVoiceInput(transcript);
      });
    }
  };

  const parseVoiceInput = (transcript: string) => {
    console.log('🎤 Voice transcript received:', transcript, '| Language:', language);
    
    // Use the translation utility to parse spoken math
    const processed = parseSpokenMath(transcript, language);
    console.log('📊 Parsed expression:', processed);
    
    if (!processed || processed.trim() === '') {
      const errorMsg = translate('Could not understand the calculation', language);
      setParsedExpression('');
      speak(errorMsg);
      toast({
        title: errorMsg,
        description: `${translate('Please try again', language)}`,
        variant: "destructive",
      });
      return;
    }
    
    // Show the parsed expression
    setParsedExpression(processed);
    
    const cleanText = processed.toLowerCase().trim();
    console.log('🔍 Clean text for evaluation:', cleanText);

    try {
      // Replace math symbols and spaces to prepare for evaluation
      let expression = cleanText
        .replace(/[×]/g, '*')
        .replace(/[÷]/g, '/')
        .replace(/\s+/g, ''); // Remove all spaces

      console.log('➗ Expression to evaluate:', expression);

      // Strict sanitization - only allow numbers, decimal points, and basic operators
      const sanitizedExpr = expression.replace(/[^0-9+\-*/().]/g, '');
      
      console.log('🧹 Sanitized expression:', sanitizedExpr);
      
      // Validate: must contain at least one digit
      if (!sanitizedExpr || !/\d/.test(sanitizedExpr)) {
        console.log('❌ No valid numbers found in expression');
        throw new Error('No valid numbers found');
      }
      
      // Validate: must contain at least one operator to be a calculation
      if (!/[+\-*/]/.test(sanitizedExpr)) {
        console.log('❌ No operators found in expression');
        throw new Error('No operators found');
      }
      
      // Check if it's a valid math expression pattern (only numbers and operators)
      if (!/^[\d+\-*/().]+$/.test(sanitizedExpr)) {
        console.log('❌ Invalid characters in expression');
        throw new Error('Invalid characters in expression');
      }

      // Prevent potential injection by checking for dangerous patterns
      if (/[a-zA-Z]|__|constructor|prototype|eval|function/i.test(sanitizedExpr)) {
        console.log('❌ Dangerous pattern detected');
        throw new Error('Invalid expression pattern');
      }

      // Safe evaluation using Function constructor (limited to basic math)
      console.log('🔐 Safely evaluating:', sanitizedExpr);
      const result = Function(`"use strict"; return (${sanitizedExpr})`)();
      
      console.log('📈 Evaluation result:', result, '| Type:', typeof result, '| isNaN:', isNaN(result), '| isFinite:', isFinite(result));
      
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        const roundedResult = Math.round(result * 1000000) / 1000000; // Round to 6 decimal places
        
        console.log('✅ Calculation successful:', roundedResult);
        setDisplay(String(roundedResult));
        addToHistory({
          type: 'standard',
          calculation: processed, // Use original parsed expression for history
          result: roundedResult,
        });
        
        // Speak result in selected language - speak once only
        const resultMessage = `${translate('Your answer is', language)} ${roundedResult}`;
        console.log('🔊 Speaking result:', resultMessage);
        speak(resultMessage);
        return;
      } else {
        console.log('❌ Result is not a valid number');
        throw new Error('Invalid calculation result');
      }

    } catch (error) {
      console.error('❌ Error evaluating expression:', error);
      
      // Show specific error message
      const errorMsg = translate('Something went wrong — please try again', language) || 'Something went wrong — please try again';
      setParsedExpression('');
      speak(errorMsg);
      toast({
        title: errorMsg,
        description: `${translate('Please try again', language)}`,
        variant: "destructive",
      });
      return;
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
            <div className="space-y-3 mb-4">
              {/* Language Selector */}
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4" />
                <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(languageConfig).map(([code, config]) => (
                      <SelectItem key={code} value={code}>
                        {config.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Voice Status Box */}
              {(voiceStatus || lastHeard || parsedExpression) && (
                <div className="bg-muted/50 rounded-lg p-3 text-sm border border-border/50 min-h-[60px] space-y-1">
                  {voiceStatus && (
                    <div className="text-primary font-medium animate-pulse flex items-center gap-2">
                      <Mic className="h-3 w-3 animate-pulse" />
                      {voiceStatus}
                    </div>
                  )}
                  {lastHeard && !voiceStatus && (
                    <div className="text-foreground">
                      <span className="font-medium text-muted-foreground">Heard:</span> {lastHeard}
                    </div>
                  )}
                  {parsedExpression && !voiceStatus && (
                    <div className="text-primary font-mono">
                      <span className="font-medium text-muted-foreground">Expression:</span> {parsedExpression}
                    </div>
                  )}
                </div>
              )}
              
              {/* Voice Control Buttons */}
              <div className="flex gap-2">
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
                  onClick={() => speak(translate('Your answer is', language) + ' ' + display)}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
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