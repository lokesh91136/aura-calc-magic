import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useHistory } from '@/contexts/HistoryContext';
import { Award, Plus, X } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  gradePoint: string;
}

export function GPACalculator() {
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: '', gradePoint: '' }
  ]);
  const [result, setResult] = useState<{ gpa: number; breakdown: string[] } | null>(null);
  const { addToHistory } = useHistory();

  const addSubject = () => {
    setSubjects([...subjects, { id: Date.now().toString(), name: '', gradePoint: '' }]);
  };

  const removeSubject = (id: string) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  const updateSubject = (id: string, field: 'name' | 'gradePoint', value: string) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const calculate = () => {
    const validSubjects = subjects.filter(s => s.gradePoint && !isNaN(parseFloat(s.gradePoint)));
    
    if (validSubjects.length === 0) return;

    const total = validSubjects.reduce((sum, s) => sum + parseFloat(s.gradePoint), 0);
    const gpa = total / validSubjects.length;

    const breakdown = [
      'GPA Calculation:',
      ...validSubjects.map((s, i) => 
        `Subject ${i + 1}${s.name ? ` (${s.name})` : ''}: ${s.gradePoint} points`
      ),
      `Total Grade Points: ${total.toFixed(2)}`,
      `Number of Subjects: ${validSubjects.length}`,
      `GPA = Total Points ÷ Number of Subjects`,
      `GPA = ${total.toFixed(2)} ÷ ${validSubjects.length} = ${gpa.toFixed(2)}`
    ];

    setResult({ gpa, breakdown });

    addToHistory({
      type: 'gpa',
      calculation: `${validSubjects.length} subjects`,
      result: gpa.toFixed(2),
      details: { subjects: validSubjects, gpa }
    });
  };

  const reset = () => {
    setSubjects([{ id: '1', name: '', gradePoint: '' }]);
    setResult(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Card className="bg-gradient-card border-border/20 shadow-aura">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
              <Award className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">GPA Calculator</CardTitle>
              <CardDescription>Calculate your Grade Point Average across subjects</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {subjects.map((subject, index) => (
              <div key={subject.id} className="flex gap-3 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`subject-${subject.id}`}>
                    Subject {index + 1} (optional)
                  </Label>
                  <Input
                    id={`subject-${subject.id}`}
                    placeholder="Subject name"
                    value={subject.name}
                    onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                    className="bg-gradient-number border-border/20"
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label htmlFor={`grade-${subject.id}`}>Grade Point</Label>
                  <Input
                    id={`grade-${subject.id}`}
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={subject.gradePoint}
                    onChange={(e) => updateSubject(subject.id, 'gradePoint', e.target.value)}
                    className="bg-gradient-number border-border/20"
                  />
                </div>
                {subjects.length > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeSubject(subject.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button onClick={addSubject} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>

          <div className="flex gap-3">
            <Button onClick={calculate} className="flex-1 bg-gradient-primary">
              Calculate GPA
            </Button>
            <Button onClick={reset} variant="outline">
              Reset
            </Button>
          </div>

          {result && (
            <Card className="bg-gradient-number border-border/20 animate-scale-in">
              <CardContent className="pt-6 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Your GPA</p>
                  <p className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {result.gpa.toFixed(2)}
                  </p>
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
