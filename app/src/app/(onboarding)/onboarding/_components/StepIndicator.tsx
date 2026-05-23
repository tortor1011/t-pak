'use client';

import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export default function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-3 sm:gap-4">
        {steps.map((step, index) => {
          const isComplete = index < currentStep;
          const isActive = index === currentStep;

          const circleStyles = isComplete
            ? 'bg-blue-600 text-white shadow-sm shadow-slate-200/50'
            : isActive
            ? 'bg-surface-container-lowest text-blue-600 shadow-sm shadow-slate-200/50 ring-2 ring-blue-600/20'
            : 'bg-surface-container text-on-surface-variant';

          const labelStyles = isComplete
            ? 'text-blue-600'
            : isActive
            ? 'text-on-surface font-semibold'
            : 'text-on-surface-variant';

          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div className={`h-11 w-11 rounded-full flex items-center justify-center ${circleStyles}`}>
                  {isComplete ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                <span className={`text-xs sm:text-sm text-center max-w-[110px] ${labelStyles}`}>{step}</span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`mx-3 sm:mx-4 h-1.5 flex-1 rounded-full transition-colors ${
                    isComplete ? 'bg-blue-600/80' : 'bg-surface-container-high'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
