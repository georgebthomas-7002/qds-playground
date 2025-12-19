import { z } from 'zod';
import { VALIDATION_MESSAGES } from './constants';

/**
 * Institution Step Schema
 */
export const institutionSchema = z.object({
  institutionName: z
    .string()
    .min(1, VALIDATION_MESSAGES.required)
    .max(100, 'Institution name is too long'),
});

/**
 * Branch Details Schema
 */
export const branchSchema = z.object({
  branchName: z
    .string()
    .min(1, VALIDATION_MESSAGES.required)
    .max(100, 'Branch name is too long'),
  monthlyTransactions: z
    .number({
      required_error: VALIDATION_MESSAGES.required,
      invalid_type_error: VALIDATION_MESSAGES.minTransactions,
    })
    .positive(VALIDATION_MESSAGES.minTransactions),
  currentFTEs: z
    .number({
      required_error: VALIDATION_MESSAGES.required,
      invalid_type_error: VALIDATION_MESSAGES.minFTEs,
    })
    .positive(VALIDATION_MESSAGES.minFTEs),
  annualFTECost: z
    .number({
      invalid_type_error: VALIDATION_MESSAGES.minCost,
    })
    .positive(VALIDATION_MESSAGES.minCost)
    .optional(),
});

/**
 * Pain Points Schema
 */
export const painPointsSchema = z.object({
  painPoints: z.array(z.string()).min(0),
});

/**
 * Contact Info Schema
 */
export const contactSchema = z.object({
  firstName: z
    .string()
    .min(1, VALIDATION_MESSAGES.required)
    .max(50, 'First name is too long'),
  lastName: z
    .string()
    .min(1, VALIDATION_MESSAGES.required)
    .max(50, 'Last name is too long'),
  email: z
    .string()
    .min(1, VALIDATION_MESSAGES.required)
    .email(VALIDATION_MESSAGES.invalidEmail),
  phone: z
    .string()
    .regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, {
      message: VALIDATION_MESSAGES.invalidPhone,
    })
    .optional()
    .or(z.literal('')),
  jobTitle: z.string().max(100, 'Job title is too long').optional(),
});

/**
 * Complete Branch Data Schema
 */
export const branchDataSchema = z.object({
  institutionName: z.string().min(1),
  branchName: z.string().min(1),
  monthlyTransactions: z.number().positive(),
  currentFTEs: z.number().positive(),
  annualFTECost: z.number().positive(),
  painPoints: z.array(z.string()),
});

/**
 * Send Report API Schema (supports multiple emails)
 */
export const sendReportSchema = z.object({
  emails: z.array(z.string().email()).min(1, 'At least one email required'),
  results: z.object({
    branchData: branchDataSchema,
    calculation: z.object({
      recommendedFTEs: z.number(),
      fteSavings: z.number(),
      annualLaborSavings: z.number(),
      annualTCRCost: z.number(),
      netAnnualROI: z.number(),
      monthlyROI: z.number(),
      paybackPeriodMonths: z.number(),
      fiveYearROI: z.number(),
      hasPositiveROI: z.boolean(),
      isAtMinimumStaff: z.boolean(),
      isUnderstaffed: z.boolean(),
    }),
    timestamp: z.string().or(z.date()),
  }),
  contactInfo: contactSchema,
  painPoints: z.array(z.string()).optional(),
});

/**
 * HubSpot Form Submission Schema
 * Includes all branch info, ROI results, and pain points
 */
export const hubspotSubmissionSchema = z.object({
  // Contact Info
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  company: z.string(),

  // Branch Information
  branchName: z.string(),
  monthlyTransactions: z.number(),
  currentFTEs: z.number(),
  annualFTECost: z.number(),

  // ROI Results
  estimatedROI: z.number(),
  fiveYearROI: z.number(),
  fteSavings: z.number(),
  paybackPeriodMonths: z.number(),
  hasPositiveROI: z.boolean(),

  // Pain Points
  painPoints: z.array(z.string()),
});

// Export types inferred from schemas
export type InstitutionFormData = z.infer<typeof institutionSchema>;
export type BranchFormData = z.infer<typeof branchSchema>;
export type PainPointsFormData = z.infer<typeof painPointsSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type SendReportData = z.infer<typeof sendReportSchema>;
export type HubSpotSubmissionData = z.infer<typeof hubspotSubmissionSchema>;
