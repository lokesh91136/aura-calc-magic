import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalculatorButton } from '@/components/ui/calculator-button';
import { useHistory } from '@/contexts/HistoryContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface SavingsResult {
  monthlySavings: number;
  totalSaved: number;
  interestEarned: number;
  savingsPercentage: number;
  projectionData: Array<{ month: number; amount: number }>;
}

export function SavingsGoalCalculator() {
  const [goalAmount, setGoalAmount] = useState<string>('500000');
  const [timeframe, setTimeframe] = useState<string>('5');
  const [interestRate, setInterestRate] = useState<string>('8');
  const [result, setResult] = useState<SavingsResult | null>(null);
  const [animateRing, setAnimateRing] = useState(false);
  const { addToHistory } = useHistory();

  const calculateSavings = () => {
    const FV = parseFloat(goalAmount); // Future Value
    const r = parseFloat(interestRate) / 100 / 12; // Monthly rate
    const n = parseFloat(timeframe) * 12; // Total months

    if (isNaN(FV) || isNaN(r) || isNaN(n) || FV <= 0 || n <= 0) return;

    // Formula: PMT = FV * r / [(1 + r)^n - 1]
    const monthlySavings = FV * r / (Math.pow(1 + r, n) - 1);
    const totalSaved = monthlySavings * n;
    const interestEarned = FV - totalSaved;
    const savingsPercentage = (totalSaved / FV) * 100;

    // Generate projection data for chart
    const projectionData = [];
    let runningTotal = 0;
    for (let month = 1; month <= n; month++) {
      runningTotal = monthlySavings * ((Math.pow(1 + r, month) - 1) / r);
      projectionData.push({ 
        month, 
        amount: Math.round(runningTotal) 
      });
    }

    setResult({ monthlySavings, totalSaved, interestEarned, savingsPercentage, projectionData });
    setAnimateRing(false);
    setTimeout(() => setAnimateRing(true), 50);

    addToHistory({
      type: 'savings',
      calculation: `Goal: ₹${FV.toLocaleString('en-IN')} in ${parseFloat(timeframe)} years at ${parseFloat(interestRate)}%`,
      result: `Save ₹${monthlySavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/month`,
      details: { monthlySavings, totalSaved, interestEarned }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const reset = () => {
    setGoalAmount('500000');
    setTimeframe('5');
    setInterestRate('8');
    setResult(null);
  };

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = result ? circumference - (result.savingsPercentage / 100) * circumference : circumference;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-slide-up">
      <Card className="bg-gradient-card border-border/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-neon bg-clip-text text-transparent">
            Savings Goal Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goal" className="text-foreground/90">Goal Amount</Label>
              <Input
                id="goal"
                type="number"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                placeholder="500000"
                className="bg-gradient-number border-border/20 text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeframe" className="text-foreground/90">Timeframe (Years)</Label>
              <Input
                id="timeframe"
                type="number"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                placeholder="5"
                className="bg-gradient-number border-border/20 text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interest" className="text-foreground/90">Expected Interest (%)</Label>
              <Input
                id="interest"
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="8"
                className="bg-gradient-number border-border/20 text-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CalculatorButton variant="equals" onClick={calculateSavings} className="w-full">
              Calculate
            </CalculatorButton>
            <CalculatorButton variant="clear" onClick={reset} className="w-full">
              Reset
            </CalculatorButton>
          </div>

          {result && (
            <>
              {/* Progress Ring & Chart Section */}
              <Card className="bg-gradient-savings border-border/20 overflow-hidden">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Progress Ring */}
                    <div className="flex flex-col items-center justify-center">
                      <div className="relative w-40 h-40">
                        <svg className="transform -rotate-90 w-40 h-40">
                          {/* Background circle */}
                          <circle
                            cx="80"
                            cy="80"
                            r={radius}
                            stroke="hsl(var(--border))"
                            strokeWidth="8"
                            fill="none"
                            className="opacity-20"
                          />
                          {/* Progress circle */}
                          <circle
                            cx="80"
                            cy="80"
                            r={radius}
                            stroke="url(#neonGradient)"
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            className={animateRing ? 'animate-ring-fill' : ''}
                            style={{ '--ring-offset': offset } as React.CSSProperties}
                          />
                          <defs>
                            <linearGradient id="neonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="hsl(328 100% 50%)" />
                              <stop offset="100%" stopColor="hsl(23 100% 50%)" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-bold bg-gradient-neon bg-clip-text text-transparent">
                            {result.savingsPercentage.toFixed(1)}%
                          </span>
                          <span className="text-xs text-muted-foreground mt-1">Savings</span>
                        </div>
                      </div>
                      <p className="text-sm text-center text-muted-foreground mt-4">
                        Your contribution vs. goal amount
                      </p>
                    </div>

                    {/* Savings Projection Chart */}
                    <div className="flex flex-col">
                      <h4 className="text-sm font-semibold text-foreground/90 mb-3">Savings Projection</h4>
                      <ResponsiveContainer width="100%" height={180}>
                        <AreaChart data={result.projectionData}>
                          <defs>
                            <linearGradient id="projectionGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(328 100% 50%)" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="hsl(23 100% 50%)" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <XAxis 
                            dataKey="month" 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis 
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-card border border-border/50 p-3 rounded-lg shadow-lg">
                                    <p className="text-xs text-muted-foreground">
                                      Month {payload[0].payload.month}
                                    </p>
                                    <p className="text-sm font-bold text-foreground">
                                      {formatCurrency(payload[0].value as number)}
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="amount" 
                            stroke="hsl(328 100% 50%)" 
                            strokeWidth={2}
                            fill="url(#projectionGradient)"
                            className="animate-neon-glow"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-equals border-0">
                  <CardContent className="p-4">
                    <div className="text-sm text-white/80">Monthly Savings</div>
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(result.monthlySavings)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-primary border-border/10">
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Total Saved</div>
                    <div className="text-2xl font-bold text-foreground">
                      {formatCurrency(result.totalSaved)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-operator border-0">
                  <CardContent className="p-4">
                    <div className="text-sm text-white/80">Interest Earned</div>
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(result.interestEarned)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
