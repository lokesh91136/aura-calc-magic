import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useHistory } from '@/contexts/HistoryContext';
import { CalendarCheck } from 'lucide-react';

export function AttendanceCalculator() {
  const [totalClasses, setTotalClasses] = useState('');
  const [attendedClasses, setAttendedClasses] = useState('');
  const [targetPercentage, setTargetPercentage] = useState('75');
  const [result, setResult] = useState<{
    percentage: number;
    required: number;
    message: string;
  } | null>(null);
  const { addToHistory } = useHistory();

  const calculate = () => {
    const total = parseFloat(totalClasses);
    const attended = parseFloat(attendedClasses);
    const target = parseFloat(targetPercentage);

    if (isNaN(total) || isNaN(attended) || isNaN(target) || total <= 0 || attended < 0) {
      return;
    }

    const currentPercentage = (attended / total) * 100;
    
    // Calculate classes needed to reach target
    let classesRequired = 0;
    let message = '';

    if (currentPercentage >= target) {
      message = `Great! You've already achieved ${target}% attendance.`;
    } else {
      // Formula: (attended + x) / (total + x) = target/100
      // Solving: attended + x = (target/100) * (total + x)
      // x = (target * total - 100 * attended) / (100 - target)
      classesRequired = Math.ceil((target * total - 100 * attended) / (100 - target));
      message = `You need to attend ${classesRequired} more classes consecutively to reach ${target}% attendance.`;
    }

    setResult({
      percentage: currentPercentage,
      required: classesRequired,
      message
    });

    addToHistory({
      type: 'attendance',
      calculation: `${attended}/${total} classes`,
      result: `${currentPercentage.toFixed(2)}%`,
      details: { total, attended, currentPercentage, target, classesRequired }
    });
  };

  const reset = () => {
    setTotalClasses('');
    setAttendedClasses('');
    setTargetPercentage('75');
    setResult(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Card className="bg-gradient-card border-border/20 shadow-aura">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
              <CalendarCheck className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">Attendance Percentage Calculator</CardTitle>
              <CardDescription>Track your attendance and see how many classes you need</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total-classes">Total Classes</Label>
              <Input
                id="total-classes"
                type="number"
                placeholder="Enter total classes"
                value={totalClasses}
                onChange={(e) => setTotalClasses(e.target.value)}
                className="bg-gradient-number border-border/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attended">Attended Classes</Label>
              <Input
                id="attended"
                type="number"
                placeholder="Classes attended"
                value={attendedClasses}
                onChange={(e) => setAttendedClasses(e.target.value)}
                className="bg-gradient-number border-border/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target">Target %</Label>
              <Input
                id="target"
                type="number"
                placeholder="Target percentage"
                value={targetPercentage}
                onChange={(e) => setTargetPercentage(e.target.value)}
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
                  <p className="text-sm text-muted-foreground mb-2">Current Attendance</p>
                  <p className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {result.percentage.toFixed(2)}%
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border/20">
                  <p className="text-sm text-foreground">{result.message}</p>
                </div>

                {result.required > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">Calculation:</p>
                    <p className="text-sm text-muted-foreground pl-4">
                      Current: {attendedClasses}/{totalClasses} = {result.percentage.toFixed(2)}%
                    </p>
                    <p className="text-sm text-muted-foreground pl-4">
                      After attending {result.required} more classes consecutively: 
                      {' '}{parseFloat(attendedClasses) + result.required}/{parseFloat(totalClasses) + result.required}
                      {' '}= {targetPercentage}%
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
