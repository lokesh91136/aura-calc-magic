import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Formula {
  id: string;
  category: 'Math' | 'Finance' | 'Physics';
  name: string;
  formula: string;
  explanation: string;
  example: string;
  tags: string[];
}

export interface KnowledgeCapsule {
  id: string;
  title: string;
  category: 'Math' | 'Finance' | 'Physics';
  definition: string;
  formula?: string;
  example: string;
  practiceProblems: {
    question: string;
    options?: string[];
    answer: string;
    explanation: string;
  }[];
}

export interface SavedItem {
  id: string;
  type: 'formula' | 'equation' | 'solution';
  title: string;
  content: string;
  timestamp: Date;
}

export interface StudyProgress {
  quizzesCompleted: number;
  correctAnswers: number;
  streak: number;
  topics: { [key: string]: number };
}

interface StudyContextType {
  formulas: Formula[];
  knowledgeCapsules: KnowledgeCapsule[];
  savedItems: SavedItem[];
  progress: StudyProgress;
  saveItem: (item: Omit<SavedItem, 'id' | 'timestamp'>) => void;
  removeItem: (id: string) => void;
  updateProgress: (correct: boolean, topic: string) => void;
  resetProgress: () => void;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

// Sample data
const sampleFormulas: Formula[] = [
  {
    id: '1',
    category: 'Math',
    name: 'Quadratic Formula',
    formula: 'x = (-b ± √(b² - 4ac)) / 2a',
    explanation: 'Solves quadratic equations of the form ax² + bx + c = 0',
    example: 'For x² - 5x + 6 = 0: a=1, b=-5, c=6 → x = (5 ± √(25-24))/2 = (5 ± 1)/2 → x = 3 or x = 2',
    tags: ['quadratic', 'equation', 'roots']
  },
  {
    id: '2',
    category: 'Finance',
    name: 'Compound Interest',
    formula: 'A = P(1 + r/n)^(nt)',
    explanation: 'Calculates amount after compound interest where P=principal, r=rate, n=compounds per year, t=time',
    example: 'P=10000, r=0.05, n=12, t=2 → A = 10000(1 + 0.05/12)^(12×2) = ₹11,048.96',
    tags: ['interest', 'compound', 'investment']
  },
  {
    id: '3',
    category: 'Finance',
    name: 'EMI Formula',
    formula: 'EMI = P × r × (1+r)^n / ((1+r)^n - 1)',
    explanation: 'Calculates Equated Monthly Installment for loans where P=principal, r=monthly rate, n=months',
    example: 'P=500000, r=0.01, n=60 → EMI = 500000 × 0.01 × 1.01^60 / (1.01^60 - 1) = ₹11,122',
    tags: ['emi', 'loan', 'installment']
  },
  {
    id: '4',
    category: 'Physics',
    name: 'Kinematic Equation',
    formula: 'v² = u² + 2as',
    explanation: 'Relates final velocity (v), initial velocity (u), acceleration (a), and displacement (s)',
    example: 'u=0, a=9.8 m/s², s=10m → v² = 0 + 2×9.8×10 = 196 → v = 14 m/s',
    tags: ['motion', 'velocity', 'acceleration']
  },
  {
    id: '5',
    category: 'Math',
    name: 'Area of Circle',
    formula: 'A = πr²',
    explanation: 'Calculates area of a circle where r is the radius',
    example: 'r=5 → A = π × 5² = 25π ≈ 78.54 square units',
    tags: ['area', 'circle', 'geometry']
  },
  {
    id: '6',
    category: 'Finance',
    name: 'Simple Interest',
    formula: 'SI = P × r × t / 100',
    explanation: 'Calculates simple interest where P=principal, r=rate per annum, t=time in years',
    example: 'P=1000, r=5%, t=2 → SI = 1000 × 5 × 2 / 100 = ₹100',
    tags: ['interest', 'simple', 'principal']
  }
];

const sampleKnowledgeCapsules: KnowledgeCapsule[] = [
  {
    id: '1',
    title: 'Compound Interest Basics',
    category: 'Finance',
    definition: 'Compound interest is interest calculated on the initial principal and also on the accumulated interest from previous periods.',
    formula: 'A = P(1 + r/n)^(nt)',
    example: 'If you invest ₹10,000 at 5% compounded annually for 2 years: A = 10,000(1.05)² = ₹11,025',
    practiceProblems: [
      {
        question: 'What is ₹5,000 at 6% compounded annually for 3 years?',
        options: ['₹5,955.08', '₹5,900.00', '₹6,000.00', '₹5,850.00'],
        answer: '₹5,955.08',
        explanation: 'A = 5000(1.06)³ = 5000 × 1.191016 = ₹5,955.08'
      }
    ]
  },
  {
    id: '2',
    title: 'Pythagorean Theorem',
    category: 'Math',
    definition: 'In a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides.',
    formula: 'c² = a² + b²',
    example: 'For a triangle with sides 3 and 4: c² = 3² + 4² = 9 + 16 = 25, so c = 5',
    practiceProblems: [
      {
        question: 'Find the hypotenuse of a right triangle with sides 5 and 12.',
        options: ['13', '15', '17', '11'],
        answer: '13',
        explanation: 'c² = 5² + 12² = 25 + 144 = 169, so c = √169 = 13'
      }
    ]
  }
];

export function StudyProvider({ children }: { children: ReactNode }) {
  const [formulas] = useState<Formula[]>(sampleFormulas);
  const [knowledgeCapsules] = useState<KnowledgeCapsule[]>(sampleKnowledgeCapsules);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [progress, setProgress] = useState<StudyProgress>({
    quizzesCompleted: 0,
    correctAnswers: 0,
    streak: 0,
    topics: {}
  });

  const saveItem = (item: Omit<SavedItem, 'id' | 'timestamp'>) => {
    const newItem: SavedItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };
    setSavedItems(prev => [newItem, ...prev].slice(0, 100)); // Keep last 100 items
  };

  const removeItem = (id: string) => {
    setSavedItems(prev => prev.filter(item => item.id !== id));
  };

  const updateProgress = (correct: boolean, topic: string) => {
    setProgress(prev => ({
      quizzesCompleted: prev.quizzesCompleted + 1,
      correctAnswers: prev.correctAnswers + (correct ? 1 : 0),
      streak: correct ? prev.streak + 1 : 0,
      topics: {
        ...prev.topics,
        [topic]: (prev.topics[topic] || 0) + (correct ? 1 : 0)
      }
    }));
  };

  const resetProgress = () => {
    setProgress({
      quizzesCompleted: 0,
      correctAnswers: 0,
      streak: 0,
      topics: {}
    });
  };

  return (
    <StudyContext.Provider value={{
      formulas,
      knowledgeCapsules,
      savedItems,
      progress,
      saveItem,
      removeItem,
      updateProgress,
      resetProgress
    }}>
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
}