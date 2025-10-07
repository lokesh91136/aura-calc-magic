import React from 'react';
import { ScientificCalculator } from '@/components/ScientificCalculator';

export function ScientificCalculatorPage() {
  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <div className="text-lg space-y-1 text-foreground">
            <p>Standard</p>
            <p>Scientific</p>
            <p>SIP Calculator</p>
            <p>EMI Calculator</p>
            <p>Age & Date</p>
            <p>Loan Repayment</p>
            <p>Tax Calculator</p>
            <p>Currency Converter</p>
            <p>Savings Goal</p>
            <p>Percentage</p>
            <p>Tally</p>
            <p>Math Quiz</p>
            <p>Calculator Racing</p>
            <p>Learning</p>
            <p>Study Mode</p>
            <p>Education Tools</p>
            <p>Marks %</p>
            <p>Attendance</p>
            <p>GPA</p>
            <p>CGPA</p>
            <p>Grade</p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <ScientificCalculator />
        </div>
      </div>
    </div>
  );
}