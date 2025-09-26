import { useNavigate } from 'react-router-dom';
import { MathQuiz } from '@/components/MathQuiz';

export default function MathQuizPage() {
  const navigate = useNavigate();

  const handleBackToCalculator = () => {
    navigate('/');
  };

  return <MathQuiz onBackToCalculator={handleBackToCalculator} />;
}