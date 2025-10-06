import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalculatorButton } from '@/components/ui/calculator-button';
import { useHistory } from '@/contexts/HistoryContext';

interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
}

export function AgeCalculator() {
  const [birthDate, setBirthDate] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [result, setResult] = useState<AgeResult | null>(null);
  const { addToHistory } = useHistory();

  const calculateAge = () => {
    const start = birthDate ? new Date(birthDate) : fromDate ? new Date(fromDate) : null;
    const end = birthDate ? new Date() : toDate ? new Date(toDate) : null;

    if (!start || !end || start > end) return;

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    setResult({ years, months, days, totalDays });

    addToHistory({
      type: 'age',
      calculation: birthDate 
        ? `Age from ${start.toLocaleDateString()}`
        : `Difference: ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`,
      result: `${years}Y ${months}M ${days}D`,
    });
  };

  const reset = () => {
    setBirthDate('');
    setFromDate('');
    setToDate('');
    setResult(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-slide-up">
      <Card className="bg-gradient-card border-border/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Age & Date Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="birthdate">Your Birthdate (for age calculation)</Label>
              <Input
                id="birthdate"
                type="date"
                value={birthDate}
                onChange={(e) => {
                  setBirthDate(e.target.value);
                  setFromDate('');
                  setToDate('');
                }}
                className="bg-gradient-number border-border/20"
              />
            </div>

            <div className="text-center text-sm text-muted-foreground">OR</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromdate">From Date</Label>
                <Input
                  id="fromdate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setBirthDate('');
                  }}
                  className="bg-gradient-number border-border/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="todate">To Date</Label>
                <Input
                  id="todate"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-gradient-number border-border/20"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CalculatorButton variant="equals" onClick={calculateAge} className="w-full">
              Calculate
            </CalculatorButton>
            <CalculatorButton variant="clear" onClick={reset} className="w-full">
              Reset
            </CalculatorButton>
          </div>

          {result && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <Card className="bg-gradient-equals border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-white/80">Years</div>
                  <div className="text-3xl font-bold text-white">{result.years}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-operator border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-white/80">Months</div>
                  <div className="text-3xl font-bold text-white">{result.months}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-primary border-border/10">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-muted-foreground">Days</div>
                  <div className="text-3xl font-bold text-foreground">{result.days}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-number border-border/10">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-muted-foreground">Total Days</div>
                  <div className="text-3xl font-bold text-foreground">{result.totalDays}</div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
