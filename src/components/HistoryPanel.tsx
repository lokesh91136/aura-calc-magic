import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Calculator, TrendingUp, Home, Percent, Receipt, GraduationCap, CalendarCheck, Award, TrendingDown, CheckCircle } from 'lucide-react';
import { useHistory } from '@/contexts/HistoryContext';
import { formatDistanceToNow } from 'date-fns';

const typeIcons = {
  standard: Calculator,
  sip: TrendingUp,
  emi: Home,
  percentage: Percent,
  tally: Receipt,
  scientific: Calculator,
  'marks-percentage': GraduationCap,
  attendance: CalendarCheck,
  gpa: Award,
  cgpa: TrendingDown,
  grade: CheckCircle,
};

const typeLabels = {
  standard: 'Standard',
  sip: 'SIP',
  emi: 'EMI',
  percentage: 'Percentage',
  tally: 'Tally',
  scientific: 'Scientific',
  'marks-percentage': 'Marks %',
  attendance: 'Attendance',
  gpa: 'GPA',
  cgpa: 'CGPA',
  grade: 'Grade',
};

export function HistoryPanel() {
  const { history, clearHistory, isHistoryOpen, setHistoryOpen } = useHistory();

  return (
    <Sheet open={isHistoryOpen} onOpenChange={setHistoryOpen}>
      <SheetContent className="w-full sm:w-[400px] bg-gradient-card border-border/20">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle className="text-foreground">Calculation History</SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearHistory}
              disabled={history.length === 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-120px)] mt-4">
          <div className="space-y-3">
            {history.length === 0 ? (
              <Card className="bg-gradient-number border-border/20">
                <CardContent className="p-4 text-center text-muted-foreground">
                  No calculations yet
                </CardContent>
              </Card>
            ) : (
              history.map((item) => {
                const Icon = typeIcons[item.type] || Calculator;
                return (
                  <Card key={item.id} className="bg-gradient-number border-border/20 transition-all hover:shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                          <Icon className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-muted-foreground mb-1">
                            {typeLabels[item.type]} • {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                          </div>
                          <div className="text-sm font-medium text-foreground mb-1 break-words">
                            {item.calculation}
                          </div>
                          <div className="text-lg font-bold text-primary break-words">
                            {item.result}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}