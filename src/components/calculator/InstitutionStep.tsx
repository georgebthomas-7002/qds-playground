'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCalculator } from '@/hooks/useCalculator';
import { Button, Input, Card } from '@/components/ui';
import { institutionSchema } from '@/lib/validations';

export function InstitutionStep() {
  const { branchData, updateBranchData, nextStep } = useCalculator();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = institutionSchema.safeParse({
      institutionName: branchData.institutionName,
    });

    if (!result.success) {
      setError(result.error.errors[0]?.message || 'Please enter your institution name');
      return;
    }

    setError(null);
    nextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mx-auto max-w-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Let&apos;s get started
          </h2>
          <p className="mt-2 text-gray-500">
            Tell us about your financial institution to begin your ROI analysis.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="Institution Name"
            name="institutionName"
            placeholder="e.g., First National Bank"
            value={branchData.institutionName || ''}
            onChange={(e) => {
              updateBranchData({ institutionName: e.target.value });
              setError(null);
            }}
            error={error || undefined}
            hint="The name of your bank or credit union"
            required
            autoFocus
          />

          <div className="mt-8 flex justify-end">
            <Button type="submit" rightIcon={<ArrowRightIcon />}>
              Continue
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
