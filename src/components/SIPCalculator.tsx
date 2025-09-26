import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalculatorButton } from '@/components/ui/calculator-button';

interface SIPResult {
  monthlyInvestment: number;
  totalInvested: number;
  maturityAmount: number;
  totalGains: number;
}

export function SIPCalculator() {
  const [monthlyAmount, setMonthlyAmount] = useState<string>('5000');
  const [duration, setDuration] = useState<string>('10');
  const [expectedReturn, setExpectedReturn] = useState<string>('12');
  const [result, setResult] = useState<SIPResult | null>(null);

  const calculateSIP = () => {
    const P = parseFloat(monthlyAmount);
    const r = parseFloat(expectedReturn) / 100 / 12; // Monthly rate
    const n = parseFloat(duration) * 12; // Total months
    
    if (isNaN(P) || isNaN(r) || isNaN(n) || P <= 0 || n <= 0) return;

    // SIP Formula: M = P × [{(1 + r)^n - 1} / r] × (1 + r)
    const maturityAmount = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));
    const totalInvested = P * n;
    const totalGains = maturityAmount - totalInvested;

    setResult({
      monthlyInvestment: P,
      totalInvested,
      maturityAmount,
      totalGains
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-slide-up">
      <Card className="bg-gradient-card border-border/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            SIP Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthly">Monthly Investment</Label>
              <Input
                id="monthly"
                type="number"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(e.target.value)}
                placeholder="5000"
                className="bg-gradient-number border-border/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (Years)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="10"
                className="bg-gradient-number border-border/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="return">Expected Return (%)</Label>
              <Input
                id="return"
                type="number"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(e.target.value)}
                placeholder="12"
                className="bg-gradient-number border-border/20"
              />
            </div>
          </div>
          
          <CalculatorButton
            variant="equals"
            onClick={calculateSIP}
            className="w-full"
          >
            Calculate SIP Returns
          </CalculatorButton>
          
          {result && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card className="bg-gradient-number border-border/10">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Total Invested</div>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(result.totalInvested)}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-equals border-0">
                <CardContent className="p-4">
                  <div className="text-sm text-white/80">Maturity Amount</div>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(result.maturityAmount)}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-operator border-0">
                <CardContent className="p-4">
                  <div className="text-sm text-white/80">Total Gains</div>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(result.totalGains)}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-primary border-border/10">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Monthly SIP</div>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(result.monthlyInvestment)}
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