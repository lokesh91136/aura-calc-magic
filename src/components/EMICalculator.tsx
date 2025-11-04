import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useHistory } from '@/contexts/HistoryContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

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

  // Currency converter states
  const [usdAmount, setUsdAmount] = useState<string>('100');
  const [inrAmount, setInrAmount] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [isLoadingRate, setIsLoadingRate] = useState<boolean>(false);

  useEffect(() => {
    calculateEMI();
  }, [loanAmount, interestRate, tenure]);

  // Fetch exchange rate on mount
  useEffect(() => {
    fetchExchangeRate();
  }, []);

  // Update INR when USD or rate changes
  useEffect(() => {
    if (exchangeRate > 0 && usdAmount) {
      const usd = parseFloat(usdAmount);
      if (!isNaN(usd)) {
        setInrAmount((usd * exchangeRate).toFixed(2));
      }
    }
  }, [usdAmount, exchangeRate]);

  const fetchExchangeRate = async () => {
    setIsLoadingRate(true);
    try {
      const response = await fetch('https://v6.exchangerate-api.com/v6/0140668426024454d8ba28e3/latest/USD');
      const data = await response.json();
      if (data.result === 'success') {
        setExchangeRate(data.conversion_rates.INR);
        toast.success('Exchange rate updated');
      } else {
        toast.error('Failed to fetch exchange rate');
      }
    } catch (error) {
      toast.error('Error fetching exchange rate');
      console.error('Exchange rate fetch error:', error);
    } finally {
      setIsLoadingRate(false);
    }
  };

  const handleUsdChange = (value: string) => {
    setUsdAmount(value);
  };

  const handleInrChange = (value: string) => {
    setInrAmount(value);
    if (exchangeRate > 0 && value) {
      const inr = parseFloat(value);
      if (!isNaN(inr)) {
        setUsdAmount((inr / exchangeRate).toFixed(2));
      }
    }
  };

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

      {/* Currency Converter Section */}
      <Card className="bg-gradient-primary border-0 shadow-2xl text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-white">
              Live Currency Converter
            </CardTitle>
            <Button
              onClick={fetchExchangeRate}
              disabled={isLoadingRate}
              variant="secondary"
              size="icon"
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingRate ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="usd" className="text-white/90 text-base font-semibold">💵 USD</Label>
              <Input
                id="usd"
                type="number"
                value={usdAmount}
                onChange={(e) => handleUsdChange(e.target.value)}
                className="h-12 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="Enter USD amount"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inr" className="text-white/90 text-base font-semibold">🇮🇳 INR</Label>
              <Input
                id="inr"
                type="number"
                value={inrAmount}
                onChange={(e) => handleInrChange(e.target.value)}
                className="h-12 text-lg bg-white/10 border-white/20 text-white placeholder:text-white/50"
                placeholder="Enter INR amount"
              />
            </div>
          </div>

          {exchangeRate > 0 && (
            <div className="text-center space-y-1">
              <p className="text-lg font-semibold text-white">
                Live Rate: 1 USD = ₹{exchangeRate.toFixed(2)}
              </p>
              <p className="text-xs text-white/60">
                Powered by ExchangeRate API
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}