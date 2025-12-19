'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, id, checked, onChange, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <label
        htmlFor={inputId}
        className={cn(
          'flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 transition-all duration-200',
          'hover:border-brand-navy/30 hover:bg-gray-50',
          checked && 'border-brand-teal bg-brand-teal/5 hover:bg-brand-teal/10',
          className
        )}
      >
        <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            checked={checked}
            onChange={onChange}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'h-5 w-5 rounded border-2 transition-all duration-200',
              checked
                ? 'border-brand-teal bg-brand-teal'
                : 'border-gray-300 bg-white'
            )}
          >
            <motion.svg
              initial={false}
              animate={checked ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full w-full text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </motion.svg>
          </div>
        </div>
        <div className="flex-1">
          {label && (
            <span className="block text-sm font-semibold text-gray-800">
              {label}
            </span>
          )}
          {description && (
            <span className="mt-0.5 block text-xs text-gray-500">
              {description}
            </span>
          )}
        </div>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
