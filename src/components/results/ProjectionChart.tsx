'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/calculations';
import { TCR_CAPITAL_COST } from '@/lib/constants';

interface ProjectionChartProps {
  netAnnualROI: number;
}

export function ProjectionChart({ netAnnualROI }: ProjectionChartProps) {
  // Generate 5-year projection data
  const data = Array.from({ length: 6 }, (_, year) => {
    let cumulativeROI = 0;

    if (year === 0) {
      cumulativeROI = 0;
    } else if (year === 1) {
      // First year includes capital investment
      cumulativeROI = netAnnualROI - TCR_CAPITAL_COST;
    } else {
      // Subsequent years add annual ROI
      cumulativeROI = netAnnualROI - TCR_CAPITAL_COST + netAnnualROI * (year - 1);
    }

    return {
      year: `Year ${year}`,
      roi: cumulativeROI,
      investment: year === 0 ? 0 : -TCR_CAPITAL_COST,
    };
  });

  // Find break-even point
  const breakEvenYear = data.findIndex((d) => d.roi >= 0 && d.year !== 'Year 0');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 20, right: 30, top: 10 }}>
            <defs>
              <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="year" fontSize={12} />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              fontSize={12}
              width={80}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Cumulative ROI']}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Area
              type="monotone"
              dataKey="roi"
              stroke="#0d9488"
              strokeWidth={2}
              fill="url(#roiGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {breakEvenYear > 0 && netAnnualROI > 0 && (
        <div className="rounded-lg bg-brand-teal/10 p-3 text-center">
          <p className="text-sm font-medium text-brand-teal-dark">
            Break-even projected in{' '}
            <span className="font-bold">Year {breakEvenYear}</span>
          </p>
        </div>
      )}
    </motion.div>
  );
}
