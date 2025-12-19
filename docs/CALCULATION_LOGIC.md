# TCR ROI Calculation Logic

This document explains the business logic and formulas used to calculate the return on investment (ROI) for implementing Teller Cash Recyclers (TCRs) at a financial institution branch.

## Core Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `TRANSACTIONS_PER_FTE_MONTHLY` | 2,250 | Number of transactions a single FTE can process monthly with TCR assistance |
| `DEFAULT_FTE_ANNUAL_COST` | $42,000 | Default annual cost per FTE (salary + benefits) |
| `ANNUAL_TCR_COST` | $12,000 | Annual TCR operating cost (maintenance, service, supplies) |
| `TCR_CAPITAL_COST` | $30,000 | One-time capital cost to purchase a TCR unit |
| `MINIMUM_FTES` | 3 | Minimum FTEs required for branch operations |

## Calculation Steps

### Step 1: Calculate Recommended FTEs

Based on the monthly transaction volume, determine the optimal number of FTEs:

```
recommendedFTEs = monthlyTransactions / TRANSACTIONS_PER_FTE_MONTHLY
```

Apply minimum FTE rule:

```
if (recommendedFTEs < MINIMUM_FTES) {
  recommendedFTEs = MINIMUM_FTES
}
```

### Step 2: Calculate FTE Savings

Compare current staffing to recommended staffing:

```
rawSavings = currentFTEs - recommendedFTEs
```

Apply conservative rounding (floor to nearest 0.5):

```
fteSavings = floor(rawSavings * 2) / 2
```

Ensure non-negative:

```
if (fteSavings < 0) {
  fteSavings = 0
}
```

### Step 3: Calculate Annual Labor Savings

```
annualLaborSavings = fteSavings × annualFTECost
```

### Step 4: Calculate Net Annual ROI

```
netAnnualROI = annualLaborSavings - ANNUAL_TCR_COST
```

### Step 5: Calculate Monthly ROI

```
monthlyROI = netAnnualROI / 12
```

### Step 6: Calculate Payback Period

```
monthlyROI = netAnnualROI / 12
paybackPeriodMonths = ceil(TCR_CAPITAL_COST / monthlyROI)
```

### Step 7: Calculate 5-Year ROI

```
firstYearROI = netAnnualROI - TCR_CAPITAL_COST
subsequentYearsROI = netAnnualROI × 4
fiveYearROI = firstYearROI + subsequentYearsROI
```

## Edge Cases

### At Minimum Staffing

When `currentFTEs <= MINIMUM_FTES`:
- `isAtMinimumStaff = true`
- `fteSavings = 0` (cannot reduce below minimum)
- Show alternative value propositions

### Understaffed Branch

When `recommendedFTEs > currentFTEs`:
- `isUnderstaffed = true`
- `fteSavings = 0`
- Highlight efficiency benefits without headcount reduction

### No Positive ROI

When `netAnnualROI <= 0`:
- `hasPositiveROI = false`
- Show qualitative benefits (error reduction, speed, security)

## Example Calculation

**Inputs:**
- Monthly Transactions: 15,000
- Current FTEs: 8
- Annual FTE Cost: $42,000

**Calculation:**

1. Recommended FTEs: 15,000 ÷ 2,250 = 6.67 FTEs
2. Raw Savings: 8 - 6.67 = 1.33 FTEs
3. Conservative Savings: floor(1.33 × 2) / 2 = 1.0 FTE
4. Annual Labor Savings: 1.0 × $42,000 = $42,000
5. Net Annual ROI: $42,000 - $12,000 = $30,000
6. Monthly ROI: $30,000 ÷ 12 = $2,500
7. Payback Period: ceil($30,000 ÷ $2,500) = 12 months
8. 5-Year ROI: ($30,000 - $30,000) + ($30,000 × 4) = $120,000

## Conservative Rounding Rationale

We use conservative rounding (floor to 0.5) because:

1. **Realistic expectations** - Actual savings may be less than theoretical
2. **Operational buffer** - Branches need flexibility for peak times
3. **Cross-training needs** - Staff handle multiple roles
4. **Customer service** - Maintain service quality during transitions

## Questions for QDS

1. Is 2,250 transactions/month the manual or TCR-assisted capacity?
2. Should we support multiple TCR units for high-volume branches?
3. What's the exact annual TCR cost breakdown (maintenance vs. supplies)?
4. Are there volume-based pricing tiers for TCR costs?
