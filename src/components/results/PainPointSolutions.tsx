'use client';

import { motion } from 'framer-motion';
import { PAIN_POINTS, PAIN_POINT_SOLUTIONS } from '@/lib/constants';
import { Card } from '@/components/ui';

interface PainPointSolutionsProps {
  selectedPainPoints: string[];
}

export function PainPointSolutions({ selectedPainPoints }: PainPointSolutionsProps) {
  if (selectedPainPoints.length === 0) return null;

  const solutions = selectedPainPoints
    .map((id) => {
      const painPoint = PAIN_POINTS.find((p) => p.id === id);
      const solution = PAIN_POINT_SOLUTIONS[id];
      return painPoint && solution ? { painPoint, solution } : null;
    })
    .filter(Boolean) as Array<{
      painPoint: (typeof PAIN_POINTS)[0];
      solution: (typeof PAIN_POINT_SOLUTIONS)[string];
    }>;

  if (solutions.length === 0) return null;

  return (
    <Card className="mb-8">
      <h3 className="mb-2 text-lg font-bold text-gray-900">
        How TCR Addresses Your Challenges
      </h3>
      <p className="mb-6 text-sm text-gray-500">
        Based on the challenges you selected, here&apos;s how TCR technology can help
      </p>

      <div className="space-y-4">
        {solutions.map(({ painPoint, solution }, index) => (
          <motion.div
            key={painPoint.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="rounded-lg border border-gray-100 bg-gray-50 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-teal/10">
                <svg
                  className="h-4 w-4 text-brand-teal"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">
                    {painPoint.label}
                  </h4>
                  {solution.stat && (
                    <span className="rounded-full bg-brand-lime/20 px-2 py-0.5 text-xs font-semibold text-gray-700">
                      {solution.stat}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm font-medium text-brand-teal">
                  {solution.solution}
                </p>
                <p className="mt-1 text-sm text-gray-600">{solution.benefit}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
