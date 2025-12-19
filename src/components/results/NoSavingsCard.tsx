'use client';

import { motion } from 'framer-motion';
import { MINIMUM_FTES } from '@/lib/constants';

interface NoSavingsCardProps {
  isAtMinimumStaff: boolean;
  isUnderstaffed: boolean;
}

export function NoSavingsCard({
  isAtMinimumStaff,
  isUnderstaffed,
}: NoSavingsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border-2 border-amber-200 bg-amber-50 p-6 text-center"
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
        <svg
          className="h-6 w-6 text-amber-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h3 className="text-lg font-bold text-amber-800">
        Limited Direct Savings Identified
      </h3>

      <p className="mt-3 text-sm text-amber-700">
        {isUnderstaffed ? (
          <>
            Based on your transaction volume, your branch may actually be{' '}
            <strong>understaffed</strong>. A TCR implementation could help your
            current team handle the workload more efficiently without adding
            headcount.
          </>
        ) : isAtMinimumStaff ? (
          <>
            Your branch is currently at the minimum staffing level of{' '}
            {MINIMUM_FTES} FTEs. While direct labor savings are limited, TCR
            implementation can significantly improve operational efficiency and
            customer experience.
          </>
        ) : (
          <>
            Based on your current configuration, optimal staffing would fall
            below the minimum {MINIMUM_FTES} FTE requirement. TCR implementation
            may still provide value through improved efficiency.
          </>
        )}
      </p>

      <div className="mt-5 rounded-lg bg-white p-4 text-left">
        <h4 className="text-sm font-semibold text-gray-800">
          Benefits Beyond Labor Savings:
        </h4>
        <ul className="mt-2 space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal"
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
            <span>Reduced cash handling errors and discrepancies</span>
          </li>
          <li className="flex items-start gap-2">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal"
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
            <span>Faster transaction times and improved customer experience</span>
          </li>
          <li className="flex items-start gap-2">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal"
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
            <span>Enhanced security and audit compliance</span>
          </li>
          <li className="flex items-start gap-2">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal"
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
            <span>Streamlined vault management and cash ordering</span>
          </li>
        </ul>
      </div>
    </motion.div>
  );
}
