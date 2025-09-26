import { useNavigate } from 'react-router-dom';
import { CalculatorRacing } from '@/components/CalculatorRacing';

export default function CalculatorRacingPage() {
  const navigate = useNavigate();

  const handleBackToCalculator = () => {
    navigate('/');
  };

  return <CalculatorRacing onBackToCalculator={handleBackToCalculator} />;
}