import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useHistory } from '@/contexts/HistoryContext';
import { GraduationCap } from 'lucide-react';

export function MarksPercentageCalculator() {
  const [totalMarks, setTotalMarks] = useState('');
  const [obtainedMarks, setObtainedMarks] = useState('');
  const [result, setResult] = useState<{ percentage: number; steps: string[] } | null>(null);
  const { addToHistory } = useHistory();

  const calculate = () => {
    const total = parseFloat(totalMarks);
    const obtained = parseFloat(obtainedMarks);

    if (isNaN(total) || isNaN(obtained) || total <= 0 || obtained < 0) {
      return;
    }

    const percentage = (obtained / total) * 100;
    const steps = [
      `Step 1: Obtained Marks = ${obtained}`,
      `Step 2: Total Marks = ${total}`,
      `Step 3: Formula = (Obtained ÷ Total) × 100`,
      `Step 4: Calculation = (${obtained} ÷ ${total}) × 100`,
      `Step 5: Result = ${percentage.toFixed(2)}%`
    ];

    setResult({ percentage, steps });

    addToHistory({
      type: 'marks-percentage',
      calculation: `${obtained}/${total} marks`,
      result: `${percentage.toFixed(2)}%`,
      details: { total, obtained, percentage }
    });
  };

  const reset = () => {
    setTotalMarks('');
    setObtainedMarks('');
    setResult(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Card className="bg-gradient-card border-border/20 shadow-aura">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">Marks Percentage Calculator</CardTitle>
              <CardDescription>Calculate your marks percentage with step-by-step breakdown</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total">Total Marks</Label>
              <Input
                id="total"
                type="number"
                placeholder="Enter total marks"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                className="bg-gradient-number border-border/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="obtained">Obtained Marks</Label>
              <Input
                id="obtained"
                type="number"
                placeholder="Enter obtained marks"
                value={obtainedMarks}
                onChange={(e) => setObtainedMarks(e.target.value)}
                className="bg-gradient-number border-border/20"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={calculate} className="flex-1 bg-gradient-primary">
              Calculate
            </Button>
            <Button onClick={reset} variant="outline">
              Reset
            </Button>
          </div>

          {result && (
            <Card className="bg-gradient-number border-border/20 animate-scale-in">
              <CardContent className="pt-6 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Your Percentage</p>
                  <p className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {result.percentage.toFixed(2)}%
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Step-by-Step Breakdown:</p>
                  {result.steps.map((step, index) => (
                    <p key={index} className="text-sm text-muted-foreground pl-4">
                      {step}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
