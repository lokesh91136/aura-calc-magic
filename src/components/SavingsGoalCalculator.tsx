import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalculatorButton } from '@/components/ui/calculator-button';
import { useHistory } from '@/contexts/HistoryContext';

interface SavingsResult {
  monthlySavings: number;
  totalSaved: number;
  interestEarned: number;
}

export function SavingsGoalCalculator() {
  const [goalAmount, setGoalAmount] = useState<string>('500000');
  const [timeframe, setTimeframe] = useState<string>('5');
  const [interestRate, setInterestRate] = useState<string>('8');
  const [result, setResult] = useState<SavingsResult | null>(null);
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

    setResult({ monthlySavings, totalSaved, interestEarned });

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

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-slide-up">
      <Card className="bg-gradient-card border-border/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Savings Goal Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goal">Goal Amount</Label>
              <Input
                id="goal"
                type="number"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                placeholder="500000"
                className="bg-gradient-number border-border/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeframe">Timeframe (Years)</Label>
              <Input
                id="timeframe"
                type="number"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                placeholder="5"
                className="bg-gradient-number border-border/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interest">Expected Interest (%)</Label>
              <Input
                id="interest"
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="8"
                className="bg-gradient-number border-border/20"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
