# QDS TCR ROI Calculator

A premium ROI calculator experience for Quality Data Systems (QDS), helping financial institutions evaluate the potential return on investment from implementing Teller Cash Recyclers (TCRs) in their branches.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Email:** Resend API
- **CRM:** HubSpot Forms API
- **Validation:** Zod

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

```env
# Email (Resend)
RESEND_API_KEY=re_...

# HubSpot Forms API
HUBSPOT_PORTAL_ID=...
HUBSPOT_FORM_GUID=...

# Optional: HubSpot CRM API
HUBSPOT_ACCESS_TOKEN=pat-na1-...

# App
NEXT_PUBLIC_APP_URL=https://roi.qdsdata.com
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── hubspot/       # HubSpot Forms API
│   │   └── send-report/   # Resend Email API
│   ├── calculator/        # Multi-step calculator
│   ├── results/           # Results dashboard
│   └── page.tsx           # Landing page
├── components/
│   ├── calculator/        # Calculator step components
│   ├── results/           # Results visualization
│   └── ui/                # Reusable UI components
├── hooks/
│   └── useCalculator.ts   # Zustand store
└── lib/
    ├── calculations.ts    # Core ROI logic
    ├── constants.ts       # Business constants
    ├── types.ts           # TypeScript types
    ├── utils.ts           # Utilities
    └── validations.ts     # Zod schemas
```

## Key Features

### Multi-Step Calculator Flow

1. **Institution Step** - Collect institution name
2. **Branch Step** - Transaction volume, FTEs, costs
3. **Pain Points Step** - Current operational challenges
4. **Contact Step** - Lead capture with ROI preview

### Results Dashboard

- Key metrics cards with animations
- Annual savings breakdown chart
- 5-year projection visualization
- Calculation breakdown
- Email report functionality

### Business Rules

- **Minimum 3 FTEs** - Branches need at least 3 staff for compliance
- **Conservative rounding** - FTE savings floor to nearest 0.5
- **No contact required** - Results shown before email capture
- **Edge cases** - Helpful messaging for understaffed/minimum scenarios

## Development

```bash
# Run development server
npm run dev

# Run tests
npm test

# Run calculation tests only
npm run test:calculations

# Lint code
npm run lint

# Build for production
npm run build
```

## Design Guidelines

### Brand Colors

- Primary Navy: `#1e3a5f`
- Accent Teal: `#0d9488`
- Secondary Blue: `#3b82f6`

### Typography

- Font: Plus Jakarta Sans
- Numbers: JetBrains Mono

### Voice

- Professional but warm
- Educational first, sales second
- Trustworthy, not pushy

## HubSpot Integration

This project uses the HubSpot Forms API for lead capture. You'll need to:

1. Create a form in HubSpot Marketing Hub
2. Get your Portal ID and Form GUID
3. Create custom properties in HubSpot:
   - `branch_name` (text)
   - `monthly_transactions` (number)
   - `current_ftes` (number)
   - `estimated_roi` (number)
   - `pain_points` (text)

## Documentation

- [Calculation Logic](/docs/CALCULATION_LOGIC.md) - Business logic documentation

## Contact

**Client:** Quality Data Systems (Sean Farrell, CEO)
**Project Manager:** Sidekick Strategies (George B. Thomas)
