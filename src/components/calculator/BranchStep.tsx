'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCalculator } from '@/hooks/useCalculator';
import { Button, Input, Card } from '@/components/ui';
import { branchSchema } from '@/lib/validations';
import { DEFAULT_FTE_ANNUAL_COST } from '@/lib/constants';
import { formatCurrency } from '@/lib/calculations';

interface FormErrors {
  branchName?: string;
  monthlyTransactions?: string;
  currentFTEs?: string;
  annualFTECost?: string;
}

export function BranchStep() {
  const { branchData, updateBranchData, nextStep, prevStep } = useCalculator();
  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = branchSchema.safeParse({
      branchName: branchData.branchName,
      monthlyTransactions: branchData.monthlyTransactions,
      currentFTEs: branchData.currentFTEs,
      annualFTECost: branchData.annualFTECost || DEFAULT_FTE_ANNUAL_COST,
    });

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    nextStep();
  };

  const handleNumberChange = (
    field: 'monthlyTransactions' | 'currentFTEs' | 'annualFTECost',
    value: string
  ) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    updateBranchData({ [field]: numValue });
    setErrors((prev) => ({ ...prev, [field]: undefined }));
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
            Branch Details
          </h2>
          <p className="mt-2 text-gray-500">
            Provide your branch&apos;s transaction volume and staffing information.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Branch Name"
            name="branchName"
            placeholder="e.g., Main Street Branch"
            value={branchData.branchName || ''}
            onChange={(e) => {
              updateBranchData({ branchName: e.target.value });
              setErrors((prev) => ({ ...prev, branchName: undefined }));
            }}
            error={errors.branchName}
            required
          />

          <Input
            label="Monthly Transaction Volume"
            name="monthlyTransactions"
            type="number"
            placeholder="e.g., 15000"
            value={branchData.monthlyTransactions || ''}
            onChange={(e) =>
              handleNumberChange('monthlyTransactions', e.target.value)
            }
            error={errors.monthlyTransactions}
            hint="Total transactions processed per month at this branch"
            required
          />

          <Input
            label="Current Staff (FTEs)"
            name="currentFTEs"
            type="number"
            step="0.5"
            placeholder="e.g., 5"
            value={branchData.currentFTEs || ''}
            onChange={(e) => handleNumberChange('currentFTEs', e.target.value)}
            error={errors.currentFTEs}
            hint="Full-time equivalent employees currently at this branch"
            required
          />

          <Input
            label="Annual Cost Per FTE"
            name="annualFTECost"
            type="number"
            prefix="$"
            placeholder="42,000"
            value={branchData.annualFTECost || ''}
            onChange={(e) => handleNumberChange('annualFTECost', e.target.value)}
            error={errors.annualFTECost}
            hint={`Total compensation including salary and benefits. Defaults to ${formatCurrency(DEFAULT_FTE_ANNUAL_COST)} if not specified.`}
          />

          <div className="flex justify-between pt-4">
            <Button type="button" variant="ghost" onClick={prevStep}>
              <ArrowLeftIcon />
              Back
            </Button>
            <Button type="submit" rightIcon={<ArrowRightIcon />}>
              Continue
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
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
