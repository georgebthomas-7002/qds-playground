import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  BranchData,
  ContactInfo,
  CalculatorResults,
  ROICalculation,
  CalculatorStep,
} from '@/lib/types';
import { calculateROI } from '@/lib/calculations';
import { DEFAULT_FTE_ANNUAL_COST } from '@/lib/constants';
import { trackEvent } from '@/lib/utils';

interface CalculatorState {
  // Current step
  currentStep: CalculatorStep;

  // Form data
  branchData: Partial<BranchData>;
  contactInfo: Partial<ContactInfo>;

  // Results
  calculation: ROICalculation | null;
  results: CalculatorResults | null;

  // UI state
  isCalculating: boolean;
  isSubmitting: boolean;
  hasViewedResults: boolean;

  // Actions
  setCurrentStep: (step: CalculatorStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  updateBranchData: (data: Partial<BranchData>) => void;
  updateContactInfo: (data: Partial<ContactInfo>) => void;

  performCalculation: () => void;
  setResults: (results: CalculatorResults) => void;

  setIsSubmitting: (value: boolean) => void;
  markResultsViewed: () => void;

  reset: () => void;
}

const STEP_ORDER: CalculatorStep[] = [
  'institution',
  'branch',
  'pain-points',
  'contact',
  'results',
];

const initialBranchData: Partial<BranchData> = {
  institutionName: '',
  institutionWebsite: '',
  branchName: '',
  monthlyTransactions: undefined,
  currentFTEs: undefined,
  annualFTECost: DEFAULT_FTE_ANNUAL_COST,
  painPoints: [],
};

const initialContactInfo: Partial<ContactInfo> = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  jobTitle: '',
};

export const useCalculator = create<CalculatorState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: 'institution',
      branchData: { ...initialBranchData },
      contactInfo: { ...initialContactInfo },
      calculation: null,
      results: null,
      isCalculating: false,
      isSubmitting: false,
      hasViewedResults: false,

      // Step navigation
      setCurrentStep: (step) => {
        set({ currentStep: step });
        trackEvent('step_changed', { step });
      },

      nextStep: () => {
        const { currentStep } = get();
        const currentIndex = STEP_ORDER.indexOf(currentStep);

        if (currentIndex < STEP_ORDER.length - 1) {
          const nextStep = STEP_ORDER[currentIndex + 1];
          set({ currentStep: nextStep });
          trackEvent('step_completed', { from: currentStep, to: nextStep });
        }
      },

      prevStep: () => {
        const { currentStep } = get();
        const currentIndex = STEP_ORDER.indexOf(currentStep);

        if (currentIndex > 0) {
          const prevStep = STEP_ORDER[currentIndex - 1];
          set({ currentStep: prevStep });
        }
      },

      // Data updates
      updateBranchData: (data) => {
        set((state) => ({
          branchData: { ...state.branchData, ...data },
        }));
      },

      updateContactInfo: (data) => {
        set((state) => ({
          contactInfo: { ...state.contactInfo, ...data },
        }));
      },

      // Calculation
      performCalculation: () => {
        const { branchData } = get();

        set({ isCalculating: true });

        // Ensure we have complete data
        const completeBranchData: BranchData = {
          institutionName: branchData.institutionName || '',
          branchName: branchData.branchName || '',
          monthlyTransactions: branchData.monthlyTransactions || 0,
          currentFTEs: branchData.currentFTEs || 0,
          annualFTECost: branchData.annualFTECost || DEFAULT_FTE_ANNUAL_COST,
          painPoints: branchData.painPoints || [],
        };

        const calculation = calculateROI(completeBranchData);

        const results: CalculatorResults = {
          branchData: completeBranchData,
          calculation,
          timestamp: new Date(),
        };

        set({
          calculation,
          results,
          isCalculating: false,
        });

        trackEvent('calculation_complete', {
          hasPositiveROI: calculation.hasPositiveROI,
          fteSavings: calculation.fteSavings,
          netAnnualROI: calculation.netAnnualROI,
        });
      },

      setResults: (results) => {
        set({ results, calculation: results.calculation });
      },

      setIsSubmitting: (value) => {
        set({ isSubmitting: value });
      },

      markResultsViewed: () => {
        set({ hasViewedResults: true });
        trackEvent('results_viewed');
      },

      // Reset
      reset: () => {
        set({
          currentStep: 'institution',
          branchData: { ...initialBranchData },
          contactInfo: { ...initialContactInfo },
          calculation: null,
          results: null,
          isCalculating: false,
          isSubmitting: false,
          hasViewedResults: false,
        });
        trackEvent('calculator_reset');
      },
    }),
    {
      name: 'qds-calculator-storage',
      // Use sessionStorage instead of localStorage
      // This ensures data is cleared when the browser/tab is closed
      // so returning visitors always start fresh
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        branchData: state.branchData,
        contactInfo: state.contactInfo,
        currentStep: state.currentStep,
      }),
    }
  )
);

// Selector hooks for optimized re-renders
export const useCurrentStep = () => useCalculator((state) => state.currentStep);
export const useBranchData = () => useCalculator((state) => state.branchData);
export const useContactInfo = () => useCalculator((state) => state.contactInfo);
export const useCalculation = () => useCalculator((state) => state.calculation);
export const useResults = () => useCalculator((state) => state.results);
export const useIsCalculating = () =>
  useCalculator((state) => state.isCalculating);
export const useIsSubmitting = () =>
  useCalculator((state) => state.isSubmitting);
