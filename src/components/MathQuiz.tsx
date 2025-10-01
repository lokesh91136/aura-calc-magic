import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalculatorButton } from '@/components/ui/calculator-button';
import { useVoice } from '@/contexts/VoiceContext';
import { useHistory } from '@/contexts/HistoryContext';
import { cn } from '@/lib/utils';

interface MathProblem {
  question: string;
  answer: number;
  operation: string;
}

interface MathQuizProps {
  onBackToCalculator: () => void;
}

export function MathQuiz({ onBackToCalculator }: MathQuizProps) {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [pastScores, setPastScores] = useState<number[]>([]);
  
  const { speak } = useVoice();
  const { addToHistory } = useHistory();

  // Generate random math problem
  const generateProblem = useCallback((): MathProblem => {
    const operations = ['+', '-', '×', '÷'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1: number, num2: number, answer: number, question: string;
    
    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 50) + 25;
        num2 = Math.floor(Math.random() * 25) + 1;
        answer = num1 - num2;
        question = `${num1} - ${num2}`;
        break;
      case '×':
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        question = `${num1} × ${num2}`;
        break;
      case '÷':
        answer = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        num1 = answer * num2;
        question = `${num1} ÷ ${num2}`;
        break;
      default:
        num1 = 1; num2 = 1; answer = 2; question = '1 + 1';
    }
    
    return { question, answer, operation };
  }, []);

  // Start game
  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(30);
    setUserInput('');
    setFeedback(null);
    setCurrentProblem(generateProblem());
  }, [generateProblem]);

  // Handle number input
  const handleNumberClick = useCallback((value: string) => {
    if (gameState !== 'playing') return;
    
    if (value === 'C') {
      setUserInput('');
    } else if (value === '⌫') {
      setUserInput(prev => prev.slice(0, -1));
    } else {
      setUserInput(prev => prev + value);
    }
  }, [gameState]);

  // Check answer
  const checkAnswer = useCallback(() => {
    if (!currentProblem || !userInput || gameState !== 'playing') return;
    
    const userAnswer = parseInt(userInput);
    const isCorrect = userAnswer === currentProblem.answer;
    
    setFeedback(isCorrect ? 'correct' : 'wrong');
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      speak('Correct!');
    } else {
      speak('Wrong!');
    }

    // Reset timer for next round and move to next problem
    setTimeout(() => {
      setUserInput('');
      setFeedback(null);
      setTimeLeft(30); // Reset timer to 30 seconds for next round
      setCurrentProblem(generateProblem());
    }, 1000);
  }, [currentProblem, userInput, gameState, speak, generateProblem]);

  // Handle Enter key for submitting answer
  const handleEnterClick = useCallback(() => {
    checkAnswer();
  }, [checkAnswer]);

  // Timer effect - counts down per round
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState === 'playing' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Time's up for this round, move to next problem
            setUserInput('');
            setFeedback(null);
            setCurrentProblem(generateProblem());
            return 30; // Reset to 30 seconds for next round
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [gameState, timeLeft, generateProblem]);

  // Game finished effect
  useEffect(() => {
    if (gameState === 'finished') {
      setPastScores(prev => [score, ...prev.slice(0, 4)]);
      addToHistory({
        type: 'standard',
        calculation: `Math Quiz - Score: ${score}/30`,
        result: score,
        details: { gameType: 'mathQuiz', timeLimit: 30 }
      });
      speak(`Game over! Your score is ${score}`);
    }
  }, [gameState]); // Remove speak from dependencies to prevent multiple announcements

  const calculatorButtons = [
    ['7', '8', '9', 'C'],
    ['4', '5', '6', '⌫'],
    ['1', '2', '3', '='],
    ['0', '.', '', '']
  ];

  return (
    <div className="min-h-screen bg-gradient-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBackToCalculator}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Calculator
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Math Quiz
          </h1>
          <div className="w-32" /> {/* Spacer for centering */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {gameState === 'waiting' && (
              <Card className="bg-gradient-card border-border/20">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl mb-4">Ready to Play?</CardTitle>
                  <p className="text-muted-foreground mb-6">
                    Solve math problems! Each problem gives you 30 seconds.
                  </p>
                  <Button
                    onClick={startGame}
                    size="lg"
                    className="bg-gradient-primary hover:scale-105 transition-transform shadow-aura"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Start Quiz
                  </Button>
                </CardHeader>
              </Card>
            )}

            {gameState === 'playing' && currentProblem && (
              <div className="space-y-6">
                {/* Timer and Score */}
                <div className="flex justify-between items-center">
                  <Card className="bg-gradient-card border-border/20">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{timeLeft}s</div>
                        <div className="text-sm text-muted-foreground">Time Left</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-card border-border/20">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{score}</div>
                        <div className="text-sm text-muted-foreground">Score</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Problem Display */}
                <Card className={cn(
                  "bg-gradient-card border-border/20 transition-all duration-300",
                  feedback === 'correct' && "ring-2 ring-success animate-bounce-gentle",
                  feedback === 'wrong' && "ring-2 ring-destructive animate-bounce-gentle"
                )}>
                  <CardContent className="p-8 text-center">
                    <div className="text-4xl font-bold mb-4 text-foreground">
                      {currentProblem.question} = ?
                    </div>
                    <div className="text-2xl font-mono min-h-[40px] flex items-center justify-center">
                      {userInput || '_'}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {gameState === 'finished' && (
              <Card className="bg-gradient-card border-border/20">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl mb-4">Game Over!</CardTitle>
                  <div className="text-6xl font-bold text-primary mb-4">{score}</div>
                  <p className="text-muted-foreground mb-6">
                    You solved {score} problems correctly!
                  </p>
                  <Button
                    onClick={startGame}
                    size="lg"
                    className="bg-gradient-primary hover:scale-105 transition-transform shadow-aura"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Play Again
                  </Button>
                </CardHeader>
              </Card>
            )}
          </div>

          {/* Calculator Keypad */}
          <div className="space-y-6">
            {gameState === 'playing' && (
              <Card className="bg-gradient-card border-border/20">
                <CardHeader>
                  <CardTitle className="text-center">Calculator</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-4 gap-3">
                    {calculatorButtons.flat().map((btn, index) => {
                      if (!btn) return <div key={index} />;
                      
                      return (
                        <CalculatorButton
                          key={btn}
                          variant={
                            btn === 'C' ? 'clear' : 
                            btn === '=' ? 'equals' : 
                            ['÷', '×', '-', '+'].includes(btn) ? 'operator' : 
                            'number'
                          }
                          onClick={() => btn === '=' ? handleEnterClick() : handleNumberClick(btn)}
                          className="h-12"
                        >
                          {btn}
                        </CalculatorButton>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Score History */}
            {pastScores.length > 0 && (
              <Card className="bg-gradient-card border-border/20">
                <CardHeader>
                  <CardTitle className="text-center">Recent Scores</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    {pastScores.map((pastScore, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 rounded bg-muted/20"
                      >
                        <span className="text-sm">Game {pastScores.length - index}</span>
                        <span className="font-bold text-primary">{pastScore}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}