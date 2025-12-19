'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui';
import { QDS_RESOURCES, QDSResource } from '@/lib/constants';

function ResourceIcon({ type }: { type: QDSResource['type'] }) {
  if (type === 'guide') {
    return (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    );
  }
  if (type === 'product') {
    return (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    );
  }
  // blog
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  );
}

function ResourceTypeLabel({ type }: { type: QDSResource['type'] }) {
  const labels = {
    guide: 'Ultimate Guide',
    product: 'Product Info',
    blog: 'Blog Article',
  };

  const colors = {
    guide: 'bg-brand-lime/20 text-brand-navy',
    product: 'bg-brand-navy/10 text-brand-navy',
    blog: 'bg-brand-sky/30 text-brand-navy',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[type]}`}>
      {labels[type]}
    </span>
  );
}

export function ContinueYourJourney() {
  return (
    <Card className="mb-8">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">
          Continue Your Journey
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Explore these resources to learn more about TCR implementation and maximize your ROI
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {QDS_RESOURCES.map((resource, index) => (
          <motion.a
            key={resource.id}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group flex flex-col rounded-lg border border-gray-200 p-4 transition-all hover:border-brand-navy hover:shadow-md"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-navy/5 text-brand-navy group-hover:bg-brand-navy group-hover:text-white transition-colors">
                <ResourceIcon type={resource.type} />
              </div>
              <ResourceTypeLabel type={resource.type} />
            </div>

            <h4 className="mb-2 font-semibold text-gray-900 group-hover:text-brand-navy transition-colors line-clamp-2">
              {resource.title}
            </h4>

            <p className="mb-4 flex-1 text-sm text-gray-500 line-clamp-3">
              {resource.description}
            </p>

            <div className="flex items-center text-sm font-medium text-brand-navy group-hover:text-brand-teal transition-colors">
              {resource.cta}
              <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </motion.a>
        ))}
      </div>
    </Card>
  );
}
