import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalculatorButton } from '@/components/ui/calculator-button';
import { useHistory } from '@/contexts/HistoryContext';

interface TaxResult {
  taxPayable: number;
  netIncome: number;
  effectiveRate: number;
}

export function TaxCalculator() {
  const [income, setIncome] = useState<string>('1000000');
  const [taxRate, setTaxRate] = useState<string>('30');
  const [result, setResult] = useState<TaxResult | null>(null);
  const { addToHistory } = useHistory();

  const calculateTax = () => {
    const incomeAmount = parseFloat(income);
    const rate = parseFloat(taxRate);

    if (isNaN(incomeAmount) || isNaN(rate) || incomeAmount <= 0 || rate < 0) return;

    const taxPayable = (incomeAmount * rate) / 100;
    const netIncome = incomeAmount - taxPayable;
    const effectiveRate = rate;

    setResult({ taxPayable, netIncome, effectiveRate });

    addToHistory({
      type: 'tax',
      calculation: `Income: ₹${incomeAmount.toLocaleString('en-IN')} at ${rate}%`,
      result: `Tax: ₹${taxPayable.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      details: { taxPayable, netIncome, effectiveRate }
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
    setIncome('1000000');
    setTaxRate('30');
    setResult(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-slide-up">
      <Card className="bg-gradient-card border-border/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Tax Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="income">Annual Income</Label>
              <Input
                id="income"
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                placeholder="1000000"
                className="bg-gradient-number border-border/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxrate">Tax Rate (%)</Label>
              <Input
                id="taxrate"
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="30"
                className="bg-gradient-number border-border/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CalculatorButton variant="equals" onClick={calculateTax} className="w-full">
              Calculate
            </CalculatorButton>
            <CalculatorButton variant="clear" onClick={reset} className="w-full">
              Reset
            </CalculatorButton>
          </div>

          {result && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card className="bg-gradient-operator border-0">
                <CardContent className="p-4">
                  <div className="text-sm text-white/80">Tax Payable</div>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(result.taxPayable)}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-equals border-0">
                <CardContent className="p-4">
                  <div className="text-sm text-white/80">Net Income</div>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(result.netIncome)}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-primary border-border/10">
                <CardContent className="p-4">
                  <div className="text-sm text-muted-foreground">Effective Rate</div>
                  <div className="text-2xl font-bold text-foreground">
                    {result.effectiveRate.toFixed(2)}%
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
