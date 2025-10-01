import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useHistory } from '@/contexts/HistoryContext';
import { TrendingUp, Plus, X } from 'lucide-react';

interface Semester {
  id: string;
  name: string;
  gpa: string;
}

export function CGPACalculator() {
  const [semesters, setSemesters] = useState<Semester[]>([
    { id: '1', name: 'Semester 1', gpa: '' }
  ]);
  const [result, setResult] = useState<{ cgpa: number; breakdown: string[] } | null>(null);
  const { addToHistory } = useHistory();

  const addSemester = () => {
    const newNum = semesters.length + 1;
    setSemesters([...semesters, { 
      id: Date.now().toString(), 
      name: `Semester ${newNum}`, 
      gpa: '' 
    }]);
  };

  const removeSemester = (id: string) => {
    if (semesters.length > 1) {
      setSemesters(semesters.filter(s => s.id !== id));
    }
  };

  const updateSemester = (id: string, field: 'name' | 'gpa', value: string) => {
    setSemesters(semesters.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const calculate = () => {
    const validSemesters = semesters.filter(s => s.gpa && !isNaN(parseFloat(s.gpa)));
    
    if (validSemesters.length === 0) return;

    const total = validSemesters.reduce((sum, s) => sum + parseFloat(s.gpa), 0);
    const cgpa = total / validSemesters.length;
    const percentage = cgpa * 9.5;

    const breakdown = [
      'CGPA Calculation:',
      ...validSemesters.map(s => 
        `${s.name}: ${parseFloat(s.gpa).toFixed(2)} GPA`
      ),
      `Total GPA: ${total.toFixed(2)}`,
      `Number of Semesters: ${validSemesters.length}`,
      `CGPA = Sum of all GPAs ÷ Number of Semesters`,
      `CGPA = ${total.toFixed(2)} ÷ ${validSemesters.length} = ${cgpa.toFixed(2)}`,
      '',
      'Percentage Calculation:',
      `Percentage = CGPA × 9.5`,
      `Percentage = ${cgpa.toFixed(2)} × 9.5 = ${percentage.toFixed(2)}%`
    ];

    setResult({ cgpa, breakdown });

    addToHistory({
      type: 'cgpa',
      calculation: `${validSemesters.length} semesters`,
      result: cgpa.toFixed(2),
      details: { semesters: validSemesters, cgpa, percentage }
    });
  };

  const reset = () => {
    setSemesters([{ id: '1', name: 'Semester 1', gpa: '' }]);
    setResult(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Card className="bg-gradient-card border-border/20 shadow-aura">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">CGPA Calculator</CardTitle>
              <CardDescription>Calculate your Cumulative Grade Point Average</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {semesters.map((semester) => (
              <div key={semester.id} className="flex gap-3 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`semester-${semester.id}`}>Semester Name</Label>
                  <Input
                    id={`semester-${semester.id}`}
                    placeholder="e.g., Semester 1"
                    value={semester.name}
                    onChange={(e) => updateSemester(semester.id, 'name', e.target.value)}
                    className="bg-gradient-number border-border/20"
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label htmlFor={`gpa-${semester.id}`}>GPA</Label>
                  <Input
                    id={`gpa-${semester.id}`}
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={semester.gpa}
                    onChange={(e) => updateSemester(semester.id, 'gpa', e.target.value)}
                    className="bg-gradient-number border-border/20"
                  />
                </div>
                {semesters.length > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeSemester(semester.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button onClick={addSemester} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Semester
          </Button>

          <div className="flex gap-3">
            <Button onClick={calculate} className="flex-1 bg-gradient-primary">
              Calculate CGPA
            </Button>
            <Button onClick={reset} variant="outline">
              Reset
            </Button>
          </div>

          {result && (
            <Card className="bg-gradient-number border-border/20 animate-scale-in">
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Your CGPA</p>
                    <p className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      {result.cgpa.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Percentage</p>
                    <p className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      {(result.cgpa * 9.5).toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">Step-by-Step Breakdown:</p>
                  {result.breakdown.map((line, index) => (
                    <p key={index} className="text-sm text-muted-foreground pl-4">
                      {line}
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
