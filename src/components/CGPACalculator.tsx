import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useHistory } from '@/contexts/HistoryContext';
import { TrendingUp, Plus, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Semester {
  id: string;
  name: string;
  gpa: string;
}

export function CGPACalculator() {
  const [semesters, setSemesters] = useState<Semester[]>([
    { id: '1', name: 'Semester 1', gpa: '' }
  ]);
  const [result, setResult] = useState<{ cgpa: number; breakdown: string[] } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const { addToHistory } = useHistory();

  const addSemester = () => {
    const newNum = semesters.length + 1;
    setSemesters([...semesters, { 
      id: Date.now().toString(), 
      name: `Semester ${newNum}`, 
      gpa: '' 
    }]);
  };

  const removeSemester = (id: string) => {
    if (semesters.length > 1) {
      setSemesters(semesters.filter(s => s.id !== id));
    }
  };

  const updateSemester = (id: string, field: 'name' | 'gpa', value: string) => {
    setSemesters(semesters.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const calculate = async () => {
    const validSemesters = semesters.filter(s => s.gpa && !isNaN(parseFloat(s.gpa)));
    
    if (validSemesters.length === 0) return;

    setIsCalculating(true);
    setShowAnimation(false);
    
    // Simulate calculation delay for animation
    await new Promise(resolve => setTimeout(resolve, 500));

    const total = validSemesters.reduce((sum, s) => sum + parseFloat(s.gpa), 0);
    const cgpa = total / validSemesters.length;
    const percentage = cgpa * 9.5;

    const breakdown = [
      'CGPA Calculation:',
      ...validSemesters.map(s => 
        `${s.name}: ${parseFloat(s.gpa).toFixed(2)} GPA`
      ),
      `Total GPA: ${total.toFixed(2)}`,
      `Number of Semesters: ${validSemesters.length}`,
      `CGPA = Sum of all GPAs ÷ Number of Semesters`,
      `CGPA = ${total.toFixed(2)} ÷ ${validSemesters.length} = ${cgpa.toFixed(2)}`,
      '',
      'Percentage Calculation:',
      `Percentage = CGPA × 9.5`,
      `Percentage = ${cgpa.toFixed(2)} × 9.5 = ${percentage.toFixed(2)}%`
    ];

    setResult({ cgpa, breakdown });
    setShowAnimation(true);
    setIsCalculating(false);

    addToHistory({
      type: 'cgpa',
      calculation: `${validSemesters.length} semesters`,
      result: cgpa.toFixed(2),
      details: { semesters: validSemesters, cgpa, percentage }
    });
  };

  const reset = () => {
    setSemesters([{ id: '1', name: 'Semester 1', gpa: '' }]);
    setResult(null);
    setShowAnimation(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Card className="bg-gradient-card border-border/20 shadow-aura">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">CGPA Calculator</CardTitle>
              <CardDescription>Calculate your Cumulative Grade Point Average</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {semesters.map((semester) => (
              <div key={semester.id} className="flex gap-3 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`semester-${semester.id}`}>Semester Name</Label>
                  <Input
                    id={`semester-${semester.id}`}
                    placeholder="e.g., Semester 1"
                    value={semester.name}
                    onChange={(e) => updateSemester(semester.id, 'name', e.target.value)}
                    className="bg-gradient-number border-border/20"
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label htmlFor={`gpa-${semester.id}`}>GPA</Label>
                  <Input
                    id={`gpa-${semester.id}`}
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={semester.gpa}
                    onChange={(e) => updateSemester(semester.id, 'gpa', e.target.value)}
                    className="bg-gradient-number border-border/20"
                  />
                </div>
                {semesters.length > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeSemester(semester.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button onClick={addSemester} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Semester
          </Button>

          <div className="flex gap-3">
            <motion.button
              onClick={calculate}
              disabled={isCalculating}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 relative group overflow-hidden rounded-xl py-4 px-6 font-semibold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 10px 30px -10px rgba(102, 126, 234, 0.6), 0 0 0 1px rgba(255,255,255,0.1) inset',
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
              />
              <motion.div
                className="absolute inset-0"
                animate={{
                  boxShadow: isCalculating 
                    ? ['0 0 20px rgba(102, 126, 234, 0.5)', '0 0 40px rgba(102, 126, 234, 0.8)', '0 0 20px rgba(102, 126, 234, 0.5)']
                    : '0 0 20px rgba(102, 126, 234, 0.5)'
                }}
                transition={{ duration: 1.5, repeat: isCalculating ? Infinity : 0 }}
              />
              <span className="relative flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5" />
                {isCalculating ? 'Calculating...' : 'Calculate CGPA'}
              </span>
            </motion.button>
            <Button onClick={reset} variant="outline">
              Reset
            </Button>
          </div>

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-gradient-number border-border/20 overflow-hidden">
                  <CardContent className="pt-6 space-y-6">
                    {/* Main Results with Animation */}
                    <div className="grid grid-cols-2 gap-6">
                      {/* CGPA Display */}
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={showAnimation ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                        className="text-center"
                      >
                        <p className="text-sm text-muted-foreground mb-2">Your CGPA</p>
                        <motion.p
                          initial={{ y: 20, opacity: 0 }}
                          animate={showAnimation ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                          transition={{ delay: 0.4, type: "spring", stiffness: 150 }}
                          className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent"
                        >
                          {result.cgpa.toFixed(2)}
                        </motion.p>
                      </motion.div>

                      {/* Percentage Display */}
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={showAnimation ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
                        className="text-center"
                      >
                        <p className="text-sm text-muted-foreground mb-2">Percentage</p>
                        <motion.p
                          initial={{ y: 20, opacity: 0 }}
                          animate={showAnimation ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                          transition={{ delay: 0.5, type: "spring", stiffness: 150 }}
                          className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent"
                        >
                          {(result.cgpa * 9.5).toFixed(2)}%
                        </motion.p>
                      </motion.div>
                    </div>

                    {/* 3D Visualizations */}
                    <div className="grid grid-cols-2 gap-6 mt-8">
                      {/* 3D Bar Graph */}
                      <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={showAnimation ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="space-y-3"
                      >
                        <p className="text-sm font-semibold text-foreground text-center mb-4">Semester Performance</p>
                        <div className="flex items-end justify-around h-48 gap-2 bg-background/30 rounded-xl p-4 border border-border/20">
                          {semesters.filter(s => s.gpa && !isNaN(parseFloat(s.gpa))).map((semester, index) => {
                            const gpaValue = parseFloat(semester.gpa);
                            const heightPercent = (gpaValue / 10) * 100;
                            
                            return (
                              <motion.div
                                key={semester.id}
                                initial={{ height: 0, opacity: 0 }}
                                animate={showAnimation ? { height: `${heightPercent}%`, opacity: 1 } : { height: 0, opacity: 0 }}
                                transition={{ delay: 0.8 + (index * 0.15), type: "spring", stiffness: 100 }}
                                className="flex-1 relative group"
                                style={{
                                  background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                                  boxShadow: '0 10px 20px -10px rgba(102, 126, 234, 0.6)',
                                  borderRadius: '8px 8px 0 0',
                                  minHeight: '20px',
                                  transformStyle: 'preserve-3d',
                                  transform: 'perspective(1000px) rotateX(-5deg)',
                                }}
                              >
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent rounded-t-lg"
                                  animate={{
                                    opacity: [0.3, 0.6, 0.3],
                                  }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                  {gpaValue.toFixed(1)}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                        <div className="flex justify-around text-xs text-muted-foreground">
                          {semesters.filter(s => s.gpa && !isNaN(parseFloat(s.gpa))).map((_, index) => (
                            <span key={index}>S{index + 1}</span>
                          ))}
                        </div>
                      </motion.div>

                      {/* 3D Pie Chart */}
                      <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={showAnimation ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                        className="space-y-3"
                      >
                        <p className="text-sm font-semibold text-foreground text-center mb-4">CGPA Distribution</p>
                        <div className="flex items-center justify-center h-48">
                          <motion.div
                            animate={showAnimation ? {
                              rotate: [0, 360],
                            } : {}}
                            transition={{ delay: 1, duration: 2, ease: "easeInOut" }}
                            className="relative w-40 h-40"
                            style={{
                              transformStyle: 'preserve-3d',
                              transform: 'perspective(1000px) rotateX(20deg)',
                            }}
                          >
                            {/* Pie Chart Segments */}
                            {semesters.filter(s => s.gpa && !isNaN(parseFloat(s.gpa))).map((semester, index, arr) => {
                              const angle = (360 / arr.length) * index;
                              const hue = (280 + (index * 60)) % 360;
                              
                              return (
                                <motion.div
                                  key={semester.id}
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={showAnimation ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                                  transition={{ delay: 1.2 + (index * 0.1), type: "spring" }}
                                  className="absolute inset-0"
                                  style={{
                                    clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos((angle - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((angle - 90) * Math.PI / 180)}%, ${50 + 50 * Math.cos((angle + 360 / arr.length - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((angle + 360 / arr.length - 90) * Math.PI / 180)}%)`,
                                    background: `linear-gradient(135deg, hsl(${hue}, 70%, 60%), hsl(${hue + 20}, 70%, 50%))`,
                                    borderRadius: '50%',
                                    boxShadow: `0 4px 15px -3px hsla(${hue}, 70%, 50%, 0.5)`,
                                  }}
                                />
                              );
                            })}
                            
                            {/* Center Circle */}
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={showAnimation ? { scale: 1 } : { scale: 0 }}
                              transition={{ delay: 1.5, type: "spring" }}
                              className="absolute inset-[25%] rounded-full bg-background border-2 border-border/30 flex items-center justify-center"
                              style={{
                                boxShadow: '0 5px 20px rgba(0,0,0,0.3) inset',
                              }}
                            >
                              <span className="text-xs font-bold bg-gradient-primary bg-clip-text text-transparent">
                                {result.cgpa.toFixed(1)}
                              </span>
                            </motion.div>
                          </motion.div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Breakdown */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={showAnimation ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ delay: 1.8 }}
                      className="space-y-2 mt-6 pt-6 border-t border-border/20"
                    >
                      <p className="text-sm font-semibold text-foreground">Step-by-Step Breakdown:</p>
                      {result.breakdown.map((line, index) => (
                        <motion.p
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={showAnimation ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                          transition={{ delay: 1.9 + (index * 0.05) }}
                          className="text-sm text-muted-foreground pl-4"
                        >
                          {line}
                        </motion.p>
                      ))}
                    </motion.div>
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
