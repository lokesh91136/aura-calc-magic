import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useHistory } from '@/contexts/HistoryContext';
import { CalendarCheck, Plus, X } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  totalClasses: string;
  attendedClasses: string;
  percentage?: number;
}

export function AttendanceCalculator() {
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Subject 1', totalClasses: '', attendedClasses: '' }
  ]);
  const [overallResult, setOverallResult] = useState<{
    average: number;
    totalClasses: number;
    totalAttended: number;
  } | null>(null);
  const { addToHistory } = useHistory();

  const addSubject = () => {
    const newId = (subjects.length + 1).toString();
    setSubjects([...subjects, {
      id: newId,
      name: `Subject ${newId}`,
      totalClasses: '',
      attendedClasses: ''
    }]);
  };

  const removeSubject = (id: string) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  const updateSubject = (id: string, field: keyof Subject, value: string) => {
    setSubjects(subjects.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const calculate = () => {
    let totalClassesSum = 0;
    let totalAttendedSum = 0;
    let validSubjects = 0;

    const updatedSubjects = subjects.map(subject => {
      const total = parseFloat(subject.totalClasses);
      const attended = parseFloat(subject.attendedClasses);

      if (!isNaN(total) && !isNaN(attended) && total > 0 && attended >= 0) {
        const percentage = (attended / total) * 100;
        totalClassesSum += total;
        totalAttendedSum += attended;
        validSubjects++;
        return { ...subject, percentage };
      }
      return subject;
    });

    if (validSubjects === 0) {
      return;
    }

    setSubjects(updatedSubjects);

    const overallPercentage = (totalAttendedSum / totalClassesSum) * 100;
    setOverallResult({
      average: overallPercentage,
      totalClasses: totalClassesSum,
      totalAttended: totalAttendedSum
    });

    addToHistory({
      type: 'attendance',
      calculation: `${validSubjects} subjects: ${totalAttendedSum}/${totalClassesSum} classes`,
      result: `${overallPercentage.toFixed(2)}%`,
      details: { subjects: updatedSubjects, overallPercentage }
    });
  };

  const reset = () => {
    setSubjects([{ id: '1', name: 'Subject 1', totalClasses: '', attendedClasses: '' }]);
    setOverallResult(null);
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
          <div className="space-y-4">
            {subjects.map((subject, index) => (
              <Card key={subject.id} className="bg-gradient-number border-border/20 animate-scale-in">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <Input
                      type="text"
                      value={subject.name}
                      onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                      className="font-semibold text-lg bg-background/50 border-border/20 flex-1 mr-2"
                    />
                    {subjects.length > 1 && (
                      <Button
                        onClick={() => removeSubject(subject.id)}
                        variant="outline"
                        size="icon"
                        className="h-10 w-10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`total-${subject.id}`}>Total Classes</Label>
                      <Input
                        id={`total-${subject.id}`}
                        type="number"
                        placeholder="Enter total"
                        value={subject.totalClasses}
                        onChange={(e) => updateSubject(subject.id, 'totalClasses', e.target.value)}
                        className="bg-background/50 border-border/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`attended-${subject.id}`}>Attended</Label>
                      <Input
                        id={`attended-${subject.id}`}
                        type="number"
                        placeholder="Enter attended"
                        value={subject.attendedClasses}
                        onChange={(e) => updateSubject(subject.id, 'attendedClasses', e.target.value)}
                        className="bg-background/50 border-border/20"
                      />
                    </div>
                  </div>

                  {subject.percentage !== undefined && (
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">
                          {subject.name} — {subject.percentage.toFixed(1)}%
                        </p>
                      </div>
                      <div className="relative">
                        <Progress value={subject.percentage} className="h-3 bg-muted/50" />
                        <div 
                          className="absolute top-0 left-0 h-3 rounded-full bg-gradient-primary transition-all duration-500"
                          style={{ width: `${Math.min(subject.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            onClick={addSubject}
            variant="outline"
            className="w-full border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>

          <div className="flex gap-3">
            <Button onClick={calculate} className="flex-1 bg-gradient-primary">
              Calculate All
            </Button>
            <Button onClick={reset} variant="outline">
              Reset
            </Button>
          </div>

          {overallResult && (
            <Card className="bg-gradient-card border-border/20 animate-scale-in shadow-aura">
              <CardContent className="pt-6 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Overall Average Attendance</p>
                  <p className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {overallResult.average.toFixed(2)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {overallResult.totalAttended} / {overallResult.totalClasses} total classes
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-border/20">
                  <p className="text-sm font-semibold text-foreground mb-3">Subject Breakdown:</p>
                  {subjects.filter(s => s.percentage !== undefined).map(subject => (
                    <div key={subject.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{subject.name}</span>
                        <span className="text-sm font-semibold bg-gradient-primary bg-clip-text text-transparent">
                          {subject.percentage?.toFixed(1)}%
                        </span>
                      </div>
                      <div className="relative">
                        <Progress value={subject.percentage} className="h-2 bg-muted/50" />
                        <div 
                          className="absolute top-0 left-0 h-2 rounded-full bg-gradient-primary transition-all duration-500"
                          style={{ width: `${Math.min(subject.percentage, 100)}%` }}
                        />
                      </div>
                    </div>
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
