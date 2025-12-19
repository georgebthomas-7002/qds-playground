'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string;
  sublabel?: string;
  variant?: 'default' | 'highlight' | 'featured';
  delay?: number;
}

export function MetricCard({
  label,
  value,
  sublabel,
  variant = 'default',
  delay = 0,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1 }}
      className={cn(
        'rounded-xl p-5',
        variant === 'default' && 'border border-gray-100 bg-white shadow-sm',
        variant === 'highlight' && 'border-2 border-brand-teal/20 bg-brand-teal/5',
        variant === 'featured' &&
          'bg-gradient-to-br from-brand-navy to-brand-navy-dark text-white shadow-lg'
      )}
    >
      <p
        className={cn(
          'text-xs font-semibold uppercase tracking-wide',
          variant === 'featured' ? 'text-white/70' : 'text-gray-500'
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          'mt-2 font-mono text-2xl font-bold',
          variant === 'featured' ? 'text-white' : 'text-gray-900',
          variant === 'highlight' && 'text-brand-teal-dark'
        )}
      >
        {value}
      </p>
      {sublabel && (
        <p
          className={cn(
            'mt-1 text-xs',
            variant === 'featured' ? 'text-white/60' : 'text-gray-400'
          )}
        >
          {sublabel}
        </p>
      )}
    </motion.div>
  );
}
