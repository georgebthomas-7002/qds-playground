'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { trackEvent } from '@/lib/utils';
import { QDS_LOGO_URL } from '@/lib/constants';

export default function HomePage() {
  const handleStartClick = () => {
    trackEvent('calculator_started', { source: 'hero' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Image
              src={QDS_LOGO_URL}
              alt="QDS Logo"
              width={40}
              height={40}
              className="rounded-lg"
              unoptimized
            />
            <div>
              <p className="text-sm font-bold text-brand-navy">
                Quality Data Systems
              </p>
              <p className="text-xs text-gray-500">TCR ROI Calculator</p>
            </div>
          </div>
          <Link href="/calculator" onClick={handleStartClick}>
            <Button size="sm">Start Calculator</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-brand-teal/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-brand-navy/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="mb-4 inline-block rounded-full bg-brand-teal/10 px-4 py-1.5 text-sm font-semibold text-brand-teal">
              Free ROI Analysis
            </span>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Discover Your Branch&apos;s{' '}
              <span className="text-brand-navy">TCR Savings</span> Potential
            </h1>

            <p className="mt-6 text-lg text-gray-600 sm:text-xl">
              Calculate the return on investment for implementing Teller Cash
              Recyclers at your financial institution. Get a personalized
              analysis in under 2 minutes.
            </p>

            <div className="mt-10">
              <Link href="/calculator" onClick={handleStartClick}>
                <Button size="lg" rightIcon={<ArrowRightIcon />}>
                  Calculate My ROI
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-gray-100 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Why Financial Institutions Choose TCRs
            </h2>
            <p className="mt-3 text-gray-600">
              Trusted by 1,000+ branches across the country
            </p>
          </motion.div>

          <div className="mt-20 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative rounded-xl border border-gray-100 bg-white px-6 pb-6 pt-10 shadow-sm transition-shadow hover:shadow-md text-center"
              >
                {/* Icon positioned 50% above card */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-navy shadow-lg">
                    <feature.icon className="h-7 w-7 text-brand-sky" />
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-brand-navy py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Ready to See Your Savings?
            </h2>
            <p className="mt-4 text-lg text-white/70">
              Join hundreds of financial institutions that have optimized their
              branch operations with TCR technology.
            </p>
            <div className="mt-8">
              <Link href="/calculator" onClick={handleStartClick}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-brand-navy hover:bg-gray-100"
                >
                  Start Your Free Analysis
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Image
                src={QDS_LOGO_URL}
                alt="QDS Logo"
                width={32}
                height={32}
                className="rounded"
                unoptimized
              />
              <span className="text-sm font-semibold text-gray-700">
                Quality Data Systems
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Serving financial institutions for 40+ years
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Icons
function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className || 'h-5 w-5'}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

// Features data
const features = [
  {
    title: 'Reduce Labor Costs',
    description:
      'Optimize staffing levels while maintaining excellent customer service with automated cash handling.',
    icon: ({ className }: { className?: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Eliminate Errors',
    description:
      'Say goodbye to cash discrepancies and manual counting errors with precision TCR technology.',
    icon: ({ className }: { className?: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Faster Service',
    description:
      'Reduce customer wait times and process transactions up to 40% faster with streamlined operations.',
    icon: ({ className }: { className?: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Enhanced Security',
    description:
      'Improve cash security with locked recyclers and complete audit trails for every transaction.',
    icon: ({ className }: { className?: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: 'Simplified Vault',
    description:
      'Reduce vault management overhead with automated cash ordering and optimized inventory levels.',
    icon: ({ className }: { className?: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    title: 'Easy Training',
    description:
      'Onboard new tellers faster with intuitive TCR interfaces that simplify cash handling procedures.',
    icon: ({ className }: { className?: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
];
