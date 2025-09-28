import React from 'react';
import { ScientificCalculator } from '@/components/ScientificCalculator';

export function ScientificCalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-bg p-4">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Scientific Calculator
          </h1>
          <p className="text-muted-foreground">
            Advanced mathematical calculations with trigonometric, logarithmic, and exponential functions
          </p>
        </div>
        
        <div className="flex justify-center">
          <ScientificCalculator />
        </div>
      </div>
    </div>
  );
}