import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useHistory } from '@/contexts/HistoryContext';
import { GraduationCap, Calculator, Beaker, BookOpen, Globe, Palette, Music, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Subject {
  id: string;
  name: string;
  maxMarks: string;
  obtainedMarks: string;
  icon: 'math' | 'science' | 'english' | 'social' | 'art' | 'music';
}

const subjectIcons = {
  math: Calculator,
  science: Beaker,
  english: BookOpen,
  social: Globe,
  art: Palette,
  music: Music,
};

const subjectColors = {
  math: '#3A7BF7',
  science: '#10B981',
  english: '#F59E0B',
  social: '#EF4444',
  art: '#8A5CF6',
  music: '#EC4899',
};

export function MarksPercentageCalculator() {
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Mathematics', maxMarks: '', obtainedMarks: '', icon: 'math' },
  ]);
  const [result, setResult] = useState<{ 
    totalPercentage: number; 
    subjectResults: { name: string; percentage: number; color: string }[];
    isCalculating: boolean;
  } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { addToHistory } = useHistory();

  const playSuccessSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 523.25; // C5
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const addSubject = () => {
    const icons: Array<'math' | 'science' | 'english' | 'social' | 'art' | 'music'> = ['math', 'science', 'english', 'social', 'art', 'music'];
    const newSubject: Subject = {
      id: Date.now().toString(),
      name: '',
      maxMarks: '',
      obtainedMarks: '',
      icon: icons[subjects.length % icons.length],
    };
    setSubjects([...subjects, newSubject]);
  };

  const removeSubject = (id: string) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  const updateSubject = (id: string, field: keyof Subject, value: string) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const calculate = async () => {
    const validSubjects = subjects.filter(s => 
      s.name && s.maxMarks && s.obtainedMarks && 
      parseFloat(s.maxMarks) > 0 && parseFloat(s.obtainedMarks) >= 0
    );

    if (validSubjects.length === 0) return;

    setResult({ totalPercentage: 0, subjectResults: [], isCalculating: true });

    await new Promise(resolve => setTimeout(resolve, 500));

    const subjectResults = validSubjects.map(s => {
      const percentage = (parseFloat(s.obtainedMarks) / parseFloat(s.maxMarks)) * 100;
      return {
        name: s.name,
        percentage,
        color: subjectColors[s.icon],
      };
    });

    const totalObtained = validSubjects.reduce((sum, s) => sum + parseFloat(s.obtainedMarks), 0);
    const totalMax = validSubjects.reduce((sum, s) => sum + parseFloat(s.maxMarks), 0);
    const totalPercentage = (totalObtained / totalMax) * 100;

    setResult({ totalPercentage, subjectResults, isCalculating: false });
    setShowSuccess(true);
    playSuccessSound();

    setTimeout(() => setShowSuccess(false), 3000);

    addToHistory({
      type: 'marks-percentage',
      calculation: `${validSubjects.length} subjects`,
      result: `${totalPercentage.toFixed(2)}%`,
      details: { totalPercentage, subjectResults }
    });
  };

  const reset = () => {
    setSubjects([{ id: '1', name: 'Mathematics', maxMarks: '', obtainedMarks: '', icon: 'math' }]);
    setResult(null);
    setShowSuccess(false);
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0B0F1A 0%, #1a1f35 100%)' }}>
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#3A7BF7] rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#8A5CF6] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#3A7BF7] to-[#8A5CF6] flex items-center justify-center shadow-lg shadow-[#3A7BF7]/30">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Marks Percentage Calculator</h1>
          <p className="text-gray-400">Visualize your academic performance with 3D animations</p>
        </motion.div>

        {/* Overall Percentage Display */}
        <AnimatePresence>
          {result && !result.isCalculating && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="text-center mb-8"
            >
              <motion.div
                animate={{ 
                  boxShadow: showSuccess 
                    ? ['0 0 20px rgba(58, 123, 247, 0.5)', '0 0 40px rgba(138, 92, 246, 0.8)', '0 0 20px rgba(58, 123, 247, 0.5)']
                    : '0 0 20px rgba(58, 123, 247, 0.3)'
                }}
                transition={{ duration: 1, repeat: showSuccess ? Infinity : 0 }}
                className="inline-block px-12 py-6 rounded-3xl bg-gradient-to-r from-[#3A7BF7]/20 to-[#8A5CF6]/20 border border-[#3A7BF7]/30 backdrop-blur-xl"
              >
                <p className="text-sm text-gray-400 mb-2">Overall Percentage</p>
                <p className="text-7xl font-bold bg-gradient-to-r from-[#3A7BF7] to-[#8A5CF6] bg-clip-text text-transparent">
                  {result.totalPercentage.toFixed(1)}%
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left: Orbiting Subject Icons */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-center"
          >
            <div className="relative w-80 h-80">
              {/* Center Pie Chart */}
              <motion.div 
                className="absolute inset-0 flex items-center justify-center"
                animate={result && !result.isCalculating ? { rotate: 360 } : {}}
                transition={{ duration: 2, ease: "easeInOut" }}
              >
                <motion.div 
                  className="relative w-48 h-48 rounded-full bg-gradient-to-br from-[#3A7BF7]/30 to-[#8A5CF6]/30 border-4 border-[#3A7BF7]/50 shadow-2xl shadow-[#3A7BF7]/40"
                  whileHover={{ scale: 1.05, boxShadow: '0 0 60px rgba(58, 123, 247, 0.6)' }}
                  style={{
                    background: result && !result.isCalculating 
                      ? `conic-gradient(${result.subjectResults.map((s, i, arr) => {
                          const prevPercentage = arr.slice(0, i).reduce((sum, sub) => sum + sub.percentage, 0);
                          const currentPercentage = s.percentage;
                          return `${s.color} ${(prevPercentage / arr.length) * 100}%, ${s.color} ${((prevPercentage + currentPercentage) / arr.length) * 100}%`;
                        }).join(', ')})`
                      : undefined
                  }}
                />
              </motion.div>

              {/* Orbiting Subject Icons */}
              <AnimatePresence>
                {subjects.map((subject, index) => {
                  const Icon = subjectIcons[subject.icon];
                  const angle = (index / subjects.length) * 360;
                  const radius = 140;
                  const speed = 8 + index * 2;

                  return (
                    <motion.div
                      key={subject.id}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute top-1/2 left-1/2"
                      style={{
                        width: '64px',
                        height: '64px',
                        marginLeft: '-32px',
                        marginTop: '-32px',
                      }}
                    >
                      <motion.div
                        animate={{
                          rotate: [angle, angle + 360],
                          x: [Math.cos((angle * Math.PI) / 180) * radius, Math.cos(((angle + 360) * Math.PI) / 180) * radius],
                          y: [Math.sin((angle * Math.PI) / 180) * radius, Math.sin(((angle + 360) * Math.PI) / 180) * radius],
                        }}
                        transition={{
                          duration: speed,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="relative"
                      >
                        <div 
                          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-sm border-2"
                          style={{
                            background: `linear-gradient(135deg, ${subjectColors[subject.icon]}40, ${subjectColors[subject.icon]}20)`,
                            borderColor: `${subjectColors[subject.icon]}80`,
                            boxShadow: `0 0 30px ${subjectColors[subject.icon]}60`,
                          }}
                        >
                          <Icon className="w-8 h-8" style={{ color: subjectColors[subject.icon] }} />
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Center: Subject Input Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card className="bg-[#1a1f35]/80 border-[#3A7BF7]/30 backdrop-blur-xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white">Add Subjects</CardTitle>
                <CardDescription className="text-gray-400">Enter marks for each subject</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                <AnimatePresence>
                  {subjects.map((subject, index) => (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-xl bg-[#0B0F1A]/50 border border-[#3A7BF7]/20 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <Label className="text-gray-300">Subject {index + 1}</Label>
                        {subjects.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSubject(subject.id)}
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Input
                        placeholder="Subject name"
                        value={subject.name}
                        onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                        className="bg-[#0B0F1A]/80 border-[#3A7BF7]/30 text-white placeholder:text-gray-500"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          type="number"
                          placeholder="Max marks"
                          value={subject.maxMarks}
                          onChange={(e) => updateSubject(subject.id, 'maxMarks', e.target.value)}
                          className="bg-[#0B0F1A]/80 border-[#3A7BF7]/30 text-white placeholder:text-gray-500"
                        />
                        <Input
                          type="number"
                          placeholder="Obtained"
                          value={subject.obtainedMarks}
                          onChange={(e) => updateSubject(subject.id, 'obtainedMarks', e.target.value)}
                          className="bg-[#0B0F1A]/80 border-[#3A7BF7]/30 text-white placeholder:text-gray-500"
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <Button
                  onClick={addSubject}
                  variant="outline"
                  className="w-full border-[#3A7BF7]/50 text-[#3A7BF7] hover:bg-[#3A7BF7]/20"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={calculate}
                className="flex-1 bg-gradient-to-r from-[#3A7BF7] to-[#8A5CF6] hover:shadow-lg hover:shadow-[#3A7BF7]/50 text-white font-semibold"
              >
                Calculate
              </Button>
              <Button
                onClick={reset}
                variant="outline"
                className="border-[#3A7BF7]/50 text-gray-300 hover:bg-[#3A7BF7]/20"
              >
                Reset
              </Button>
            </div>
          </motion.div>

          {/* Right: Rising Bar Graph */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-center"
          >
            <div className="w-full max-w-sm h-[500px] relative">
              <AnimatePresence>
                {result && !result.isCalculating && (
                  <div className="space-y-4 h-full flex flex-col justify-end pb-8">
                    {result.subjectResults.map((subject, index) => (
                      <motion.div
                        key={index}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        transition={{ 
                          delay: index * 0.2,
                          duration: 0.6,
                          type: "spring",
                          bounce: 0.4
                        }}
                        className="relative"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-300">{subject.name}</span>
                              <span className="text-sm font-bold text-white">{subject.percentage.toFixed(1)}%</span>
                            </div>
                            <motion.div
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ 
                                delay: index * 0.2 + 0.2,
                                duration: 0.8,
                                ease: "easeOut"
                              }}
                              className="h-12 rounded-lg relative overflow-hidden origin-left"
                              style={{
                                background: `linear-gradient(90deg, ${subject.color}80, ${subject.color})`,
                                boxShadow: `0 4px 20px ${subject.color}60`,
                                width: `${subject.percentage}%`,
                              }}
                            >
                              <motion.div
                                animate={{
                                  x: ['-100%', '100%'],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "linear",
                                }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                              />
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0B0F1A;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3A7BF7;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #8A5CF6;
        }
      `}</style>
    </div>
  );
}
