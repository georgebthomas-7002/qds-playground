import {
  TRANSACTIONS_PER_FTE_MONTHLY,
  ANNUAL_TCR_COST,
  TCR_CAPITAL_COST,
  MINIMUM_FTES,
  DEFAULT_FTE_ANNUAL_COST,
} from './constants';
import { BranchData, ROICalculation } from './types';

/**
 * Round down to nearest 0.5
 * Conservative rounding for FTE savings estimates
 */
export function roundDownToHalf(num: number): number {
  return Math.floor(num * 2) / 2;
}

/**
 * Calculate the optimal number of FTEs based on transaction volume
 */
export function calculateRecommendedFTEs(monthlyTransactions: number): number {
  const rawFTEs = monthlyTransactions / TRANSACTIONS_PER_FTE_MONTHLY;
  // Apply minimum FTE rule
  return Math.max(rawFTEs, MINIMUM_FTES);
}

/**
 * Calculate FTE savings with conservative rounding
 */
export function calculateFTESavings(
  currentFTEs: number,
  recommendedFTEs: number
): number {
  const rawSavings = currentFTEs - recommendedFTEs;

  // Cannot have negative savings
  if (rawSavings <= 0) {
    return 0;
  }

  // Apply conservative rounding (floor to 0.5)
  return roundDownToHalf(rawSavings);
}

/**
 * Calculate annual labor savings
 */
export function calculateAnnualLaborSavings(
  fteSavings: number,
  annualFTECost: number
): number {
  return fteSavings * annualFTECost;
}

/**
 * Calculate net annual ROI (savings minus TCR cost)
 */
export function calculateNetAnnualROI(annualLaborSavings: number): number {
  return annualLaborSavings - ANNUAL_TCR_COST;
}

/**
 * Calculate payback period in months
 */
export function calculatePaybackPeriod(netAnnualROI: number): number {
  if (netAnnualROI <= 0) {
    return Infinity;
  }

  const monthlyROI = netAnnualROI / 12;
  return Math.ceil(TCR_CAPITAL_COST / monthlyROI);
}

/**
 * Calculate 5-year ROI projection
 */
export function calculateFiveYearROI(netAnnualROI: number): number {
  // First year includes capital cost
  const firstYearROI = netAnnualROI - TCR_CAPITAL_COST;
  // Years 2-5 are pure net savings
  const subsequentYearsROI = netAnnualROI * 4;

  return firstYearROI + subsequentYearsROI;
}

/**
 * Main ROI calculation function
 * Takes branch data and returns comprehensive ROI analysis
 */
export function calculateROI(branchData: BranchData): ROICalculation {
  const { monthlyTransactions, currentFTEs, annualFTECost } = branchData;

  // Use provided cost or default
  const effectiveFTECost = annualFTECost || DEFAULT_FTE_ANNUAL_COST;

  // Step 1: Calculate recommended FTEs based on transaction volume
  const recommendedFTEs = calculateRecommendedFTEs(monthlyTransactions);

  // Step 2: Calculate FTE savings with conservative rounding
  const fteSavings = calculateFTESavings(currentFTEs, recommendedFTEs);

  // Step 3: Calculate annual labor savings (gross, before TCR costs)
  const annualLaborSavings = calculateAnnualLaborSavings(
    fteSavings,
    effectiveFTECost
  );

  // Step 4: Calculate net annual ROI
  const netAnnualROI = calculateNetAnnualROI(annualLaborSavings);

  // Step 5: Calculate monthly ROI
  const monthlyROI = netAnnualROI / 12;

  // Step 6: Calculate payback period
  const paybackPeriodMonths = calculatePaybackPeriod(netAnnualROI);

  // Step 7: Calculate 5-year ROI
  const fiveYearROI = calculateFiveYearROI(netAnnualROI);

  // Step 8: Calculate enhanced metrics
  // ROI percentage (annual net savings / total annual investment)
  const totalAnnualInvestment = ANNUAL_TCR_COST;
  const roiPercentage = totalAnnualInvestment > 0
    ? (netAnnualROI / totalAnnualInvestment) * 100
    : 0;

  // First year net savings (includes one-time capital cost)
  const firstYearNetSavings = netAnnualROI - TCR_CAPITAL_COST;

  // Total 5-year investment (capital + 5 years of operating)
  const totalFiveYearInvestment = TCR_CAPITAL_COST + (ANNUAL_TCR_COST * 5);

  // Efficiency gain: transactions per staff improvement
  // Current: monthlyTransactions / currentFTEs
  // With TCR: monthlyTransactions / recommendedFTEs (which equals TRANSACTIONS_PER_FTE_MONTHLY)
  const currentTransPerFTE = currentFTEs > 0 ? monthlyTransactions / currentFTEs : 0;
  const efficiencyGainPercent = currentTransPerFTE > 0
    ? ((TRANSACTIONS_PER_FTE_MONTHLY - currentTransPerFTE) / currentTransPerFTE) * 100
    : 0;

  // Determine edge case flags
  const hasPositiveROI = netAnnualROI > 0;
  const isAtMinimumStaff = currentFTEs <= MINIMUM_FTES;
  const isUnderstaffed = recommendedFTEs > currentFTEs;

  return {
    recommendedFTEs,
    fteSavings,
    annualLaborSavings,
    annualTCRCost: ANNUAL_TCR_COST,
    netAnnualROI,
    monthlyROI,
    paybackPeriodMonths,
    fiveYearROI,
    roiPercentage,
    firstYearNetSavings,
    totalFiveYearInvestment,
    efficiencyGainPercent,
    hasPositiveROI,
    isAtMinimumStaff,
    isUnderstaffed,
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format FTE count (show .5 increments properly)
 */
export function formatFTE(num: number): string {
  if (Number.isInteger(num)) {
    return num.toString();
  }
  return num.toFixed(1);
}

/**
 * Format percentage
 */
export function formatPercentage(num: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(num / 100);
}
