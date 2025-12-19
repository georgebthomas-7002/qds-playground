'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/calculations';
import { ANNUAL_TCR_COST } from '@/lib/constants';

interface ROIChartProps {
  annualLaborSavings: number;
  netAnnualROI: number;
}

export function ROIChart({ annualLaborSavings, netAnnualROI }: ROIChartProps) {
  const data = [
    {
      name: 'Labor Savings',
      value: annualLaborSavings,
      fill: '#0d9488',
    },
    {
      name: 'TCR Cost',
      value: -ANNUAL_TCR_COST,
      fill: '#ef4444',
    },
    {
      name: 'Net ROI',
      value: netAnnualROI,
      fill: netAnnualROI > 0 ? '#1e3a5f' : '#f59e0b',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="h-64 w-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 30 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(value) => formatCurrency(Math.abs(value))}
            fontSize={12}
          />
          <YAxis type="category" dataKey="name" fontSize={12} width={100} />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), 'Amount']}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
