import React from 'react';
import { ScientificCalculator } from '@/components/ScientificCalculator';

export function ScientificCalculatorPage() {
  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto">
        <div className="flex justify-center">
          <ScientificCalculator />
        </div>
      </div>
    </div>
  );
}