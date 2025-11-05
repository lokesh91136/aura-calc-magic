import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalculatorButton } from '@/components/ui/calculator-button';
import { useHistory } from '@/contexts/HistoryContext';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Car, Bike } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [progress, setProgress] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [vehicleType, setVehicleType] = useState<'car' | 'bike'>('car');
  const [animationSpeed, setAnimationSpeed] = useState<number>(1.5);
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
    setProgress(0);
    setIsAnimating(true);

    addToHistory({
      type: 'loan',
      calculation: `₹${P.toLocaleString('en-IN')} at ${parseFloat(interestRate)}% for ${parseFloat(tenure)} years`,
      result: `EMI: ₹${emi.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      details: { emi, totalInterest, totalRepayment }
    });
  };

  useEffect(() => {
    if (isAnimating && progress < 100) {
      const timer = setTimeout(() => {
        setProgress(prev => Math.min(prev + 1, 100));
      }, (animationSpeed * 1500) / 100);
      return () => clearTimeout(timer);
    } else if (progress === 100 && isAnimating) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF00A6', '#FF6A00', '#00FF88']
      });
      setIsAnimating(false);
    }
  }, [progress, isAnimating, animationSpeed]);

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
    setProgress(0);
    setIsAnimating(false);
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
            <CalculatorButton 
              variant="equals" 
              onClick={calculateLoan} 
              className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
            >
              Calculate
            </CalculatorButton>
            <CalculatorButton 
              variant="clear" 
              onClick={reset} 
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-[0_0_20px_rgba(249,115,22,0.5)]"
            >
              Reset
            </CalculatorButton>
          </div>

          {/* Vehicle Type & Speed Controls */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/20">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Vehicle:</span>
              <Button
                variant={vehicleType === 'car' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVehicleType('car')}
                className="h-8"
              >
                <Car className="w-4 h-4" />
              </Button>
              <Button
                variant={vehicleType === 'bike' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVehicleType('bike')}
                className="h-8"
              >
                <Bike className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Speed:</span>
              <Button
                variant={animationSpeed === 1 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAnimationSpeed(1)}
                className="h-8 text-xs"
              >
                Fast
              </Button>
              <Button
                variant={animationSpeed === 1.5 ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAnimationSpeed(1.5)}
                className="h-8 text-xs"
              >
                Normal
              </Button>
            </div>
          </div>

          {/* Loan Journey Animation */}
          {result && (
            <Card className="bg-gradient-to-br from-[#17101F] to-[#2C1B47] border border-primary/20 shadow-[0_0_30px_rgba(255,0,166,0.3)] mt-6">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Road with Vehicle */}
                  <div className="relative h-32 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-orange-500/20 rounded-2xl overflow-hidden">
                    {/* Road gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 opacity-20"></div>
                    
                    {/* Milestone markers */}
                    {[0, 20, 40, 60, 80, 100].map((milestone) => (
                      <div
                        key={milestone}
                        className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center"
                        style={{ left: `${milestone}%` }}
                      >
                        <div 
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            progress >= milestone 
                              ? 'bg-gradient-to-r from-emerald-400 to-green-400 shadow-[0_0_15px_rgba(16,185,129,0.8)]' 
                              : 'bg-muted/30'
                          }`}
                        />
                        <span className="text-xs text-muted-foreground mt-1">{milestone}%</span>
                      </div>
                    ))}

                    {/* Start and End Labels */}
                    <div className="absolute top-2 left-2 text-xs font-semibold text-emerald-400 flex items-center gap-1">
                      🚦 Loan Start
                    </div>
                    <div className="absolute top-2 right-2 text-xs font-semibold text-orange-400 flex items-center gap-1">
                      Loan Cleared 🏁
                    </div>

                    {/* Moving Vehicle */}
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2"
                      animate={{ left: `${progress}%` }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      style={{ marginLeft: '-20px' }}
                    >
                      <div className="relative">
                        {vehicleType === 'car' ? (
                          <Car className="w-10 h-10 text-primary drop-shadow-[0_0_15px_rgba(255,0,166,0.8)]" />
                        ) : (
                          <Bike className="w-10 h-10 text-primary drop-shadow-[0_0_15px_rgba(255,0,166,0.8)]" />
                        )}
                        <div className="absolute inset-0 bg-primary/30 blur-xl rounded-full animate-pulse"></div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Completion Message */}
                  {progress === 100 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-4"
                    >
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                        🎉 Congratulations! Loan Fully Paid 🎉
                      </h3>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

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
