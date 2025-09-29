import React, { useState } from 'react';
import { Brain, Trash2, Download, Copy, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStudy } from '@/contexts/StudyContext';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export function StudyMemory() {
  const { savedItems, removeItem } = useStudy();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = savedItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categorizedItems = {
    formula: filteredItems.filter(item => item.type === 'formula'),
    equation: filteredItems.filter(item => item.type === 'equation'),
    solution: filteredItems.filter(item => item.type === 'solution')
  };

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied to clipboard",
      description: "Content copied successfully"
    });
  };

  const exportMemory = () => {
    const exportData = savedItems.map(item => ({
      ...item,
      timestamp: item.timestamp.toISOString()
    }));
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `aura-calc-study-memory-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "Memory Exported",
      description: "Study memory exported successfully"
    });
  };

  const deleteItem = (id: string) => {
    removeItem(id);
    toast({
      title: "Item Deleted",
      description: "Item removed from memory"
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'formula': return 'Formula';
      case 'equation': return 'Equation';
      case 'solution': return 'Solution';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'formula': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'equation': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'solution': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Study Memory</h2>
          <Badge variant="secondary">{savedItems.length} items</Badge>
        </div>
        
        <Button onClick={exportMemory} variant="outline" disabled={savedItems.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export Memory
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search saved items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {savedItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No saved items yet</h3>
            <p className="text-muted-foreground">
              Save formulas, equations, and solutions from other study sections to build your personal knowledge base.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({filteredItems.length})</TabsTrigger>
            <TabsTrigger value="formula">Formulas ({categorizedItems.formula.length})</TabsTrigger>
            <TabsTrigger value="equation">Equations ({categorizedItems.equation.length})</TabsTrigger>
            <TabsTrigger value="solution">Solutions ({categorizedItems.solution.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className="hover:shadow-aura transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        <Badge className={getTypeColor(item.type)}>
                          {getTypeLabel(item.type)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyContent(item.content)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Saved {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap font-mono">
                        {item.content}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {Object.entries(categorizedItems).map(([type, items]) => (
            <TabsContent key={type} value={type} className="space-y-4">
              {items.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No {getTypeLabel(type).toLowerCase()}s saved</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <Card key={item.id} className="hover:shadow-aura transition-all duration-200">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{item.title}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyContent(item.content)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <CardDescription>
                          Saved {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted p-4 rounded-lg">
                          <pre className="text-sm whitespace-pre-wrap font-mono">
                            {item.content}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}