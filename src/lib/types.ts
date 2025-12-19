// Calculator Input Types
export interface BranchData {
  institutionName: string;
  branchName: string;
  monthlyTransactions: number;
  currentFTEs: number;
  annualFTECost: number;
  painPoints: string[];
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
}

// Calculation Result Types
export interface ROICalculation {
  // Staffing Analysis
  recommendedFTEs: number;
  fteSavings: number;

  // Financial Metrics
  annualLaborSavings: number;
  annualTCRCost: number;
  netAnnualROI: number;

  // Additional Insights
  monthlyROI: number;
  paybackPeriodMonths: number;
  fiveYearROI: number;

  // Flags
  hasPositiveROI: boolean;
  isAtMinimumStaff: boolean;
  isUnderstaffed: boolean;
}

export interface CalculatorResults {
  branchData: BranchData;
  calculation: ROICalculation;
  timestamp: Date;
}

// Pain Points
export interface PainPoint {
  id: string;
  label: string;
  description: string;
  icon?: string;
}

// Calculator Step Types
export type CalculatorStep =
  | 'institution'
  | 'branch'
  | 'pain-points'
  | 'contact'
  | 'results';

// Form Validation
export interface ValidationError {
  field: string;
  message: string;
}

// API Types
export interface SendReportRequest {
  email: string;
  results: CalculatorResults;
  contactInfo: ContactInfo;
}

export interface HubSpotSubmission {
  portalId: string;
  formGuid: string;
  fields: HubSpotField[];
  context: HubSpotContext;
}

export interface HubSpotField {
  objectTypeId: string;
  name: string;
  value: string;
}

export interface HubSpotContext {
  pageUri: string;
  pageName: string;
}

// Analytics Events
export type AnalyticsEvent =
  | 'calculator_started'
  | 'step_completed'
  | 'calculation_complete'
  | 'results_viewed'
  | 'email_submitted'
  | 'report_downloaded'
  | 'hubspot_submitted';

export interface AnalyticsPayload {
  event: AnalyticsEvent;
  properties?: Record<string, string | number | boolean>;
}
