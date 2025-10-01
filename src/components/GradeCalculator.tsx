import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useHistory } from '@/contexts/HistoryContext';
import { CheckCircle } from 'lucide-react';

const defaultGradeScale = [
  { grade: 'A+', min: 90, max: 100 },
  { grade: 'A', min: 80, max: 89 },
  { grade: 'B+', min: 70, max: 79 },
  { grade: 'B', min: 60, max: 69 },
  { grade: 'C', min: 50, max: 59 },
  { grade: 'D', min: 40, max: 49 },
  { grade: 'F', min: 0, max: 39 },
];

export function GradeCalculator() {
  const [percentage, setPercentage] = useState('');
  const [result, setResult] = useState<{ grade: string; description: string } | null>(null);
  const { addToHistory } = useHistory();

  const getGrade = (percent: number) => {
    for (const scale of defaultGradeScale) {
      if (percent >= scale.min && percent <= scale.max) {
        return scale.grade;
      }
    }
    return 'Invalid';
  };

  const getGradeDescription = (grade: string) => {
    const descriptions: Record<string, string> = {
      'A+': 'Outstanding! Exceptional performance.',
      'A': 'Excellent! Very good work.',
      'B+': 'Very Good! Above average performance.',
      'B': 'Good! Satisfactory performance.',
      'C': 'Average. You can do better.',
      'D': 'Below Average. Needs improvement.',
      'F': 'Fail. Significant improvement required.'
    };
    return descriptions[grade] || 'Grade calculated based on percentage';
  };

  const calculate = () => {
    const percent = parseFloat(percentage);
    
    if (isNaN(percent) || percent < 0 || percent > 100) {
      return;
    }

    const grade = getGrade(percent);
    const description = getGradeDescription(grade);

    setResult({ grade, description });

    addToHistory({
      type: 'grade',
      calculation: `${percent}%`,
      result: grade,
      details: { percentage: percent, grade, description }
    });
  };

  const reset = () => {
    setPercentage('');
    setResult(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Card className="bg-gradient-card border-border/20 shadow-aura">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">Grade Calculator</CardTitle>
              <CardDescription>Convert percentage to letter grade</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="percentage">Percentage</Label>
            <Input
              id="percentage"
              type="number"
              step="0.1"
              placeholder="Enter percentage (0-100)"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              className="bg-gradient-number border-border/20"
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={calculate} className="flex-1 bg-gradient-primary">
              Calculate Grade
            </Button>
            <Button onClick={reset} variant="outline">
              Reset
            </Button>
          </div>

          {result && (
            <Card className="bg-gradient-number border-border/20 animate-scale-in">
              <CardContent className="pt-6 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Your Grade</p>
                  <p className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {result.grade}
                  </p>
                  <p className="text-sm text-muted-foreground mt-3">
                    {result.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-muted/50 border-border/20">
            <CardContent className="pt-6">
              <p className="text-sm font-semibold text-foreground mb-3">Grading Scale:</p>
              <div className="space-y-2">
                {defaultGradeScale.map((scale) => (
                  <div key={scale.grade} className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">{scale.grade}</span>
                    <span className="text-muted-foreground">
                      {scale.min}% - {scale.max}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
