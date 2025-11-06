import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useHistory } from '@/contexts/HistoryContext';
import { CalendarCheck, Plus, Trash2, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Subject {
  id: string;
  name: string;
  totalClasses: string;
  attendedClasses: string;
  percentage: number | null;
}

export function AttendanceCalculator() {
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Subject 1', totalClasses: '', attendedClasses: '', percentage: null }
  ]);
  const [overallPercentage, setOverallPercentage] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { addToHistory } = useHistory();

  // Sound effect functions using Web Audio API
  const playSound = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!soundEnabled) return;
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const playSuccessChime = () => {
    playSound(523.25, 0.15); // C5
    setTimeout(() => playSound(659.25, 0.15), 100); // E5
    setTimeout(() => playSound(783.99, 0.2), 200); // G5
  };

  const playClickSound = () => {
    playSound(800, 0.05, 'square');
  };

  const playWarningTone = () => {
    playSound(440, 0.15); // A4
    setTimeout(() => playSound(415.3, 0.15), 150); // G#4
    setTimeout(() => playSound(392, 0.2), 300); // G4
  };

  const playResetTone = () => {
    playSound(600, 0.1);
    setTimeout(() => playSound(400, 0.15), 100);
  };

  useEffect(() => {
    if (isAnimating && overallPercentage !== null) {
      const duration = 2000;
      const steps = 60;
      const increment = overallPercentage / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        setProgress(Math.min(currentStep * increment, overallPercentage));

        if (currentStep >= steps) {
          clearInterval(interval);
          setIsAnimating(false);
          if (overallPercentage < 75) {
            playWarningTone();
          } else {
            playSuccessChime();
          }
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }
  }, [isAnimating, overallPercentage]);

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

  const addSubject = () => {
    playClickSound();
    const newId = Date.now().toString();
    setSubjects([
      ...subjects,
      { id: newId, name: `Subject ${subjects.length + 1}`, totalClasses: '', attendedClasses: '', percentage: null }
    ]);
  };

  const removeSubject = (id: string) => {
    if (subjects.length > 1) {
      playClickSound();
      setSubjects(subjects.filter(subject => subject.id !== id));
    }
  };

  const updateSubject = (id: string, field: keyof Subject, value: string) => {
    setSubjects(subjects.map(subject => 
      subject.id === id ? { ...subject, [field]: value } : subject
    ));
  };

  const calculateAttendance = () => {
    let validSubjects = 0;
    let totalPercentage = 0;

    const updatedSubjects = subjects.map(subject => {
      const total = parseFloat(subject.totalClasses);
      const attended = parseFloat(subject.attendedClasses);

      if (!isNaN(total) && !isNaN(attended) && total > 0 && attended >= 0) {
        const pct = (attended / total) * 100;
        validSubjects++;
        totalPercentage += pct;
        return { ...subject, percentage: pct };
      }
      return subject;
    });

    if (validSubjects === 0) return;

    setSubjects(updatedSubjects);
    const overall = totalPercentage / validSubjects;
    setOverallPercentage(overall);
    setProgress(0);
    setIsAnimating(true);

    addToHistory({
      type: 'attendance',
      calculation: `${validSubjects} subject(s) calculated`,
      result: `Overall: ${overall.toFixed(2)}%`,
      details: { subjects: updatedSubjects, overallPercentage: overall }
    });
  };

  const resetAll = () => {
    playResetTone();
    setSubjects([
      { id: '1', name: 'Subject 1', totalClasses: '', attendedClasses: '', percentage: null }
    ]);
    setOverallPercentage(null);
    setProgress(0);
    setIsAnimating(false);
  };

  const avatarData = overallPercentage !== null ? getAvatarData(overallPercentage) : null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Card className="bg-gradient-card border-border/20 shadow-aura">
        <CardHeader>
          <div className="flex items-center gap-3 justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
                <CalendarCheck className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">Attendance Percentage Calculator</CardTitle>
                <CardDescription>Track attendance for multiple subjects</CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="gap-2"
            >
              <Volume2 className={`h-4 w-4 ${!soundEnabled ? 'opacity-50' : ''}`} />
              {soundEnabled ? 'On' : 'Off'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Subject Rows */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Subjects</Label>
              <Button
                onClick={addSubject}
                size="sm"
                className="gap-2 bg-gradient-primary hover:shadow-aura"
              >
                <Plus className="h-4 w-4" />
                Add Subject
              </Button>
            </div>

            {subjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-background/30 border border-border/20 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center gap-2 justify-between">
                  <Input
                    value={subject.name}
                    onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                    className="font-semibold bg-background/50 border-border/20"
                    placeholder="Subject name"
                  />
                  {subjects.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeSubject(subject.id)}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor={`total-${subject.id}`} className="text-xs">Total Classes</Label>
                    <Input
                      id={`total-${subject.id}`}
                      type="number"
                      placeholder="Total"
                      value={subject.totalClasses}
                      onChange={(e) => updateSubject(subject.id, 'totalClasses', e.target.value)}
                      className="bg-background/50 border-border/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`attended-${subject.id}`} className="text-xs">Attended</Label>
                    <Input
                      id={`attended-${subject.id}`}
                      type="number"
                      placeholder="Attended"
                      value={subject.attendedClasses}
                      onChange={(e) => updateSubject(subject.id, 'attendedClasses', e.target.value)}
                      className="bg-background/50 border-border/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Percentage</Label>
                    <div className="h-10 flex items-center justify-center bg-background/50 border border-border/20 rounded-md">
                      {subject.percentage !== null ? (
                        <span 
                          className="font-bold text-lg"
                          style={{ color: getColorByPercentage(subject.percentage) }}
                        >
                          {subject.percentage.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={calculateAttendance} 
              className="flex-1 bg-gradient-primary hover:shadow-aura"
            >
              Calculate Attendance
            </Button>
            <Button onClick={resetAll} variant="outline">
              Reset All
            </Button>
          </div>

          <AnimatePresence>
            {overallPercentage !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-gradient-card border-border/20 shadow-aura">
                  <CardContent className="pt-8 pb-8">
                    <div className="flex flex-col items-center space-y-6">
                      <h3 className="text-xl font-semibold text-center">Overall Attendance</h3>
                      
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
                            stroke={getColorByPercentage(overallPercentage)}
                            strokeWidth="12"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 110}
                            strokeDashoffset={2 * Math.PI * 110 * (1 - progress / 100)}
                            initial={{ strokeDashoffset: 2 * Math.PI * 110 }}
                            animate={{
                              strokeDashoffset: 2 * Math.PI * 110 * (1 - progress / 100),
                              filter: !isAnimating && progress === overallPercentage 
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
                                repeat: !isAnimating && progress === overallPercentage ? Infinity : 0,
                                repeatType: 'reverse'
                              }
                            }}
                            style={{
                              filter: `drop-shadow(0 0 8px ${getColorByPercentage(overallPercentage)})`
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
                            style={{ color: getColorByPercentage(overallPercentage) }}
                          >
                            {Math.round(progress)}%
                          </p>
                        </motion.div>
                      </div>

                      {/* Avatar and Message */}
                      {avatarData && !isAnimating && progress === overallPercentage && (
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
                            <p>Average across {subjects.filter(s => s.percentage !== null).length} subject(s)</p>
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
