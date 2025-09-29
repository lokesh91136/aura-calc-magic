import React, { useState } from 'react';
import { Book, PlayCircle, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useStudy } from '@/contexts/StudyContext';
import { Progress } from '@/components/ui/progress';

export function KnowledgeCapsules() {
  const { knowledgeCapsules, progress, updateProgress } = useStudy();
  const [selectedCapsule, setSelectedCapsule] = useState(null);
  const [currentProblem, setCurrentProblem] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [problemResults, setProblemResults] = useState<boolean[]>([]);

  const categorizedCapsules = {
    Math: knowledgeCapsules.filter(c => c.category === 'Math'),
    Finance: knowledgeCapsules.filter(c => c.category === 'Finance'),
    Physics: knowledgeCapsules.filter(c => c.category === 'Physics')
  };

  const startPractice = (capsule: any) => {
    setSelectedCapsule(capsule);
    setCurrentProblem(0);
    setSelectedAnswer('');
    setShowResult(false);
    setProblemResults([]);
  };

  const submitAnswer = () => {
    if (!selectedCapsule || !selectedAnswer) return;

    const currentQ = selectedCapsule.practiceProblems[currentProblem];
    const isCorrect = selectedAnswer === currentQ.answer;
    
    setShowResult(true);
    setProblemResults(prev => [...prev, isCorrect]);
    updateProgress(isCorrect, selectedCapsule.category);

    setTimeout(() => {
      if (currentProblem < selectedCapsule.practiceProblems.length - 1) {
        setCurrentProblem(prev => prev + 1);
        setSelectedAnswer('');
        setShowResult(false);
      } else {
        // End of practice
        setTimeout(() => {
          setSelectedCapsule(null);
          setCurrentProblem(0);
          setSelectedAnswer('');
          setShowResult(false);
          setProblemResults([]);
        }, 2000);
      }
    }, 2000);
  };

  const accuracy = progress.quizzesCompleted > 0 
    ? Math.round((progress.correctAnswers / progress.quizzesCompleted) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Book className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Knowledge Capsules</h2>
        </div>
        
        <Card className="p-4">
          <div className="flex items-center space-x-4 text-sm">
            <div>
              <span className="font-medium">{progress.quizzesCompleted}</span>
              <span className="text-muted-foreground ml-1">Questions</span>
            </div>
            <div>
              <span className="font-medium">{accuracy}%</span>
              <span className="text-muted-foreground ml-1">Accuracy</span>
            </div>
            <div>
              <span className="font-medium">{progress.streak}</span>
              <span className="text-muted-foreground ml-1">Streak</span>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="Math" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="Math">Math ({categorizedCapsules.Math.length})</TabsTrigger>
          <TabsTrigger value="Finance">Finance ({categorizedCapsules.Finance.length})</TabsTrigger>
          <TabsTrigger value="Physics">Physics ({categorizedCapsules.Physics.length})</TabsTrigger>
        </TabsList>

        {Object.entries(categorizedCapsules).map(([category, capsules]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {capsules.map((capsule) => (
                <Card key={capsule.id} className="hover:shadow-aura transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{capsule.title}</CardTitle>
                      <Badge variant="secondary">{capsule.category}</Badge>
                    </div>
                    <CardDescription>{capsule.definition}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {capsule.formula && (
                        <div className="bg-gradient-subtle p-3 rounded-lg border">
                          <div className="font-mono text-center font-semibold">
                            {capsule.formula}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Example:</p>
                        <p className="text-sm bg-muted p-3 rounded-lg">
                          {capsule.example}
                        </p>
                      </div>

                      <Button 
                        onClick={() => startPractice(capsule)}
                        className="w-full"
                        variant="outline"
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Practice ({capsule.practiceProblems.length} questions)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Practice Dialog */}
      <Dialog open={!!selectedCapsule} onOpenChange={() => setSelectedCapsule(null)}>
        <DialogContent className="max-w-2xl">
          {selectedCapsule && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedCapsule.title} - Practice</DialogTitle>
                <div className="flex items-center space-x-4">
                  <Progress 
                    value={(currentProblem / selectedCapsule.practiceProblems.length) * 100} 
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">
                    {currentProblem + 1} / {selectedCapsule.practiceProblems.length}
                  </span>
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                {selectedCapsule.practiceProblems[currentProblem] && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">
                      {selectedCapsule.practiceProblems[currentProblem].question}
                    </h3>
                    
                    {selectedCapsule.practiceProblems[currentProblem].options ? (
                      <div className="space-y-2">
                        {selectedCapsule.practiceProblems[currentProblem].options.map((option, index) => (
                          <Button
                            key={index}
                            variant={selectedAnswer === option ? "default" : "outline"}
                            className="w-full justify-start"
                            onClick={() => setSelectedAnswer(option)}
                            disabled={showResult}
                          >
                            {String.fromCharCode(65 + index)}. {option}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <input
                          type="text"
                          className="w-full p-3 border rounded-lg"
                          placeholder="Enter your answer..."
                          value={selectedAnswer}
                          onChange={(e) => setSelectedAnswer(e.target.value)}
                          disabled={showResult}
                        />
                      </div>
                    )}

                    {showResult && (
                      <div className={`p-4 rounded-lg border ${
                        selectedAnswer === selectedCapsule.practiceProblems[currentProblem].answer
                          ? 'bg-green-50 border-green-200 dark:bg-green-950'
                          : 'bg-red-50 border-red-200 dark:bg-red-950'
                      }`}>
                        <div className="flex items-center space-x-2 mb-2">
                          {selectedAnswer === selectedCapsule.practiceProblems[currentProblem].answer ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                          <span className="font-medium">
                            {selectedAnswer === selectedCapsule.practiceProblems[currentProblem].answer 
                              ? 'Correct!' 
                              : 'Incorrect'}
                          </span>
                        </div>
                        <p className="text-sm">
                          {selectedCapsule.practiceProblems[currentProblem].explanation}
                        </p>
                      </div>
                    )}

                    {!showResult && (
                      <Button 
                        onClick={submitAnswer}
                        disabled={!selectedAnswer}
                        className="w-full"
                      >
                        Submit Answer
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}