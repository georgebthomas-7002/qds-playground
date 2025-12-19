'use client';

import { motion } from 'framer-motion';
import { useCalculator } from '@/hooks/useCalculator';
import { Button, Card, Checkbox } from '@/components/ui';
import { PAIN_POINTS } from '@/lib/constants';

export function PainPointsStep() {
  const { branchData, updateBranchData, nextStep, prevStep, performCalculation } =
    useCalculator();

  const selectedPainPoints = branchData.painPoints || [];

  const togglePainPoint = (id: string) => {
    const newPainPoints = selectedPainPoints.includes(id)
      ? selectedPainPoints.filter((p) => p !== id)
      : [...selectedPainPoints, id];
    updateBranchData({ painPoints: newPainPoints });
  };

  const handleContinue = () => {
    // Perform the calculation before moving to contact step
    performCalculation();
    nextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Current Challenges
          </h2>
          <p className="mt-2 text-gray-500">
            Select any operational challenges your branch currently faces. This
            helps us provide more relevant insights.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {PAIN_POINTS.map((painPoint, index) => (
            <motion.div
              key={painPoint.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Checkbox
                name={`painPoint-${painPoint.id}`}
                label={painPoint.label}
                description={painPoint.description}
                checked={selectedPainPoints.includes(painPoint.id)}
                onChange={() => togglePainPoint(painPoint.id)}
              />
            </motion.div>
          ))}
        </div>

        <div className="mt-6 rounded-lg bg-gray-50 p-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-800">
              {selectedPainPoints.length}
            </span>{' '}
            {selectedPainPoints.length === 1 ? 'challenge' : 'challenges'}{' '}
            selected
          </p>
        </div>

        <div className="flex justify-between pt-6">
          <Button type="button" variant="ghost" onClick={prevStep}>
            <ArrowLeftIcon />
            Back
          </Button>
          <Button onClick={handleContinue} rightIcon={<ArrowRightIcon />}>
            See My Results
          </Button>
        </div>
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
