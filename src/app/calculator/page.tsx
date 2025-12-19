'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AnimatePresence } from 'framer-motion';
import { useCalculator } from '@/hooks/useCalculator';
import { StepIndicator } from '@/components/ui';
import {
  InstitutionStep,
  BranchStep,
  PainPointsStep,
  ContactStep,
} from '@/components/calculator';
import { CALCULATOR_STEPS } from '@/lib/constants';
import { trackEvent } from '@/lib/utils';

export default function CalculatorPage() {
  const { currentStep, reset } = useCalculator();

  // Track page view
  useEffect(() => {
    trackEvent('calculator_started');
  }, []);

  // Map step to index
  const stepIndex = CALCULATOR_STEPS.findIndex(
    (step) => step.id === currentStep
  );

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 'institution':
        return <InstitutionStep />;
      case 'branch':
        return <BranchStep />;
      case 'pain-points':
        return <PainPointsStep />;
      case 'contact':
        return <ContactStep />;
      default:
        return <InstitutionStep />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-navy">
              <svg
                className="h-6 w-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-brand-navy">
                Quality Data Systems
              </p>
              <p className="text-xs text-gray-500">TCR ROI Calculator</p>
            </div>
          </Link>

          <button
            onClick={() => {
              reset();
              trackEvent('calculator_reset');
            }}
            className="text-sm text-gray-500 transition-colors hover:text-gray-700"
          >
            Start Over
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-10">
        {/* Step Indicator */}
        <div className="mb-10">
          <StepIndicator currentStep={stepIndex >= 0 ? stepIndex : 0} />
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-6">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-gray-400">
              Your information is secure and will never be shared.
            </p>
            <p className="text-xs text-gray-400">
              Questions?{' '}
              <a
                href="mailto:info@qdsdata.com"
                className="text-brand-teal hover:underline"
              >
                Contact QDS
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
