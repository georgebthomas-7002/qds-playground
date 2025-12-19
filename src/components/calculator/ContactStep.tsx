'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useCalculator } from '@/hooks/useCalculator';
import { Button, Input, Card } from '@/components/ui';
import { contactSchema } from '@/lib/validations';
import { trackEvent } from '@/lib/utils';

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
}

export function ContactStep() {
  const router = useRouter();
  const {
    contactInfo,
    updateContactInfo,
    prevStep,
    results,
    branchData,
    isSubmitting,
    setIsSubmitting,
  } = useCalculator();
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = contactSchema.safeParse(contactInfo);

    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      // Submit to HubSpot Forms API
      const response = await fetch('/api/hubspot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: contactInfo.firstName,
          lastName: contactInfo.lastName,
          email: contactInfo.email,
          phone: contactInfo.phone,
          company: branchData.institutionName,
          branchName: branchData.branchName,
          monthlyTransactions: branchData.monthlyTransactions,
          currentFTEs: branchData.currentFTEs,
          estimatedROI: results?.calculation.netAnnualROI || 0,
          painPoints: branchData.painPoints || [],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      trackEvent('hubspot_submitted', {
        hasPositiveROI: results?.calculation.hasPositiveROI || false,
      });

      // Navigate to results page
      router.push('/results');
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError('There was an error submitting your information. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    trackEvent('contact_skipped');
    router.push('/results');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mx-auto max-w-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Get Your Personalized Report
          </h2>
          <p className="mt-2 text-gray-500">
            Enter your contact information to receive a detailed ROI report and
            have a QDS specialist review your results.
          </p>
        </div>

        {/* ROI Preview */}
        {results?.calculation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 rounded-xl bg-gradient-to-br from-brand-navy to-brand-navy-dark p-6 text-white"
          >
            <p className="text-sm font-medium text-white/70">
              Your Estimated Annual ROI
            </p>
            <p className="mt-1 font-mono text-3xl font-bold">
              {results.calculation.hasPositiveROI ? (
                `$${results.calculation.netAnnualROI.toLocaleString()}`
              ) : (
                <span className="text-xl">Limited savings identified</span>
              )}
            </p>
            {results.calculation.hasPositiveROI && (
              <p className="mt-2 text-sm text-white/70">
                Based on {results.calculation.fteSavings} FTE optimization
              </p>
            )}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First Name"
              name="firstName"
              placeholder="John"
              value={contactInfo.firstName || ''}
              onChange={(e) => {
                updateContactInfo({ firstName: e.target.value });
                setErrors((prev) => ({ ...prev, firstName: undefined }));
              }}
              error={errors.firstName}
              required
            />
            <Input
              label="Last Name"
              name="lastName"
              placeholder="Smith"
              value={contactInfo.lastName || ''}
              onChange={(e) => {
                updateContactInfo({ lastName: e.target.value });
                setErrors((prev) => ({ ...prev, lastName: undefined }));
              }}
              error={errors.lastName}
              required
            />
          </div>

          <Input
            label="Work Email"
            name="email"
            type="email"
            placeholder="john.smith@bank.com"
            value={contactInfo.email || ''}
            onChange={(e) => {
              updateContactInfo({ email: e.target.value });
              setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            error={errors.email}
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={contactInfo.phone || ''}
              onChange={(e) => {
                updateContactInfo({ phone: e.target.value });
                setErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              error={errors.phone}
            />
            <Input
              label="Job Title"
              name="jobTitle"
              placeholder="Branch Manager"
              value={contactInfo.jobTitle || ''}
              onChange={(e) => {
                updateContactInfo({ jobTitle: e.target.value });
              }}
            />
          </div>

          {submitError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {submitError}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-between">
            <Button type="button" variant="ghost" onClick={prevStep}>
              <ArrowLeftIcon />
              Back
            </Button>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleSkip}>
                Skip for Now
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Get My Report'}
              </Button>
            </div>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          By submitting, you agree to receive communications from QDS.
          We respect your privacy and will never share your information.
        </p>
      </Card>
    </motion.div>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}
