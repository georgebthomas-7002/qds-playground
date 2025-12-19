import { describe, it, expect } from 'vitest';
import {
  roundDownToHalf,
  calculateRecommendedFTEs,
  calculateFTESavings,
  calculateAnnualLaborSavings,
  calculateNetAnnualROI,
  calculatePaybackPeriod,
  calculateFiveYearROI,
  calculateROI,
  formatCurrency,
  formatNumber,
  formatFTE,
} from '../calculations';
import {
  TRANSACTIONS_PER_FTE_MONTHLY,
  ANNUAL_TCR_COST,
  TCR_CAPITAL_COST,
  MINIMUM_FTES,
} from '../constants';

describe('roundDownToHalf', () => {
  it('should round 1.7 down to 1.5', () => {
    expect(roundDownToHalf(1.7)).toBe(1.5);
  });

  it('should round 2.3 down to 2.0', () => {
    expect(roundDownToHalf(2.3)).toBe(2);
  });

  it('should keep 1.5 as 1.5', () => {
    expect(roundDownToHalf(1.5)).toBe(1.5);
  });

  it('should round 0.4 down to 0', () => {
    expect(roundDownToHalf(0.4)).toBe(0);
  });
});

describe('calculateRecommendedFTEs', () => {
  it('should calculate FTEs based on transaction volume', () => {
    const transactions = 4500; // 2x the capacity = 2 FTEs
    const result = calculateRecommendedFTEs(transactions);
    expect(result).toBe(MINIMUM_FTES); // Should be minimum (3) since 2 < 3
  });

  it('should return minimum FTEs when calculation is below minimum', () => {
    const transactions = 1000;
    const result = calculateRecommendedFTEs(transactions);
    expect(result).toBe(MINIMUM_FTES);
  });

  it('should return calculated value when above minimum', () => {
    const transactions = 11250; // 5 FTEs worth
    const result = calculateRecommendedFTEs(transactions);
    expect(result).toBe(5);
  });
});

describe('calculateFTESavings', () => {
  it('should calculate positive savings correctly', () => {
    const current = 6;
    const recommended = 4;
    const result = calculateFTESavings(current, recommended);
    expect(result).toBe(2);
  });

  it('should return 0 for negative savings', () => {
    const current = 3;
    const recommended = 5;
    const result = calculateFTESavings(current, recommended);
    expect(result).toBe(0);
  });

  it('should apply conservative rounding', () => {
    const current = 5.7;
    const recommended = 4;
    const result = calculateFTESavings(current, recommended);
    expect(result).toBe(1.5); // 1.7 rounded down to 1.5
  });
});

describe('calculateAnnualLaborSavings', () => {
  it('should calculate savings correctly', () => {
    const fteSavings = 2;
    const annualCost = 42000;
    const result = calculateAnnualLaborSavings(fteSavings, annualCost);
    expect(result).toBe(84000);
  });

  it('should return 0 for zero FTE savings', () => {
    const result = calculateAnnualLaborSavings(0, 42000);
    expect(result).toBe(0);
  });
});

describe('calculateNetAnnualROI', () => {
  it('should subtract TCR cost from labor savings', () => {
    const laborSavings = 84000;
    const result = calculateNetAnnualROI(laborSavings);
    expect(result).toBe(laborSavings - ANNUAL_TCR_COST);
  });

  it('should return negative when savings less than TCR cost', () => {
    const laborSavings = 5000;
    const result = calculateNetAnnualROI(laborSavings);
    expect(result).toBeLessThan(0);
  });
});

describe('calculatePaybackPeriod', () => {
  it('should calculate payback period in months', () => {
    const netAnnualROI = 72000; // $6000/month
    const result = calculatePaybackPeriod(netAnnualROI);
    expect(result).toBe(Math.ceil(TCR_CAPITAL_COST / 6000));
  });

  it('should return Infinity for zero or negative ROI', () => {
    expect(calculatePaybackPeriod(0)).toBe(Infinity);
    expect(calculatePaybackPeriod(-1000)).toBe(Infinity);
  });
});

describe('calculateFiveYearROI', () => {
  it('should include capital cost in first year only', () => {
    const netAnnualROI = 50000;
    const result = calculateFiveYearROI(netAnnualROI);
    const expected = (netAnnualROI - TCR_CAPITAL_COST) + (netAnnualROI * 4);
    expect(result).toBe(expected);
  });
});

describe('calculateROI - Full Integration', () => {
  it('should calculate complete ROI for typical branch', () => {
    const branchData = {
      institutionName: 'Test Bank',
      branchName: 'Main Branch',
      monthlyTransactions: 15000,
      currentFTEs: 8,
      annualFTECost: 42000,
      painPoints: [],
    };

    const result = calculateROI(branchData);

    // 15000 / 2250 = 6.67 FTEs recommended
    expect(result.recommendedFTEs).toBeCloseTo(6.67, 1);

    // 8 - 6.67 = 1.33, rounded down to 1.0 FTE savings
    expect(result.fteSavings).toBe(1);

    // 1 * 42000 = 42000 annual savings
    expect(result.annualLaborSavings).toBe(42000);

    // 42000 - 12000 = 30000 net ROI
    expect(result.netAnnualROI).toBe(30000);

    expect(result.hasPositiveROI).toBe(true);
    expect(result.isAtMinimumStaff).toBe(false);
    expect(result.isUnderstaffed).toBe(false);
  });

  it('should handle minimum staffing scenario', () => {
    const branchData = {
      institutionName: 'Test Bank',
      branchName: 'Small Branch',
      monthlyTransactions: 5000,
      currentFTEs: 3,
      annualFTECost: 42000,
      painPoints: [],
    };

    const result = calculateROI(branchData);

    expect(result.fteSavings).toBe(0);
    expect(result.isAtMinimumStaff).toBe(true);
    expect(result.hasPositiveROI).toBe(false);
  });

  it('should handle understaffed scenario', () => {
    const branchData = {
      institutionName: 'Test Bank',
      branchName: 'Busy Branch',
      monthlyTransactions: 20000,
      currentFTEs: 5,
      annualFTECost: 42000,
      painPoints: [],
    };

    const result = calculateROI(branchData);

    // 20000 / 2250 = 8.89 FTEs needed, but only 5 current
    expect(result.isUnderstaffed).toBe(true);
    expect(result.fteSavings).toBe(0);
  });
});

describe('Formatting Functions', () => {
  it('formatCurrency should format correctly', () => {
    expect(formatCurrency(42000)).toBe('$42,000');
    expect(formatCurrency(1234567)).toBe('$1,234,567');
  });

  it('formatNumber should add commas', () => {
    expect(formatNumber(15000)).toBe('15,000');
  });

  it('formatFTE should handle decimals', () => {
    expect(formatFTE(5)).toBe('5');
    expect(formatFTE(5.5)).toBe('5.5');
  });
});
