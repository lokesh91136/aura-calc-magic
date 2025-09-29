import React, { useState, useMemo } from 'react';
import { Search, BookOpen, Copy, Bookmark } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStudy } from '@/contexts/StudyContext';
import { useToast } from '@/hooks/use-toast';

export function FormulaLibrary() {
  const { formulas, saveItem } = useStudy();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFormulas = useMemo(() => {
    if (!searchQuery) return formulas;
    
    const query = searchQuery.toLowerCase();
    return formulas.filter(formula => 
      formula.name.toLowerCase().includes(query) ||
      formula.explanation.toLowerCase().includes(query) ||
      formula.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [formulas, searchQuery]);

  const categorizedFormulas = useMemo(() => {
    return {
      Math: filteredFormulas.filter(f => f.category === 'Math'),
      Finance: filteredFormulas.filter(f => f.category === 'Finance'),
      Physics: filteredFormulas.filter(f => f.category === 'Physics')
    };
  }, [filteredFormulas]);

  const copyFormula = (formula: string) => {
    navigator.clipboard.writeText(formula);
    toast({
      title: "Copied to clipboard",
      description: "Formula copied successfully"
    });
  };

  const saveFormula = (formula: any) => {
    saveItem({
      type: 'formula',
      title: formula.name,
      content: `${formula.formula}\n\n${formula.explanation}\n\nExample: ${formula.example}`
    });
    toast({
      title: "Saved to Memory",
      description: `${formula.name} saved successfully`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search formulas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">{filteredFormulas.length} formulas</span>
        </div>
      </div>

      <Tabs defaultValue="Math" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="Math">Math ({categorizedFormulas.Math.length})</TabsTrigger>
          <TabsTrigger value="Finance">Finance ({categorizedFormulas.Finance.length})</TabsTrigger>
          <TabsTrigger value="Physics">Physics ({categorizedFormulas.Physics.length})</TabsTrigger>
        </TabsList>

        {Object.entries(categorizedFormulas).map(([category, categoryFormulas]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            {categoryFormulas.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No formulas found in {category}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {categoryFormulas.map((formula) => (
                  <Card key={formula.id} className="hover:shadow-aura transition-all duration-200">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{formula.name}</CardTitle>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyFormula(formula.formula)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => saveFormula(formula)}
                          >
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>{formula.explanation}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-gradient-subtle p-4 rounded-lg border">
                          <div className="font-mono text-lg font-semibold text-center">
                            {formula.formula}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">Example:</p>
                          <p className="text-sm bg-muted p-3 rounded-lg font-mono">
                            {formula.example}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {formula.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}