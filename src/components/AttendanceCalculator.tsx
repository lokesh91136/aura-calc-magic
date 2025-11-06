import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useHistory } from '@/contexts/HistoryContext';
import { CalendarCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AttendanceCalculator() {
  const [totalClasses, setTotalClasses] = useState('');
  const [attendedClasses, setAttendedClasses] = useState('');
  const [percentage, setPercentage] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { addToHistory } = useHistory();

  useEffect(() => {
    if (isAnimating && percentage !== null) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const increment = percentage / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        setProgress(Math.min(currentStep * increment, percentage));

        if (currentStep >= steps) {
          clearInterval(interval);
          setIsAnimating(false);
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }
  }, [isAnimating, percentage]);

  const getColorByPercentage = (pct: number) => {
    if (pct < 60) return '#FF4D4D'; // Red
    if (pct <= 80) return '#FFC107'; // Yellow
    return '#4CAF50'; // Green
  };

  const getAvatarData = (pct: number) => {
    if (pct < 60) return {
      emoji: '😴',
      message: 'You missed too many classes!',
      textColor: 'text-red-400'
    };
    if (pct <= 80) return {
      emoji: '😐',
      message: 'Good, but you can do better!',
      textColor: 'text-yellow-400'
    };
    return {
      emoji: '😎',
      message: 'Excellent attendance! Keep it up!',
      textColor: 'text-green-400'
    };
  };

  const calculate = () => {
    const total = parseFloat(totalClasses);
    const attended = parseFloat(attendedClasses);

    if (isNaN(total) || isNaN(attended) || total <= 0 || attended < 0) {
      return;
    }

    const pct = (attended / total) * 100;
    setPercentage(pct);
    setProgress(0);
    setIsAnimating(true);

    addToHistory({
      type: 'attendance',
      calculation: `${attended}/${total} classes attended`,
      result: `${pct.toFixed(2)}%`,
      details: { totalClasses: total, attendedClasses: attended, percentage: pct }
    });
  };

  const reset = () => {
    setTotalClasses('');
    setAttendedClasses('');
    setPercentage(null);
    setProgress(0);
    setIsAnimating(false);
  };

  const avatarData = percentage !== null ? getAvatarData(percentage) : null;

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
              <CardDescription>Track your attendance with animated results</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="total-classes">Total Classes</Label>
              <Input
                id="total-classes"
                type="number"
                placeholder="Enter total classes"
                value={totalClasses}
                onChange={(e) => setTotalClasses(e.target.value)}
                className="bg-background/50 border-border/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attended-classes">Classes Attended</Label>
              <Input
                id="attended-classes"
                type="number"
                placeholder="Enter attended classes"
                value={attendedClasses}
                onChange={(e) => setAttendedClasses(e.target.value)}
                className="bg-background/50 border-border/20"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={calculate} className="flex-1 bg-gradient-primary hover:shadow-aura">
              Calculate Attendance
            </Button>
            <Button onClick={reset} variant="outline">
              Reset
            </Button>
          </div>

          <AnimatePresence>
            {percentage !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-gradient-card border-border/20 shadow-aura">
                  <CardContent className="pt-8 pb-8">
                    <div className="flex flex-col items-center space-y-6">
                      {/* Circular Progress Ring */}
                      <div className="relative w-64 h-64 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          {/* Background Circle */}
                          <circle
                            cx="128"
                            cy="128"
                            r="110"
                            stroke="hsl(var(--muted))"
                            strokeWidth="12"
                            fill="none"
                            opacity="0.2"
                          />
                          {/* Progress Circle */}
                          <motion.circle
                            cx="128"
                            cy="128"
                            r="110"
                            stroke={getColorByPercentage(percentage)}
                            strokeWidth="12"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 110}
                            strokeDashoffset={2 * Math.PI * 110 * (1 - progress / 100)}
                            initial={{ strokeDashoffset: 2 * Math.PI * 110 }}
                            animate={{
                              strokeDashoffset: 2 * Math.PI * 110 * (1 - progress / 100),
                              filter: !isAnimating && progress === percentage 
                                ? [
                                    'drop-shadow(0 0 8px currentColor)',
                                    'drop-shadow(0 0 16px currentColor)',
                                    'drop-shadow(0 0 8px currentColor)'
                                  ]
                                : 'drop-shadow(0 0 4px currentColor)'
                            }}
                            transition={{
                              strokeDashoffset: { duration: 2, ease: 'easeInOut' },
                              filter: { 
                                duration: 1.5, 
                                repeat: !isAnimating && progress === percentage ? Infinity : 0,
                                repeatType: 'reverse'
                              }
                            }}
                            style={{
                              filter: `drop-shadow(0 0 8px ${getColorByPercentage(percentage)})`
                            }}
                          />
                        </svg>
                        
                        {/* Percentage Text */}
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                        >
                          <p 
                            className="text-6xl font-bold"
                            style={{ color: getColorByPercentage(percentage) }}
                          >
                            {Math.round(progress)}%
                          </p>
                        </motion.div>
                      </div>

                      {/* Avatar and Message */}
                      {avatarData && !isAnimating && progress === percentage && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 2.2, duration: 0.5 }}
                          className="flex flex-col items-center space-y-3 text-center"
                        >
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 2.2, type: 'spring', stiffness: 200 }}
                            className="text-8xl"
                          >
                            {avatarData.emoji}
                          </motion.div>
                          <p className={`text-xl font-semibold ${avatarData.textColor}`}>
                            {avatarData.message}
                          </p>
                          <div className="text-sm text-muted-foreground pt-2">
                            <p>Attended: {attendedClasses} / {totalClasses} classes</p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
