'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCalculator } from '@/hooks/useCalculator';
import { Button, Card } from '@/components/ui';
import {
  ROIChart,
  ProjectionChart,
  MetricCard,
  NoSavingsCard,
  CalculationBreakdown,
} from '@/components/results';
import { formatCurrency, formatFTE, formatNumber } from '@/lib/calculations';
import { trackEvent } from '@/lib/utils';
import { QDS_LOGO_URL, QDS_CONTACT_URL } from '@/lib/constants';
import { generatePDFReport, downloadPDF } from '@/components/results/PDFReport';

export default function ResultsPage() {
  const router = useRouter();
  const { results, branchData, contactInfo, markResultsViewed, reset } =
    useCalculator();
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Mark results as viewed
  useEffect(() => {
    markResultsViewed();
  }, [markResultsViewed]);

  // Redirect if no results
  useEffect(() => {
    if (!results) {
      router.push('/calculator');
    }
  }, [results, router]);

  if (!results) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-navy border-t-transparent" />
      </div>
    );
  }

  const { calculation } = results;

  const handleDownloadPDF = async () => {
    if (!results) return;

    setPdfGenerating(true);
    setPdfError(null);

    try {
      const blob = await generatePDFReport(results, contactInfo);
      const filename = `TCR-ROI-Report-${results.branchData.institutionName.replace(/\s+/g, '-')}.pdf`;
      downloadPDF(blob, filename);
      setPdfDownloaded(true);
      trackEvent('pdf_downloaded');
    } catch (error) {
      console.error('PDF generation error:', error);
      setPdfError('Failed to generate PDF. Please try again.');
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleNewCalculation = () => {
    reset();
    router.push('/calculator');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
          >
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
          </Link>

          <Button variant="outline" size="sm" onClick={handleNewCalculation}>
            New Calculation
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Your ROI Analysis
          </h1>
          <p className="mt-2 text-gray-600">
            {branchData.institutionName} - {branchData.branchName}
          </p>
        </motion.div>

        {/* Results Content */}
        {calculation.hasPositiveROI ? (
          <>
            {/* Key Metrics Grid */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                label="Annual ROI"
                value={formatCurrency(calculation.netAnnualROI)}
                sublabel="Net savings per year"
                variant="featured"
                delay={0}
              />
              <MetricCard
                label="FTE Savings"
                value={formatFTE(calculation.fteSavings)}
                sublabel="Staff optimization"
                variant="highlight"
                delay={1}
              />
              <MetricCard
                label="Monthly Savings"
                value={formatCurrency(calculation.monthlyROI)}
                sublabel="Net per month"
                delay={2}
              />
              <MetricCard
                label="5-Year ROI"
                value={formatCurrency(calculation.fiveYearROI)}
                sublabel="Total projected return"
                delay={3}
              />
            </div>

            {/* Charts Section */}
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              <Card className="overflow-hidden">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  Annual Savings Breakdown
                </h3>
                <ROIChart
                  annualLaborSavings={calculation.annualLaborSavings}
                  netAnnualROI={calculation.netAnnualROI}
                />
              </Card>

              <Card className="overflow-hidden">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
                  5-Year Projection
                </h3>
                <ProjectionChart netAnnualROI={calculation.netAnnualROI} />
              </Card>
            </div>

            {/* Calculation Breakdown */}
            <div className="mb-8">
              <CalculationBreakdown
                calculation={calculation}
                branchData={results.branchData}
              />
            </div>
          </>
        ) : (
          <div className="mb-8">
            <NoSavingsCard
              isAtMinimumStaff={calculation.isAtMinimumStaff}
              isUnderstaffed={calculation.isUnderstaffed}
            />

            {/* Show calculation anyway */}
            <div className="mt-6">
              <CalculationBreakdown
                calculation={calculation}
                branchData={results.branchData}
              />
            </div>
          </div>
        )}

        {/* Input Summary */}
        <Card className="mb-8">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Analysis Based On
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-gray-400">Monthly Transactions</p>
              <p className="font-mono text-lg font-bold text-gray-900">
                {formatNumber(results.branchData.monthlyTransactions)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Current Staff (FTEs)</p>
              <p className="font-mono text-lg font-bold text-gray-900">
                {results.branchData.currentFTEs}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Annual FTE Cost</p>
              <p className="font-mono text-lg font-bold text-gray-900">
                {formatCurrency(results.branchData.annualFTECost)}
              </p>
            </div>
          </div>
        </Card>

        {/* Download PDF CTA */}
        {!pdfDownloaded ? (
          <Card className="mb-8 border-brand-sky/30 bg-brand-sky/10">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy">
                  <svg className="h-5 w-5 text-brand-sky" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Download Your Report
                  </h3>
                  <p className="text-sm text-gray-600">
                    Get a PDF copy to share with your team or reference later
                  </p>
                </div>
              </div>
              <Button
                onClick={handleDownloadPDF}
                isLoading={pdfGenerating}
                disabled={pdfGenerating}
                className="w-full sm:w-auto"
              >
                {pdfGenerating ? 'Generating...' : 'Download PDF'}
              </Button>
            </div>
            {pdfError && (
              <p className="mt-3 text-sm text-red-500">{pdfError}</p>
            )}
          </Card>
        ) : (
          <Card className="mb-8 border-brand-lime/50 bg-brand-lime/10">
            <div className="flex items-center gap-3">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">Report Downloaded!</p>
                <p className="text-sm text-gray-600">
                  Check your downloads folder for the PDF
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPDF}
                disabled={pdfGenerating}
              >
                Download Again
              </Button>
            </div>
          </Card>
        )}

        {/* Ready to Start a Conversation CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl bg-brand-navy p-8 text-center text-white"
        >
          <h2 className="text-2xl font-bold">Ready to Start a Conversation?</h2>
          <p className="mt-2 text-white/70">
            Let&apos;s discuss how QDS can help implement TCR technology at your
            institution and achieve these savings.
          </p>
          <div className="mt-6">
            <a href={QDS_CONTACT_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" className="bg-white text-brand-navy hover:bg-gray-100">
                Contact Quality Data Systems
              </Button>
            </a>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-6">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-sm text-gray-500">
            Quality Data Systems - Serving financial institutions for 40+ years
          </p>
        </div>
      </footer>
    </div>
  );
}
