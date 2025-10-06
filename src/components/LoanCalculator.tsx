import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalculatorButton } from '@/components/ui/calculator-button';
import { useHistory } from '@/contexts/HistoryContext';

interface LoanResult {
  emi: number;
  totalInterest: number;
  totalRepayment: number;
}

export function LoanCalculator() {
  const [loanAmount, setLoanAmount] = useState<string>('500000');
  const [interestRate, setInterestRate] = useState<string>('10');
  const [tenure, setTenure] = useState<string>('5');
  const [result, setResult] = useState<LoanResult | null>(null);
  const { addToHistory } = useHistory();

  const calculateLoan = () => {
    const P = parseFloat(loanAmount);
    const r = parseFloat(interestRate) / 100 / 12; // Monthly rate
    const n = parseFloat(tenure) * 12; // Total months

    if (isNaN(P) || isNaN(r) || isNaN(n) || P <= 0 || n <= 0) return;

    // EMI Formula: [P x R x (1+R)^N] / [(1+R)^N-1]
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalRepayment = emi * n;
    const totalInterest = totalRepayment - P;

    setResult({ emi, totalInterest, totalRepayment });

    addToHistory({
      type: 'loan',
      calculation: `₹${P.toLocaleString('en-IN')} at ${parseFloat(interestRate)}% for ${parseFloat(tenure)} years`,
      result: `EMI: ₹${emi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      details: { emi, totalInterest, totalRepayment }
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
    setLoanAmount('500000');
    setInterestRate('10');
    setTenure('5');
    setResult(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-slide-up">
      <Card className="bg-gradient-card border-border/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Loan Repayment Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loan">Loan Amount</Label>
              <Input
                id="loan"
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                placeholder="500000"
                className="bg-gradient-number border-border/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rate">Interest Rate (%)</Label>
              <Input
                id="rate"
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="10"
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
                placeholder="5"
                className="bg-gradient-number border-border/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CalculatorButton variant="equals" onClick={calculateLoan} className="w-full">
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
                  <div className="text-sm text-white/80">Monthly EMI</div>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(result.emi)}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-operator border-0">
                <CardContent className="p-4">
                  <div className="text-sm text-white/80">Total Interest</div>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(result.totalInterest)}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-primary border-border/10">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Total Repayment</div>
                  <div className="text-2xl font-bold text-foreground">
                    {formatCurrency(result.totalRepayment)}
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
