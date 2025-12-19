'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence } from 'framer-motion';
import { useCalculator } from '@/hooks/useCalculator';
import { StepIndicator, Footer } from '@/components/ui';
import {
  InstitutionStep,
  BranchStep,
  PainPointsStep,
  ContactStep,
} from '@/components/calculator';
import { CALCULATOR_STEPS, QDS_LOGO_URL, QDS_CONTACT_URL } from '@/lib/constants';
import { Button } from '@/components/ui';
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
            <Image
              src={QDS_LOGO_URL}
              alt="QDS Logo"
              width={40}
              height={40}
              className="rounded-lg"
              unoptimized
            />
            <div>
              <p className="text-sm font-bold text-brand-navy">
                Quality Data Systems
              </p>
              <p className="text-xs text-gray-500">TCR ROI Calculator</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                reset();
                trackEvent('calculator_reset');
              }}
              className="text-sm text-gray-500 transition-colors hover:text-gray-700"
            >
              Start Over
            </button>
            <a href={QDS_CONTACT_URL} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="bg-brand-lime text-brand-navy hover:bg-brand-lime/90">
                Start a Conversation
              </Button>
            </a>
          </div>
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

      <Footer />
    </div>
  );
}
