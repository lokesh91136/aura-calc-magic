import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalculatorButton } from '@/components/ui/calculator-button';
import { useHistory } from '@/contexts/HistoryContext';

interface EMIResult {
  emi: number;
  totalAmount: number;
  totalInterest: number;
  principalAmount: number;
}

export function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState<string>('1000000');
  const [interestRate, setInterestRate] = useState<string>('8.5');
  const [tenure, setTenure] = useState<string>('20');
  const [result, setResult] = useState<EMIResult | null>(null);
  const { addToHistory } = useHistory();

  const calculateEMI = () => {
    const P = parseFloat(loanAmount);
    const r = parseFloat(interestRate) / 100 / 12; // Monthly rate
    const n = parseFloat(tenure) * 12; // Total months
    
    if (isNaN(P) || isNaN(r) || isNaN(n) || P <= 0 || n <= 0) return;

    // EMI Formula: EMI = [P × r × (1 + r)^n] / [(1 + r)^n - 1]
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalAmount = emi * n;
    const totalInterest = totalAmount - P;

    setResult({
      emi,
      totalAmount,
      totalInterest,
      principalAmount: P
    });
    
    // Save to history
    addToHistory({
      type: 'emi',
      calculation: `₹${P.toLocaleString('en-IN')} loan for ${parseFloat(tenure)} years at ${parseFloat(interestRate)}%`,
      result: `₹${emi.toLocaleString('en-IN')}/month`,
      details: {
        emi,
        totalAmount,
        totalInterest,
        principalAmount: P
      }
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
            EMI Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loan-amount">Loan Amount</Label>
              <Input
                id="loan-amount"
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                placeholder="1000000"
                className="bg-gradient-number border-border/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interest">Interest Rate (% per annum)</Label>
              <Input
                id="interest"
                type="number"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="8.5"
                className="bg-gradient-number border-border/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenure">Tenure (Years)</Label>
              <Input
                id="tenure"
                type="number"
                value={tenure}
                onChange={(e) => setTenure(e.target.value)}
                placeholder="20"
                className="bg-gradient-number border-border/20"
              />
            </div>
          </div>
          
          <CalculatorButton
            variant="equals"
            onClick={calculateEMI}
            className="w-full"
          >
            Calculate EMI
          </CalculatorButton>
          
          {result && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card className="bg-gradient-equals border-0">
                <CardContent className="p-4">
                  <div className="text-sm text-white/80">Monthly EMI</div>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(result.emi)}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-number border-border/10">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Principal Amount</div>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(result.principalAmount)}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-clear border-0">
                <CardContent className="p-4">
                  <div className="text-sm text-white/80">Total Interest</div>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(result.totalInterest)}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-operator border-0">
                <CardContent className="p-4">
                  <div className="text-sm text-white/80">Total Amount</div>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(result.totalAmount)}
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