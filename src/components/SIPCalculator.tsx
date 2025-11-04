import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useHistory } from '@/contexts/HistoryContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SIPResult {
  monthlyInvestment: number;
  totalInvested: number;
  maturityAmount: number;
  totalGains: number;
}

export function SIPCalculator() {
  const [monthlyAmount, setMonthlyAmount] = useState<string>('5000');
  const [duration, setDuration] = useState<number>(5);
  const [stepUp, setStepUp] = useState<number>(0);
  const [expectedReturn, setExpectedReturn] = useState<number>(12);
  const [result, setResult] = useState<SIPResult | null>(null);
  const { addToHistory } = useHistory();

  const calculateSIP = () => {
    const P = parseFloat(monthlyAmount);
    const r = expectedReturn / 100 / 12; // Monthly rate
    const years = duration;
    const stepUpRate = stepUp / 100;
    
    if (isNaN(P) || P <= 0 || years <= 0) return;

    let totalInvested = 0;
    let maturityAmount = 0;
    let currentMonthlyAmount = P;

    // Calculate with step-up
    for (let year = 0; year < years; year++) {
      const monthsInYear = 12;
      
      for (let month = 0; month < monthsInYear; month++) {
        totalInvested += currentMonthlyAmount;
        const remainingMonths = (years - year) * 12 - month;
        maturityAmount += currentMonthlyAmount * Math.pow(1 + r, remainingMonths);
      }
      
      // Apply step-up at the end of each year (except the last year)
      if (year < years - 1) {
        currentMonthlyAmount = currentMonthlyAmount * (1 + stepUpRate);
      }
    }

    const totalGains = maturityAmount - totalInvested;

    setResult({
      monthlyInvestment: P,
      totalInvested,
      maturityAmount,
      totalGains
    });
    
    // Save to history
    addToHistory({
      type: 'sip',
      calculation: `₹${P.toLocaleString('en-IN')}/month for ${duration} years at ${expectedReturn}%${stepUp > 0 ? ` with ${stepUp}% step-up` : ''}`,
      result: `₹${maturityAmount.toLocaleString('en-IN')}`,
      details: {
        monthlyInvestment: P,
        totalInvested,
        maturityAmount,
        totalGains
      }
    });
  };

  // Auto-calculate when inputs change
  useEffect(() => {
    calculateSIP();
  }, [monthlyAmount, duration, stepUp, expectedReturn]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const chartData = result ? [
    { name: 'Invested Amount', value: result.totalInvested, color: '#3b82f6' },
    { name: 'Est. Returns', value: result.totalGains, color: '#f97316' }
  ] : [];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-slide-up p-4">
      <Card className="bg-card border-border shadow-lg">
        <CardHeader className="border-b border-border/20">
          <CardTitle className="text-2xl font-bold text-foreground">
            Returns Estimator
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Inputs */}
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="monthly" className="text-sm font-medium">
                  Monthly Investment
                </Label>
                <Input
                  id="monthly"
                  type="number"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(e.target.value)}
                  placeholder="5000"
                  className="text-lg h-12 border-border/40 bg-background"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Duration (Years)</Label>
                  <span className="text-lg font-semibold text-primary">{duration}</span>
                </div>
                <Slider
                  value={[duration]}
                  onValueChange={(value) => setDuration(value[0])}
                  min={1}
                  max={30}
                  step={1}
                  className="py-2"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Step-up (Annually) %</Label>
                  <span className="text-lg font-semibold text-primary">{stepUp}%</span>
                </div>
                <Slider
                  value={[stepUp]}
                  onValueChange={(value) => setStepUp(value[0])}
                  min={0}
                  max={30}
                  step={1}
                  className="py-2"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Expected Rate of Return %</Label>
                  <span className="text-lg font-semibold text-primary">{expectedReturn}%</span>
                </div>
                <Slider
                  value={[expectedReturn]}
                  onValueChange={(value) => setExpectedReturn(value[0])}
                  min={8}
                  max={30}
                  step={0.5}
                  className="py-2"
                />
              </div>
            </div>

            {/* Right Side - Results */}
            {result && (
              <div className="space-y-6">
                <div className="text-center space-y-2 p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    The total value of your investment after {duration} {duration === 1 ? 'year' : 'years'} will be
                  </p>
                  <p className="text-4xl font-bold text-primary">
                    {formatCurrency(result.maturityAmount)}
                  </p>
                </div>

                <div className="relative h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
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
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
                      <span className="text-sm font-medium">Invested Amount</span>
                    </div>
                    <span className="text-sm font-bold">
                      {formatCurrency(result.totalInvested)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#f97316]" />
                      <span className="text-sm font-medium">Est. Returns</span>
                    </div>
                    <span className="text-sm font-bold">
                      {formatCurrency(result.totalGains)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}