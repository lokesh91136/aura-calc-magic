import React, { useState } from 'react';
import { BookOpen, Brain, Calculator, Lightbulb, MessageCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormulaLibrary } from '@/components/study/FormulaLibrary';
import { KnowledgeCapsules } from '@/components/study/KnowledgeCapsules';
import { EquationSolver } from '@/components/study/EquationSolver';
import { StudyMemory } from '@/components/study/StudyMemory';
import { CalcBot } from '@/components/CalcBot';
import { useStudy } from '@/contexts/StudyContext';

export default function StudyModePage() {
  const { progress, savedItems } = useStudy();
  const [isBotOpen, setIsBotOpen] = useState(false);

  const accuracy = progress.quizzesCompleted > 0 
    ? Math.round((progress.correctAnswers / progress.quizzesCompleted) * 100)
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Study Mode
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your comprehensive learning hub for mathematics, finance, and physics concepts
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{progress.quizzesCompleted}</div>
            <div className="text-sm text-muted-foreground">Questions Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
            <div className="text-sm text-muted-foreground">Accuracy Rate</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{progress.streak}</div>
            <div className="text-sm text-muted-foreground">Current Streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{savedItems.length}</div>
            <div className="text-sm text-muted-foreground">Saved Items</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="formulas" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="formulas" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Formulas</span>
          </TabsTrigger>
          <TabsTrigger value="capsules" className="flex items-center space-x-2">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">Capsules</span>
          </TabsTrigger>
          <TabsTrigger value="solver" className="flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Solver</span>
          </TabsTrigger>
          <TabsTrigger value="memory" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Memory</span>
          </TabsTrigger>
          <TabsTrigger value="tutor" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Tutor</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="formulas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Formula Library</span>
              </CardTitle>
              <CardDescription>
                Browse categorized formulas with explanations and examples
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormulaLibrary />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capsules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5" />
                <span>Knowledge Capsules</span>
              </CardTitle>
              <CardDescription>
                Interactive mini-lessons with practice problems and instant feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KnowledgeCapsules />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="solver" className="space-y-6">
          <EquationSolver />
        </TabsContent>

        <TabsContent value="memory" className="space-y-6">
          <StudyMemory />
        </TabsContent>

        <TabsContent value="tutor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>CalcBot Tutor</span>
                <Badge variant="secondary">AI Assistant</Badge>
              </CardTitle>
              <CardDescription>
                Your intelligent study companion for step-by-step explanations and interactive learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <button
                  onClick={() => setIsBotOpen(true)}
                  className="bg-gradient-primary text-white px-8 py-4 rounded-lg font-semibold shadow-aura hover:scale-105 transition-all duration-200"
                >
                  <MessageCircle className="h-5 w-5 mr-2 inline" />
                  Open CalcBot Tutor
                </button>
                <p className="text-sm text-muted-foreground mt-4">
                  Get personalized help with math, finance, and physics concepts
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CalcBot Integration */}
      <CalcBot isOpen={isBotOpen} onOpenChange={setIsBotOpen} />
    </div>
  );
}