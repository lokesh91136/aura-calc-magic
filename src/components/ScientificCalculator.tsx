import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useHistory } from '@/contexts/HistoryContext';
import { cn } from '@/lib/utils';

interface ScientificCalculatorProps {
  className?: string;
}

export function ScientificCalculator({ className }: ScientificCalculatorProps) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');
  const { addToHistory } = useHistory();

  const formatNumber = (num: number): string => {
    if (num === Math.floor(num) && num.toString().length <= 10) {
      return num.toString();
    }
    if (Math.abs(num) >= 1e10 || (Math.abs(num) < 1e-6 && num !== 0)) {
      return num.toExponential(6);
    }
    return parseFloat(num.toPrecision(10)).toString();
  };

  const evaluateExpression = (expr: string): number => {
    try {
      // Replace scientific constants and functions
      let processedExpr = expr
        .replace(/π/g, Math.PI.toString())
        .replace(/e(?![+\-*/^()])/g, Math.E.toString())
        .replace(/\^/g, '**');

      // Handle scientific functions
      processedExpr = processedExpr
        .replace(/sin\(([^)]+)\)/g, (match, angle) => {
          const val = parseFloat(angle);
          const radians = angleMode === 'deg' ? (val * Math.PI) / 180 : val;
          return Math.sin(radians).toString();
        })
        .replace(/cos\(([^)]+)\)/g, (match, angle) => {
          const val = parseFloat(angle);
          const radians = angleMode === 'deg' ? (val * Math.PI) / 180 : val;
          return Math.cos(radians).toString();
        })
        .replace(/tan\(([^)]+)\)/g, (match, angle) => {
          const val = parseFloat(angle);
          const radians = angleMode === 'deg' ? (val * Math.PI) / 180 : val;
          return Math.tan(radians).toString();
        })
        .replace(/ln\(([^)]+)\)/g, (match, num) => Math.log(parseFloat(num)).toString())
        .replace(/log\(([^)]+)\)/g, (match, num) => Math.log10(parseFloat(num)).toString())
        .replace(/sqrt\(([^)]+)\)/g, (match, num) => Math.sqrt(parseFloat(num)).toString())
        .replace(/cbrt\(([^)]+)\)/g, (match, num) => Math.cbrt(parseFloat(num)).toString())
        .replace(/factorial\(([^)]+)\)/g, (match, num) => {
          const n = parseInt(num);
          if (n < 0 || n > 170) return 'NaN';
          let result = 1;
          for (let i = 2; i <= n; i++) result *= i;
          return result.toString();
        });

      // Safe evaluation
      if (!/^[0-9+\-*/().e\s]+$/.test(processedExpr)) {
        throw new Error('Invalid expression');
      }

      const result = new Function('return ' + processedExpr)();
      
      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error('Invalid result');
      }
      
      return result;
    } catch (error) {
      throw new Error('Invalid expression');
    }
  };

  const handleNumber = useCallback((num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  }, [display, waitingForNewValue]);

  const handleOperator = useCallback((nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(display);
    } else if (operation) {
      const currentValue = previousValue || '0';
      try {
        const result = evaluateExpression(`${currentValue}${operation}${display}`);
        const formattedResult = formatNumber(result);
        
        addToHistory({
          type: 'scientific',
          calculation: `${currentValue} ${operation} ${display}`,
          result: formattedResult,
        });

        setDisplay(formattedResult);
        setPreviousValue(formattedResult);
      } catch (error) {
        setDisplay('Error');
        setPreviousValue(null);
        setOperation(null);
        setWaitingForNewValue(true);
        return;
      }
    }

    setWaitingForNewValue(true);
    setOperation(nextOperation);
  }, [display, previousValue, operation, addToHistory, angleMode]);

  const handleEquals = useCallback(() => {
    if (operation && previousValue !== null) {
      try {
        const result = evaluateExpression(`${previousValue}${operation}${display}`);
        const formattedResult = formatNumber(result);
        
        addToHistory({
          type: 'scientific',
          calculation: `${previousValue} ${operation} ${display}`,
          result: formattedResult,
        });

        setDisplay(formattedResult);
        setPreviousValue(null);
        setOperation(null);
        setWaitingForNewValue(true);
      } catch (error) {
        setDisplay('Error');
        setPreviousValue(null);
        setOperation(null);
        setWaitingForNewValue(true);
      }
    }
  }, [display, previousValue, operation, addToHistory, angleMode]);

  const handleScientificFunction = useCallback((func: string) => {
    try {
      const currentValue = parseFloat(display);
      let result: number;
      let expression: string;

      switch (func) {
        case 'sin':
          const sinRadians = angleMode === 'deg' ? (currentValue * Math.PI) / 180 : currentValue;
          result = Math.sin(sinRadians);
          expression = `sin(${display}${angleMode === 'deg' ? '°' : ' rad'})`;
          break;
        case 'cos':
          const cosRadians = angleMode === 'deg' ? (currentValue * Math.PI) / 180 : currentValue;
          result = Math.cos(cosRadians);
          expression = `cos(${display}${angleMode === 'deg' ? '°' : ' rad'})`;
          break;
        case 'tan':
          const tanRadians = angleMode === 'deg' ? (currentValue * Math.PI) / 180 : currentValue;
          result = Math.tan(tanRadians);
          expression = `tan(${display}${angleMode === 'deg' ? '°' : ' rad'})`;
          break;
        case 'ln':
          result = Math.log(currentValue);
          expression = `ln(${display})`;
          break;
        case 'log':
          result = Math.log10(currentValue);
          expression = `log(${display})`;
          break;
        case 'sqrt':
          result = Math.sqrt(currentValue);
          expression = `√(${display})`;
          break;
        case 'cbrt':
          result = Math.cbrt(currentValue);
          expression = `∛(${display})`;
          break;
        case 'square':
          result = currentValue * currentValue;
          expression = `${display}²`;
          break;
        case 'factorial':
          if (currentValue < 0 || currentValue > 170 || currentValue !== Math.floor(currentValue)) {
            throw new Error('Invalid factorial input');
          }
          result = 1;
          for (let i = 2; i <= currentValue; i++) result *= i;
          expression = `${display}!`;
          break;
        case 'exp':
          result = Math.exp(currentValue);
          expression = `e^(${display})`;
          break;
        case 'reciprocal':
          result = 1 / currentValue;
          expression = `1/(${display})`;
          break;
        default:
          throw new Error('Unknown function');
      }

      if (!isFinite(result)) {
        throw new Error('Result is not finite');
      }

      const formattedResult = formatNumber(result);
      
      addToHistory({
        type: 'scientific',
        calculation: expression,
        result: formattedResult,
      });

      setDisplay(formattedResult);
      setWaitingForNewValue(true);
      setPreviousValue(null);
      setOperation(null);
    } catch (error) {
      setDisplay('Error');
      setWaitingForNewValue(true);
      setPreviousValue(null);
      setOperation(null);
    }
  }, [display, addToHistory, angleMode]);

  const handleConstant = useCallback((constant: string) => {
    let value: string;
    let expression: string;

    switch (constant) {
      case 'pi':
        value = formatNumber(Math.PI);
        expression = 'π';
        break;
      case 'e':
        value = formatNumber(Math.E);
        expression = 'e';
        break;
      default:
        return;
    }

    addToHistory({
      type: 'scientific',
      calculation: expression,
      result: value,
    });

    setDisplay(value);
    setWaitingForNewValue(true);
    setPreviousValue(null);
    setOperation(null);
  }, [addToHistory]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForNewValue(false);
  }, []);

  const handleDecimal = useCallback(() => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  }, [display, waitingForNewValue]);

  const handleBackspace = useCallback(() => {
    if (waitingForNewValue) {
      return;
    }
    
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  }, [display, waitingForNewValue]);

  const ButtonComponent = ({ 
    onClick, 
    className: btnClassName, 
    variant = 'default',
    children,
    ...props 
  }: any) => (
    <Button
      onClick={onClick}
      className={cn(
        'h-12 font-semibold transition-all duration-200 hover:scale-105 active:scale-95',
        variant === 'number' && 'bg-gradient-number hover:shadow-aura',
        variant === 'operator' && 'bg-gradient-operator hover:shadow-glow',
        variant === 'equals' && 'bg-gradient-success hover:shadow-success',
        variant === 'clear' && 'bg-gradient-danger hover:shadow-danger',
        variant === 'scientific' && 'bg-gradient-secondary hover:shadow-secondary text-xs',
        btnClassName
      )}
      {...props}
    >
      {children}
    </Button>
  );

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardContent className="p-6 space-y-4">
        {/* Display */}
        <div className="bg-gradient-card rounded-lg p-4 min-h-[80px] flex items-center justify-end border border-border/20">
          <div className="text-right">
            <div className="text-3xl font-bold text-foreground break-all">
              {display}
            </div>
            {operation && previousValue && (
              <div className="text-sm text-muted-foreground">
                {previousValue} {operation}
              </div>
            )}
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAngleMode(angleMode === 'deg' ? 'rad' : 'deg')}
            className="text-xs"
          >
            {angleMode === 'deg' ? 'DEG' : 'RAD'}
          </Button>
          <span className="text-xs text-muted-foreground">Scientific Mode</span>
        </div>

        {/* Scientific Functions Row */}
        <div className="grid grid-cols-5 gap-2">
          <ButtonComponent variant="scientific" onClick={() => handleScientificFunction('sin')}>
            sin
          </ButtonComponent>
          <ButtonComponent variant="scientific" onClick={() => handleScientificFunction('cos')}>
            cos
          </ButtonComponent>
          <ButtonComponent variant="scientific" onClick={() => handleScientificFunction('tan')}>
            tan
          </ButtonComponent>
          <ButtonComponent variant="scientific" onClick={() => handleScientificFunction('ln')}>
            ln
          </ButtonComponent>
          <ButtonComponent variant="scientific" onClick={() => handleScientificFunction('log')}>
            log
          </ButtonComponent>
        </div>

        <div className="grid grid-cols-5 gap-2">
          <ButtonComponent variant="scientific" onClick={() => handleConstant('pi')}>
            π
          </ButtonComponent>
          <ButtonComponent variant="scientific" onClick={() => handleConstant('e')}>
            e
          </ButtonComponent>
          <ButtonComponent variant="scientific" onClick={() => handleScientificFunction('sqrt')}>
            √
          </ButtonComponent>
          <ButtonComponent variant="scientific" onClick={() => handleScientificFunction('cbrt')}>
            ∛
          </ButtonComponent>
          <ButtonComponent variant="scientific" onClick={() => handleScientificFunction('factorial')}>
            n!
          </ButtonComponent>
        </div>

        <div className="grid grid-cols-5 gap-2">
          <ButtonComponent variant="scientific" onClick={() => handleScientificFunction('square')}>
            x²
          </ButtonComponent>
          <ButtonComponent variant="scientific" onClick={() => handleOperator('^')}>
            x^y
          </ButtonComponent>
          <ButtonComponent variant="scientific" onClick={() => handleScientificFunction('exp')}>
            e^x
          </ButtonComponent>
          <ButtonComponent variant="scientific" onClick={() => handleScientificFunction('reciprocal')}>
            1/x
          </ButtonComponent>
          <ButtonComponent variant="clear" onClick={handleBackspace}>
            ⌫
          </ButtonComponent>
        </div>

        {/* Standard Calculator Layout */}
        <div className="grid grid-cols-4 gap-2">
          <ButtonComponent variant="clear" onClick={handleClear} className="col-span-2">
            Clear
          </ButtonComponent>
          <ButtonComponent variant="operator" onClick={() => handleOperator('/')}>
            ÷
          </ButtonComponent>
          <ButtonComponent variant="operator" onClick={() => handleOperator('*')}>
            ×
          </ButtonComponent>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <ButtonComponent variant="number" onClick={() => handleNumber('7')}>7</ButtonComponent>
          <ButtonComponent variant="number" onClick={() => handleNumber('8')}>8</ButtonComponent>
          <ButtonComponent variant="number" onClick={() => handleNumber('9')}>9</ButtonComponent>
          <ButtonComponent variant="operator" onClick={() => handleOperator('-')}>
            −
          </ButtonComponent>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <ButtonComponent variant="number" onClick={() => handleNumber('4')}>4</ButtonComponent>
          <ButtonComponent variant="number" onClick={() => handleNumber('5')}>5</ButtonComponent>
          <ButtonComponent variant="number" onClick={() => handleNumber('6')}>6</ButtonComponent>
          <ButtonComponent variant="operator" onClick={() => handleOperator('+')}>
            +
          </ButtonComponent>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <ButtonComponent variant="number" onClick={() => handleNumber('1')}>1</ButtonComponent>
          <ButtonComponent variant="number" onClick={() => handleNumber('2')}>2</ButtonComponent>
          <ButtonComponent variant="number" onClick={() => handleNumber('3')}>3</ButtonComponent>
          <ButtonComponent variant="equals" onClick={handleEquals} className="row-span-2">
            =
          </ButtonComponent>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <ButtonComponent variant="number" onClick={() => handleNumber('0')} className="col-span-2">
            0
          </ButtonComponent>
          <ButtonComponent variant="number" onClick={handleDecimal}>.</ButtonComponent>
        </div>
      </CardContent>
    </Card>
  );
}