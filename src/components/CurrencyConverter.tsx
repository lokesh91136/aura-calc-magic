import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalculatorButton } from '@/components/ui/calculator-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHistory } from '@/contexts/HistoryContext';

const exchangeRates: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.12,
  JPY: 149.50,
  AUD: 1.52,
  CAD: 1.36,
  CHF: 0.88,
};

const currencies = Object.keys(exchangeRates);

export function CurrencyConverter() {
  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('INR');
  const [result, setResult] = useState<number | null>(null);
  const { addToHistory } = useHistory();

  const convertCurrency = () => {
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) return;

    // Convert to USD first, then to target currency
    const amountInUSD = amountValue / exchangeRates[fromCurrency];
    const convertedAmount = amountInUSD * exchangeRates[toCurrency];

    setResult(convertedAmount);

    addToHistory({
      type: 'currency',
      calculation: `${amountValue} ${fromCurrency} to ${toCurrency}`,
      result: `${convertedAmount.toFixed(2)} ${toCurrency}`,
    });
  };

  const reset = () => {
    setAmount('100');
    setFromCurrency('USD');
    setToCurrency('INR');
    setResult(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-slide-up">
      <Card className="bg-gradient-card border-border/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Currency Converter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100"
                className="bg-gradient-number border-border/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from">From Currency</Label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger id="from" className="bg-gradient-number border-border/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr} value={curr}>
                        {curr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="to">To Currency</Label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger id="to" className="bg-gradient-number border-border/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr} value={curr}>
                        {curr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CalculatorButton variant="equals" onClick={convertCurrency} className="w-full">
              Convert
            </CalculatorButton>
            <CalculatorButton variant="clear" onClick={reset} className="w-full">
              Reset
            </CalculatorButton>
          </div>

          {result !== null && (
            <Card className="bg-gradient-equals border-0 mt-6">
              <CardContent className="p-6 text-center">
                <div className="text-sm text-white/80 mb-2">Converted Amount</div>
                <div className="text-4xl font-bold text-white">
                  {result.toFixed(2)} {toCurrency}
                </div>
                <div className="text-sm text-white/60 mt-2">
                  {amount} {fromCurrency} = {result.toFixed(2)} {toCurrency}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
