'use client';

import { motion } from 'framer-motion';
import { ROICalculation, BranchData } from '@/lib/types';
import { formatCurrency, formatNumber, formatFTE } from '@/lib/calculations';
import { TRANSACTIONS_PER_FTE_MONTHLY, ANNUAL_TCR_COST } from '@/lib/constants';

interface CalculationBreakdownProps {
  calculation: ROICalculation;
  branchData: BranchData;
}

export function CalculationBreakdown({
  calculation,
  branchData,
}: CalculationBreakdownProps) {
  const steps = [
    {
      label: 'Transaction Capacity Analysis',
      calculation: `${formatNumber(branchData.monthlyTransactions)} ÷ ${formatNumber(TRANSACTIONS_PER_FTE_MONTHLY)}`,
      result: `${formatFTE(calculation.recommendedFTEs)} FTEs optimal`,
    },
    {
      label: 'Staffing Optimization',
      calculation: `${branchData.currentFTEs} − ${formatFTE(calculation.recommendedFTEs)}`,
      result: `${formatFTE(calculation.fteSavings)} FTE reduction`,
    },
    {
      label: 'Annual Labor Savings',
      calculation: `${formatFTE(calculation.fteSavings)} × ${formatCurrency(branchData.annualFTECost)}`,
      result: formatCurrency(calculation.annualLaborSavings),
    },
    {
      label: 'Net Annual ROI',
      calculation: `${formatCurrency(calculation.annualLaborSavings)} − ${formatCurrency(ANNUAL_TCR_COST)}`,
      result: formatCurrency(calculation.netAnnualROI),
      highlight: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
    >
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Calculation Breakdown
      </h3>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className={`flex items-center justify-between rounded-lg p-3 ${
              step.highlight
                ? 'bg-brand-navy text-white'
                : 'bg-gray-50'
            }`}
          >
            <div>
              <p
                className={`text-sm font-medium ${
                  step.highlight ? 'text-white' : 'text-gray-700'
                }`}
              >
                {step.label}
              </p>
              <p
                className={`font-mono text-xs ${
                  step.highlight ? 'text-white/70' : 'text-gray-400'
                }`}
              >
                {step.calculation}
              </p>
            </div>
            <p
              className={`font-mono text-sm font-bold ${
                step.highlight ? 'text-white' : 'text-gray-900'
              }`}
            >
              {step.result}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
