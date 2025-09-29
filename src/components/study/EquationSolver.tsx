import React, { useState } from 'react';
import { Calculator, Lightbulb, Bookmark, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStudy } from '@/contexts/StudyContext';
import { useToast } from '@/hooks/use-toast';

export function EquationSolver() {
  const { saveItem } = useStudy();
  const { toast } = useToast();
  const [equation, setEquation] = useState('');
  const [solution, setSolution] = useState<any>(null);
  const [steps, setSteps] = useState<string[]>([]);

  const solveEquation = () => {
    if (!equation.trim()) return;

    try {
      // Simple equation solver for basic linear equations like 2x + 5 = 15
      const result = solveLinearEquation(equation);
      setSolution(result);
      setSteps(result.steps);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not solve this equation. Please check the format.",
        variant: "destructive"
      });
    }
  };

  const solveLinearEquation = (eq: string) => {
    // Remove spaces and convert to lowercase
    const cleanEq = eq.replace(/\s/g, '').toLowerCase();
    
    // Check if it's a simple linear equation like ax + b = c
    const match = cleanEq.match(/^(-?\d*\.?\d*)x\s*([+-]\s*\d+\.?\d*)\s*=\s*(-?\d+\.?\d*)$/);
    
    if (match) {
      const a = parseFloat(match[1] || '1');
      const b = parseFloat(match[2]);
      const c = parseFloat(match[3]);
      
      const x = (c - b) / a;
      
      return {
        variable: 'x',
        value: x,
        steps: [
          `Original equation: ${equation}`,
          `Subtract ${b} from both sides: ${a}x = ${c} - (${b})`,
          `Simplify: ${a}x = ${c - b}`,
          `Divide both sides by ${a}: x = ${(c - b)}/${a}`,
          `Solution: x = ${x}`
        ]
      };
    }
    
    // Simple quadratic check: x^2 = n
    const quadMatch = cleanEq.match(/^x\^?2\s*=\s*(\d+\.?\d*)$/);
    if (quadMatch) {
      const n = parseFloat(quadMatch[1]);
      const x = Math.sqrt(n);
      
      return {
        variable: 'x',
        value: `±${x}`,
        steps: [
          `Original equation: ${equation}`,
          `Take square root of both sides: x = ±√${n}`,
          `Solution: x = ±${x}`
        ]
      };
    }
    
    throw new Error('Unsupported equation format');
  };

  const saveSolution = () => {
    if (!solution) return;
    
    saveItem({
      type: 'solution',
      title: `Solution: ${equation}`,
      content: `Equation: ${equation}\nSolution: ${solution.variable} = ${solution.value}\n\nSteps:\n${steps.join('\n')}`
    });
    
    toast({
      title: "Saved to Memory",
      description: "Solution saved successfully"
    });
  };

  const graphHints = [
    "For linear equations (y = mx + b), the graph is a straight line",
    "The slope 'm' determines how steep the line is",
    "The y-intercept 'b' is where the line crosses the y-axis",
    "For quadratic equations (y = ax² + bx + c), the graph is a parabola",
    "If 'a' is positive, the parabola opens upward; if negative, it opens downward",
    "The vertex of a parabola is at x = -b/(2a)"
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Equation Solver</span>
          </CardTitle>
          <CardDescription>
            Enter linear equations like "2x + 5 = 15" or simple quadratic equations like "x^2 = 25"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter equation (e.g., 2x + 5 = 15)"
                value={equation}
                onChange={(e) => setEquation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && solveEquation()}
                className="flex-1"
              />
              <Button onClick={solveEquation} disabled={!equation.trim()}>
                Solve
              </Button>
            </div>

            {solution && (
              <div className="space-y-4">
                <Card className="bg-gradient-subtle border">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">Solution</h3>
                      <div className="text-2xl font-mono font-bold text-primary">
                        {solution.variable} = {solution.value}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Step-by-step Solution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {steps.map((step, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-sm flex-1 font-mono">{step}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Button onClick={saveSolution} variant="outline" className="w-full">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Save Solution to Memory
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="hints" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hints">Graph Helper</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="hints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Graphing Hints</span>
              </CardTitle>
              <CardDescription>Tips for plotting equations on a graph</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {graphHints.map((hint, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-1 flex-shrink-0" />
                    <p className="text-sm">{hint}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Linear Equations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm font-mono">
                  <p>2x + 5 = 15</p>
                  <p>3x - 7 = 14</p>
                  <p>-4x + 8 = 0</p>
                  <p>0.5x + 2.5 = 5</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Simple Quadratic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm font-mono">
                  <p>x^2 = 25</p>
                  <p>x^2 = 16</p>
                  <p>x^2 = 100</p>
                  <p>x^2 = 49</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}