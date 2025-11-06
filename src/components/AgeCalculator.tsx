import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalculatorButton } from '@/components/ui/calculator-button';
import { useHistory } from '@/contexts/HistoryContext';
import { Globe, Calendar } from 'lucide-react';

interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
}

export function AgeCalculator() {
  const [birthDate, setBirthDate] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [result, setResult] = useState<AgeResult | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationMode, setAnimationMode] = useState<'age' | 'date' | null>(null);
  const { addToHistory } = useHistory();

  const calculateAge = () => {
    const start = birthDate ? new Date(birthDate) : fromDate ? new Date(fromDate) : null;
    const end = birthDate ? new Date() : toDate ? new Date(toDate) : null;

    if (!start || !end || start > end) return;

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    const totalDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // Set animation mode
    setAnimationMode(birthDate ? 'age' : 'date');
    setIsAnimating(true);

    // Delay result display for animation
    setTimeout(() => {
      setResult({ years, months, days, totalDays });
      setIsAnimating(false);
    }, birthDate ? 3500 : 4000);

    addToHistory({
      type: 'age',
      calculation: birthDate 
        ? `Age from ${start.toLocaleDateString()}`
        : `Difference: ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`,
      result: `${years}Y ${months}M ${days}D`,
    });
  };

  const reset = () => {
    setBirthDate('');
    setFromDate('');
    setToDate('');
    setResult(null);
    setIsAnimating(false);
    setAnimationMode(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-slide-up">
      <Card className="bg-gradient-card border-border/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Age & Date Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="birthdate">Your Birthdate (for age calculation)</Label>
              <Input
                id="birthdate"
                type="date"
                value={birthDate}
                onChange={(e) => {
                  setBirthDate(e.target.value);
                  setFromDate('');
                  setToDate('');
                }}
                className="bg-gradient-number border-border/20"
              />
            </div>

            <div className="text-center text-sm text-muted-foreground">OR</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromdate">From Date</Label>
                <Input
                  id="fromdate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setBirthDate('');
                  }}
                  className="bg-gradient-number border-border/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="todate">To Date</Label>
                <Input
                  id="todate"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-gradient-number border-border/20"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CalculatorButton variant="equals" onClick={calculateAge} className="w-full">
              Calculate
            </CalculatorButton>
            <CalculatorButton variant="clear" onClick={reset} className="w-full">
              Reset
            </CalculatorButton>
          </div>

          {/* Particle Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Animations */}
          <AnimatePresence>
            {isAnimating && animationMode === 'date' && (
              <EarthAnimation result={result} />
            )}
            {isAnimating && animationMode === 'age' && (
              <CalendarAnimation birthDate={birthDate} />
            )}
          </AnimatePresence>

          {/* Results */}
          {result && !isAnimating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6"
            >
              <Card className="bg-gradient-equals border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-white/80">Years</div>
                  <div className="text-3xl font-bold text-white">{result.years}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-operator border-0">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-white/80">Months</div>
                  <div className="text-3xl font-bold text-white">{result.months}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-primary border-border/10">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-muted-foreground">Days</div>
                  <div className="text-3xl font-bold text-foreground">{result.days}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-number border-border/10">
                <CardContent className="p-4 text-center">
                  <div className="text-sm text-muted-foreground">Total Days</div>
                  <div className="text-3xl font-bold text-foreground">{result.totalDays}</div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Earth Animation Component for Date Difference
function EarthAnimation({ result }: { result: AgeResult | null }) {
  const [yearMarkers, setYearMarkers] = useState<number[]>([]);

  useEffect(() => {
    if (result) {
      const startYear = new Date().getFullYear() - result.years;
      const markers = [];
      for (let i = 0; i <= result.years; i += Math.max(1, Math.floor(result.years / 5))) {
        markers.push(startYear + i);
      }
      setYearMarkers(markers);
    }
  }, [result]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full h-96 flex items-center justify-center my-8"
    >
      {/* Glassmorphic Container */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 backdrop-blur-xl rounded-3xl border border-primary/20" />

      {/* Rotating Earth */}
      <motion.div
        className="relative z-10"
        animate={{ rotate: 360 }}
        transition={{ duration: 4, ease: "easeInOut" }}
      >
        <Globe className="w-32 h-32 text-primary drop-shadow-[0_0_30px_rgba(168,85,247,0.6)]" />
      </motion.div>

      {/* Year Markers Orbiting */}
      {yearMarkers.map((year, index) => (
        <motion.div
          key={year}
          className="absolute text-xl font-bold text-primary"
          style={{
            left: '50%',
            top: '50%',
          }}
          animate={{
            x: [0, Math.cos((index / yearMarkers.length) * Math.PI * 2) * 150],
            y: [0, Math.sin((index / yearMarkers.length) * Math.PI * 2) * 150],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 4,
            delay: index * 0.3,
            ease: "easeInOut",
          }}
        >
          {year}
        </motion.div>
      ))}

      {/* Time Traveled Line */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <svg className="w-full h-full absolute" viewBox="0 0 400 400">
          <motion.path
            d="M 50 200 Q 200 50 350 200"
            stroke="url(#gradient)"
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Final Message */}
      <motion.div
        className="absolute bottom-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 3.5 }}
      >
        <p className="text-lg font-semibold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          You've journeyed through 🌎 {result?.years} years, {result?.months} months, {result?.days} days
        </p>
      </motion.div>
    </motion.div>
  );
}

// Calendar Animation Component for Age
function CalendarAnimation({ birthDate }: { birthDate: string }) {
  const [currentYear, setCurrentYear] = useState(new Date(birthDate).getFullYear());
  const targetYear = new Date().getFullYear();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentYear((prev) => {
        if (prev >= targetYear) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [targetYear]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full h-96 flex items-center justify-center my-8 overflow-hidden"
    >
      {/* Glassmorphic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-teal-500/10 backdrop-blur-xl rounded-3xl border border-cyan-500/20" />

      {/* Flipping Calendar Pages */}
      <div className="relative z-10 flex flex-col items-center">
        <Calendar className="w-24 h-24 text-cyan-400 mb-4 drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]" />
        
        <motion.div
          key={currentYear}
          initial={{ rotateX: 90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-6xl font-bold bg-gradient-to-r from-teal-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
          style={{ textShadow: '0 0 30px rgba(168,85,247,0.5)' }}
        >
          {currentYear}
        </motion.div>

        {/* Motion Blur Effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"
          animate={{ x: [-100, 100] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      </div>

      {/* Final Message */}
      {currentYear >= targetYear && (
        <motion.div
          className="absolute bottom-8 text-center px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-lg font-semibold bg-gradient-to-r from-teal-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            You're {new Date().getFullYear() - new Date(birthDate).getFullYear()} years old! 🎉
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
