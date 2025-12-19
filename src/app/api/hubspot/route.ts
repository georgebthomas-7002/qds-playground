import { NextRequest, NextResponse } from 'next/server';
import { hubspotSubmissionSchema } from '@/lib/validations';

/**
 * HubSpot Forms API Integration
 *
 * This endpoint submits lead data to HubSpot using the Forms API.
 * Documentation: https://developers.hubspot.com/docs/api/marketing/forms
 *
 * Required HubSpot Custom Properties (see bottom of file for details):
 * - branch_name (Single-line text)
 * - monthly_transactions (Number)
 * - current_ftes (Number)
 * - annual_fte_cost (Number)
 * - estimated_roi (Number)
 * - five_year_roi (Number)
 * - fte_savings (Number)
 * - payback_period_months (Number)
 * - pain_points (Multiple checkboxes or Multi-line text)
 * - tcr_interest_level (Dropdown)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the incoming data
    const result = hubspotSubmissionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid form data', details: result.error.errors },
        { status: 400 }
      );
    }

    const data = result.data;

    // Get HubSpot credentials from environment
    const portalId = process.env.HUBSPOT_PORTAL_ID;
    const formGuid = process.env.HUBSPOT_FORM_GUID;

    if (!portalId || !formGuid) {
      console.error('HubSpot credentials not configured');
      // Return success anyway to not block the user experience
      // In production, you'd want to handle this differently
      return NextResponse.json({
        success: true,
        message: 'Form submitted (HubSpot not configured)',
      });
    }

    // Prepare the HubSpot Forms API payload
    // Using the v3 Forms API
    const hubspotPayload = {
      fields: [
        // Standard HubSpot contact properties
        { objectTypeId: '0-1', name: 'firstname', value: data.firstName },
        { objectTypeId: '0-1', name: 'lastname', value: data.lastName },
        { objectTypeId: '0-1', name: 'email', value: data.email },
        { objectTypeId: '0-1', name: 'phone', value: data.phone || '' },
        { objectTypeId: '0-1', name: 'company', value: data.company },
        { objectTypeId: '0-1', name: 'jobtitle', value: data.jobTitle || '' },

        // Custom properties - Branch Information
        { objectTypeId: '0-1', name: 'branch_name', value: data.branchName },
        {
          objectTypeId: '0-1',
          name: 'monthly_transactions',
          value: data.monthlyTransactions.toString(),
        },
        {
          objectTypeId: '0-1',
          name: 'current_ftes',
          value: data.currentFTEs.toString(),
        },
        {
          objectTypeId: '0-1',
          name: 'annual_fte_cost',
          value: data.annualFTECost.toString(),
        },

        // Custom properties - ROI Results
        {
          objectTypeId: '0-1',
          name: 'estimated_roi',
          value: data.estimatedROI.toString(),
        },
        {
          objectTypeId: '0-1',
          name: 'five_year_roi',
          value: data.fiveYearROI.toString(),
        },
        {
          objectTypeId: '0-1',
          name: 'fte_savings',
          value: data.fteSavings.toString(),
        },
        {
          objectTypeId: '0-1',
          name: 'payback_period_months',
          value: data.paybackPeriodMonths.toString(),
        },
        {
          objectTypeId: '0-1',
          name: 'has_positive_roi',
          value: data.hasPositiveROI ? 'true' : 'false',
        },

        // Custom properties - Pain Points
        {
          objectTypeId: '0-1',
          name: 'pain_points',
          value: data.painPoints.join('; '),
        },
        {
          objectTypeId: '0-1',
          name: 'pain_point_count',
          value: data.painPoints.length.toString(),
        },
      ],
      context: {
        pageUri: request.headers.get('referer') || 'https://roi.qdsdata.com',
        pageName: 'TCR ROI Calculator',
      },
      legalConsentOptions: {
        consent: {
          consentToProcess: true,
          text: 'I agree to receive communications from QDS.',
        },
      },
    };

    // Submit to HubSpot Forms API
    const hubspotUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`;

    const hubspotResponse = await fetch(hubspotUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(hubspotPayload),
    });

    if (!hubspotResponse.ok) {
      const errorText = await hubspotResponse.text();
      console.error('HubSpot API error:', errorText);

      // Don't fail the request - still return success
      // Log for debugging but don't block user experience
      return NextResponse.json({
        success: true,
        message: 'Form processed (HubSpot sync pending)',
      });
    }

    const hubspotResult = await hubspotResponse.json();

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      hubspotId: hubspotResult.inlineMessage,
    });
  } catch (error) {
    console.error('HubSpot submission error:', error);

    // Return success anyway to not break user experience
    // The form data is captured in the frontend store
    return NextResponse.json({
      success: true,
      message: 'Form received',
    });
  }
}

/**
 * ============================================
 * HUBSPOT CUSTOM PROPERTIES SETUP GUIDE
 * ============================================
 *
 * To use this integration, you need to create the following custom properties
 * in your HubSpot account under Settings > Properties > Contact Properties:
 *
 * BRANCH INFORMATION PROPERTIES:
 *
 * 1. branch_name
 *    - Label: Branch Name
 *    - Type: Single-line text
 *    - Group: Contact information (or create a "TCR Calculator" group)
 *
 * 2. monthly_transactions
 *    - Label: Monthly Transactions
 *    - Type: Number
 *    - Group: TCR Calculator
 *
 * 3. current_ftes
 *    - Label: Current FTEs
 *    - Type: Number
 *    - Group: TCR Calculator
 *
 * 4. annual_fte_cost
 *    - Label: Annual FTE Cost
 *    - Type: Number
 *    - Group: TCR Calculator
 *
 * ROI RESULTS PROPERTIES:
 *
 * 5. estimated_roi
 *    - Label: Estimated Annual ROI
 *    - Type: Number
 *    - Group: TCR Calculator
 *
 * 6. five_year_roi
 *    - Label: 5-Year ROI
 *    - Type: Number
 *    - Group: TCR Calculator
 *
 * 7. fte_savings
 *    - Label: FTE Savings
 *    - Type: Number
 *    - Group: TCR Calculator
 *
 * 8. payback_period_months
 *    - Label: Payback Period (Months)
 *    - Type: Number
 *    - Group: TCR Calculator
 *
 * 9. has_positive_roi
 *    - Label: Has Positive ROI
 *    - Type: Single checkbox (or Single-line text)
 *    - Group: TCR Calculator
 *
 * PAIN POINTS PROPERTIES:
 *
 * 10. pain_points
 *     - Label: Pain Points
 *     - Type: Multi-line text (or Multiple checkboxes with predefined values)
 *     - Group: TCR Calculator
 *     - Note: If using checkboxes, create options for each pain point ID:
 *       - cash_handling_errors
 *       - long_wait_times
 *       - manual_counting
 *       - vault_management
 *       - staffing_constraints
 *       - audit_compliance
 *       - cash_ordering
 *       - employee_training
 *
 * 11. pain_point_count
 *     - Label: Number of Pain Points
 *     - Type: Number
 *     - Group: TCR Calculator
 *
 * FORM SETUP:
 *
 * After creating these properties, you need to:
 * 1. Create a new form in HubSpot Marketing > Forms
 * 2. Add all the custom properties to the form (they can be hidden fields)
 * 3. Get the Portal ID and Form GUID from the form's embed code
 * 4. Add these to your environment variables:
 *    - HUBSPOT_PORTAL_ID=your_portal_id
 *    - HUBSPOT_FORM_GUID=your_form_guid
 *
 * ENVIRONMENT VARIABLES NEEDED:
 *
 * HUBSPOT_PORTAL_ID=12345678
 * HUBSPOT_FORM_GUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
 *
 */
