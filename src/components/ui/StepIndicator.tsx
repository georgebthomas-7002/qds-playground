'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CALCULATOR_STEPS } from '@/lib/constants';

interface StepIndicatorProps {
  currentStep: number;
  className?: string;
}

export function StepIndicator({ currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Mobile: Progress bar */}
      <div className="mb-4 md:hidden">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Step {currentStep + 1} of {CALCULATOR_STEPS.length}</span>
          <span>{CALCULATOR_STEPS[currentStep].label}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <motion.div
            className="h-full bg-brand-lime"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentStep + 1) / CALCULATOR_STEPS.length) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Desktop: Step circles */}
      <div className="hidden md:flex md:items-center md:justify-between">
        {CALCULATOR_STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div key={step.id} className="flex items-center">
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <motion.div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors',
                    isCompleted &&
                      'border-brand-lime bg-brand-lime text-brand-navy',
                    isCurrent &&
                      'border-brand-navy bg-brand-navy text-white',
                    isUpcoming && 'border-gray-200 bg-white text-gray-400'
                  )}
                  initial={false}
                  animate={
                    isCompleted
                      ? { scale: [1, 1.1, 1] }
                      : isCurrent
                      ? { scale: [1, 1.05, 1] }
                      : {}
                  }
                  transition={{ duration: 0.3 }}
                >
                  {isCompleted ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </motion.div>
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      'text-xs font-semibold',
                      isCurrent ? 'text-brand-navy' : 'text-gray-500'
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-gray-400">{step.description}</p>
                </div>
              </div>

              {/* Connector line */}
              {index < CALCULATOR_STEPS.length - 1 && (
                <div className="mx-2 h-0.5 flex-1 bg-gray-100 md:mx-4">
                  <motion.div
                    className="h-full bg-brand-lime"
                    initial={{ width: 0 }}
                    animate={{ width: isCompleted ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
