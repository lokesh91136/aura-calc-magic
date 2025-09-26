import React from 'react';
import { cn } from '@/lib/utils';

interface CalculatorButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'number' | 'operator' | 'equals' | 'clear' | 'function';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const CalculatorButton = React.forwardRef<HTMLButtonElement, CalculatorButtonProps>(
  ({ className, variant = 'number', size = 'md', children, ...props }, ref) => {
    const baseClasses = 'font-semibold text-lg rounded-xl transition-all duration-200 active:scale-95 hover:scale-105 select-none';
    
    const variantClasses = {
      number: 'bg-gradient-number text-foreground shadow-aura hover:shadow-lg border border-border/20',
      operator: 'bg-gradient-operator text-white shadow-operator hover:shadow-lg border-0',
      equals: 'bg-gradient-equals text-white shadow-equals hover:shadow-lg border-0',
      clear: 'bg-gradient-clear text-white shadow-clear hover:shadow-lg border-0',
      function: 'bg-gradient-primary text-foreground shadow-aura hover:shadow-lg border border-border/20'
    };
    
    const sizeClasses = {
      sm: 'h-12 px-4',
      md: 'h-16 px-6',
      lg: 'h-20 px-8'
    };

    return (
      <button
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

CalculatorButton.displayName = 'CalculatorButton';

export { CalculatorButton };