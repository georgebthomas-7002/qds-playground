import { PainPoint } from './types';

// ============================================
// CORE CALCULATION CONSTANTS
// ============================================

/**
 * Number of transactions a single FTE can process monthly
 * with TCR (Teller Cash Recycler) assistance
 */
export const TRANSACTIONS_PER_FTE_MONTHLY = 2250;

/**
 * Default annual cost per FTE (salary + benefits)
 * Based on industry average for teller positions
 */
export const DEFAULT_FTE_ANNUAL_COST = 42000;

/**
 * Annual TCR operating cost
 * Includes maintenance, service contracts, and supplies
 */
export const ANNUAL_TCR_COST = 12000;

/**
 * Capital cost to purchase a TCR unit
 */
export const TCR_CAPITAL_COST = 30000;

/**
 * Minimum FTEs required for branch operations
 * Compliance and operational requirement
 */
export const MINIMUM_FTES = 3;

// ============================================
// PAIN POINTS
// ============================================

export const PAIN_POINTS: PainPoint[] = [
  {
    id: 'cash_handling_errors',
    label: 'Cash Handling Errors',
    description: 'Frequent discrepancies in cash drawers and vault balancing',
  },
  {
    id: 'long_wait_times',
    label: 'Long Customer Wait Times',
    description: 'Customers waiting too long during peak hours',
  },
  {
    id: 'manual_counting',
    label: 'Time-Consuming Manual Counting',
    description: 'Staff spending excessive time on manual cash counting',
  },
  {
    id: 'vault_management',
    label: 'Vault Management Overhead',
    description: 'Complex and time-consuming vault operations',
  },
  {
    id: 'staffing_constraints',
    label: 'Staffing Constraints',
    description: 'Difficulty maintaining adequate staffing levels',
  },
  {
    id: 'audit_compliance',
    label: 'Audit & Compliance Burden',
    description: 'Heavy documentation and compliance requirements',
  },
  {
    id: 'cash_ordering',
    label: 'Cash Ordering Inefficiency',
    description: 'Suboptimal cash ordering and inventory management',
  },
  {
    id: 'employee_training',
    label: 'Training New Employees',
    description: 'Extended onboarding time for cash handling procedures',
  },
];

// ============================================
// PAIN POINT SOLUTIONS - How TCR addresses each
// ============================================

export const PAIN_POINT_SOLUTIONS: Record<string, {
  solution: string;
  benefit: string;
  stat?: string;
}> = {
  cash_handling_errors: {
    solution: 'Automated counting with counterfeit detection',
    benefit: 'Eliminates human counting errors and catches counterfeit bills instantly',
    stat: 'Up to 99.9% accuracy',
  },
  long_wait_times: {
    solution: 'Faster transaction processing',
    benefit: 'Cash transactions complete in seconds, not minutes',
    stat: 'Up to 40% faster service',
  },
  manual_counting: {
    solution: 'Instant automated counting and validation',
    benefit: 'Staff focus on customers, not counting cash',
    stat: 'Saves 15+ minutes per shift',
  },
  vault_management: {
    solution: 'Integrated cash management system',
    benefit: 'Real-time visibility into cash positions across all units',
    stat: 'Reduce vault trips by 70%',
  },
  staffing_constraints: {
    solution: 'Higher transaction capacity per teller',
    benefit: 'Handle more volume with optimized staffing levels',
    stat: 'Up to 2,250 transactions/FTE/month',
  },
  audit_compliance: {
    solution: 'Complete transaction audit trail',
    benefit: 'Automatic documentation for every cash movement',
    stat: '100% transaction traceability',
  },
  cash_ordering: {
    solution: 'Predictive cash forecasting',
    benefit: 'Optimize cash on hand, reduce armored car visits',
    stat: 'Lower cash carrying costs',
  },
  employee_training: {
    solution: 'Intuitive touchscreen interface',
    benefit: 'New staff productive in hours, not weeks',
    stat: 'Reduce training time by 50%',
  },
};

// ============================================
// INDUSTRY BENCHMARKS & INSIGHTS
// ============================================

export const INDUSTRY_INSIGHTS = {
  averageTellerSalary: 42000,
  averageTransactionsPerTeller: 1800, // Without TCR
  tcrTransactionsPerTeller: 2250, // With TCR
  averageErrorRate: 0.5, // 0.5% error rate without TCR
  tcrErrorRate: 0.01, // 0.01% with TCR
  averageTransactionTime: 180, // seconds without TCR
  tcrTransactionTime: 90, // seconds with TCR
  branchesUsingTCR: 65, // percentage
  customerSatisfactionIncrease: 23, // percentage points
};

// ============================================
// FORM VALIDATION
// ============================================

export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  invalidEmail: 'Please enter a valid email address',
  invalidPhone: 'Please enter a valid phone number',
  minTransactions: 'Please enter a positive number',
  minFTEs: 'Please enter the number of current staff',
  minCost: 'Please enter a valid annual cost',
} as const;

// ============================================
// UI CONSTANTS
// ============================================

export const CALCULATOR_STEPS = [
  { id: 'institution', label: 'Institution', description: 'Basic information' },
  { id: 'branch', label: 'Branch Details', description: 'Transaction data' },
  { id: 'pain-points', label: 'Challenges', description: 'Current pain points' },
  { id: 'contact', label: 'Contact', description: 'Get your results' },
] as const;

// ============================================
// API ENDPOINTS
// ============================================

export const API_ENDPOINTS = {
  sendReport: '/api/send-report',
  hubspot: '/api/hubspot',
} as const;

// ============================================
// EXTERNAL URLS
// ============================================

export const QDS_LOGO_URL =
  'https://www-qualitydatasystems-com.sandbox.hs-sites.com/hs-fs/hubfs/new-no%20shadow-1.png?width=80&height=80&name=new-no%20shadow-1.png';

export const QDS_CONTACT_URL = 'https://www.qualitydatasystems.com/contact-us';

// ============================================
// ANALYTICS
// ============================================

export const ANALYTICS_EVENTS = {
  CALCULATOR_STARTED: 'calculator_started',
  STEP_COMPLETED: 'step_completed',
  CALCULATION_COMPLETE: 'calculation_complete',
  RESULTS_VIEWED: 'results_viewed',
  EMAIL_SUBMITTED: 'email_submitted',
  REPORT_DOWNLOADED: 'report_downloaded',
  HUBSPOT_SUBMITTED: 'hubspot_submitted',
} as const;
