import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalculatorButton } from '@/components/ui/calculator-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function PercentageCalculator() {
  const [basicValue, setBasicValue] = useState<string>('');
  const [basicPercent, setBasicPercent] = useState<string>('');
  const [basicResult, setBasicResult] = useState<string>('');

  const [changeOld, setChangeOld] = useState<string>('');
  const [changeNew, setChangeNew] = useState<string>('');
  const [changeResult, setChangeResult] = useState<string>('');

  const calculateBasicPercentage = () => {
    const value = parseFloat(basicValue);
    const percent = parseFloat(basicPercent);
    
    if (isNaN(value) || isNaN(percent)) return;
    
    const result = (value * percent) / 100;
    setBasicResult(result.toString());
  };

  const calculatePercentageChange = () => {
    const oldVal = parseFloat(changeOld);
    const newVal = parseFloat(changeNew);
    
    if (isNaN(oldVal) || isNaN(newVal) || oldVal === 0) return;
    
    const change = ((newVal - oldVal) / oldVal) * 100;
    setChangeResult(change.toFixed(2));
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-slide-up">
      <Card className="bg-gradient-card border-border/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Percentage Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="basic">Basic %</TabsTrigger>
              <TabsTrigger value="change">% Change</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-4">
              <div className="text-center text-lg font-medium mb-4">
                What is <span className="text-primary font-bold">{basicPercent || 'X'}%</span> of <span className="text-primary font-bold">{basicValue || 'Y'}</span>?
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    type="number"
                    value={basicValue}
                    onChange={(e) => setBasicValue(e.target.value)}
                    placeholder="Enter value"
                    className="bg-gradient-number border-border/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="percent">Percentage (%)</Label>
                  <Input
                    id="percent"
                    type="number"
                    value={basicPercent}
                    onChange={(e) => setBasicPercent(e.target.value)}
                    placeholder="Enter %"
                    className="bg-gradient-number border-border/20"
                  />
                </div>
              </div>
              
              <CalculatorButton
                variant="equals"
                onClick={calculateBasicPercentage}
                className="w-full"
              >
                Calculate
              </CalculatorButton>
              
              {basicResult && (
                <Card className="bg-gradient-equals border-0">
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-white/80">Result</div>
                    <div className="text-3xl font-bold text-white">
                      {parseFloat(basicResult).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="change" className="space-y-4">
              <div className="text-center text-lg font-medium mb-4">
                Percentage change from <span className="text-primary font-bold">{changeOld || 'A'}</span> to <span className="text-primary font-bold">{changeNew || 'B'}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="old-value">Old Value</Label>
                  <Input
                    id="old-value"
                    type="number"
                    value={changeOld}
                    onChange={(e) => setChangeOld(e.target.value)}
                    placeholder="Original value"
                    className="bg-gradient-number border-border/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-value">New Value</Label>
                  <Input
                    id="new-value"
                    type="number"
                    value={changeNew}
                    onChange={(e) => setChangeNew(e.target.value)}
                    placeholder="New value"
                    className="bg-gradient-number border-border/20"
                  />
                </div>
              </div>
              
              <CalculatorButton
                variant="equals"
                onClick={calculatePercentageChange}
                className="w-full"
              >
                Calculate Change
              </CalculatorButton>
              
              {changeResult && (
                <Card className={`border-0 ${parseFloat(changeResult) >= 0 ? 'bg-gradient-equals' : 'bg-gradient-clear'}`}>
                  <CardContent className="p-4 text-center">
                    <div className="text-sm text-white/80">Percentage Change</div>
                    <div className="text-3xl font-bold text-white">
                      {parseFloat(changeResult) > 0 ? '+' : ''}{changeResult}%
                    </div>
                    <div className="text-sm text-white/70 mt-1">
                      {parseFloat(changeResult) > 0 ? 'Increase' : parseFloat(changeResult) < 0 ? 'Decrease' : 'No Change'}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}