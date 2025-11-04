import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useHistory } from '@/contexts/HistoryContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface EMIResult {
  emi: number;
  totalAmount: number;
  totalInterest: number;
  principalAmount: number;
}

export function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState<string>('5000000');
  const [interestRate, setInterestRate] = useState<number>(8.5);
  const [tenure, setTenure] = useState<number>(20);
  const [result, setResult] = useState<EMIResult | null>(null);
  const { addToHistory } = useHistory();

  useEffect(() => {
    calculateEMI();
  }, [loanAmount, interestRate, tenure]);

  const calculateEMI = () => {
    const P = parseFloat(loanAmount);
    const r = interestRate / 100 / 12; // Monthly rate
    const n = tenure * 12; // Total months
    
    if (isNaN(P) || isNaN(r) || isNaN(n) || P <= 0 || n <= 0) return;

    // EMI Formula: EMI = [P × r × (1 + r)^n] / [(1 + r)^n - 1]
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalAmount = emi * n;
    const totalInterest = totalAmount - P;

    const newResult = {
      emi,
      totalAmount,
      totalInterest,
      principalAmount: P
    };

    setResult(newResult);
    
    // Save to history
    addToHistory({
      type: 'emi',
      calculation: `₹${P.toLocaleString('en-IN')} loan for ${tenure} years at ${interestRate}%`,
      result: `₹${emi.toLocaleString('en-IN')}/month`,
      details: newResult
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const chartData = result ? [
    { name: 'Principal Amount', value: result.principalAmount, color: '#FF9F43' },
    { name: 'Interest', value: result.totalInterest, color: '#4F46E5' }
  ] : [];

  return (
    <div className="w-full max-w-6xl mx-auto p-4 animate-slide-up">
      <Card className="bg-background border shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-foreground">
            EMI Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Inputs */}
            <div className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="loan-amount" className="text-base font-semibold">
                  Loan Amount
                </Label>
                <Input
                  id="loan-amount"
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  placeholder="5000000"
                  className="text-lg h-12 border-2"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="interest" className="text-base font-semibold">
                    Interest Rate (% per annum)
                  </Label>
                  <Input
                    id="interest"
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value) || 1)}
                    className="w-20 text-center border-2"
                  />
                </div>
                <Slider
                  value={[interestRate]}
                  onValueChange={(value) => setInterestRate(value[0])}
                  min={1}
                  max={15}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1%</span>
                  <span>15%</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="tenure" className="text-base font-semibold">
                    Loan Duration (Years)
                  </Label>
                  <Input
                    id="tenure"
                    type="number"
                    value={tenure}
                    onChange={(e) => setTenure(parseInt(e.target.value) || 1)}
                    className="w-20 text-center border-2"
                  />
                </div>
                <Slider
                  value={[tenure]}
                  onValueChange={(value) => setTenure(value[0])}
                  min={1}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1 year</span>
                  <span>30 years</span>
                </div>
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="space-y-6">
              {result && (
                <>
                  <div className="text-center p-6 bg-primary/5 rounded-lg border-2 border-primary/20">
                    <div className="text-sm text-muted-foreground mb-2">Monthly EMI</div>
                    <div className="text-4xl font-bold text-primary">
                      {formatCurrency(result.emi)}<span className="text-xl">/month</span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-background border rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#FF9F43]"></div>
                        <span className="text-sm font-medium">Principal Amount</span>
                      </div>
                      <span className="font-bold text-foreground">
                        {formatCurrency(result.principalAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-background border rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-[#4F46E5]"></div>
                        <span className="text-sm font-medium">Interest</span>
                      </div>
                      <span className="font-bold text-foreground">
                        {formatCurrency(result.totalInterest)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-muted/50 border-2 rounded-lg">
                      <span className="text-sm font-semibold">Total Payable</span>
                      <span className="font-bold text-lg text-foreground">
                        {formatCurrency(result.totalAmount)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}