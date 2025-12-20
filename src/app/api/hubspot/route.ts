import { NextRequest, NextResponse } from 'next/server';
import { hubspotSubmissionSchema } from '@/lib/validations';

/**
 * HubSpot Forms API Integration
 *
 * This endpoint submits lead data to HubSpot using the Forms API.
 * Documentation: https://developers.hubspot.com/docs/api/marketing/forms
 *
 * Field Mapping:
 * - Branch Name → HubSpot 'company' field (standard Company Name)
 * - Institution Name → custom 'institution_name' property
 *
 * Required HubSpot Custom Properties (see bottom of file for details):
 * - institution_name (Single-line text) - Financial institution name
 * - monthly_transactions (Number)
 * - current_ftes (Number)
 * - annual_fte_cost (Number)
 * - estimated_annual_roi (Number)
 * - n5year_roi (Number)
 * - fte_savings (Number)
 * - payback_period_months (Number)
 * - pain_points (Multiple checkboxes or Multi-line text)
 * - number_of_pain_points (Number)
 */

// Helper: Find a company by domain using HubSpot CRM API
async function findCompanyByDomain(domain: string, accessToken: string): Promise<string | null> {
  console.log('[findCompanyByDomain] Searching for company with domain:', domain);
  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/companies/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filterGroups: [{
          filters: [{
            propertyName: 'domain',
            operator: 'EQ',
            value: domain,
          }],
        }],
        properties: ['domain', 'name'],
        limit: 1,
      }),
    });

    const responseText = await response.text();
    console.log('[findCompanyByDomain] Response status:', response.status);
    console.log('[findCompanyByDomain] Response body:', responseText);

    if (!response.ok) {
      console.error('[findCompanyByDomain] Company search error:', responseText);
      return null;
    }

    const result = JSON.parse(responseText);
    if (result.results && result.results.length > 0) {
      console.log('[findCompanyByDomain] Found company ID:', result.results[0].id);
      return result.results[0].id;
    }
    console.log('[findCompanyByDomain] No company found with domain:', domain);
    return null;
  } catch (error) {
    console.error('[findCompanyByDomain] Error:', error);
    return null;
  }
}

// Type for company data with all ROI properties
interface CompanyData {
  domain: string;
  name: string;
  institutionName: string;
  monthlyTransactions: number;
  currentFTEs: number;
  annualFTECost: number;
  estimatedROI: number;
  fiveYearROI: number;
  fteSavings: number;
  paybackPeriodMonths: number;
  painPoints: string[];
}

// Helper: Create a company with the given domain and all ROI properties
async function createCompany(companyData: CompanyData, accessToken: string): Promise<string | null> {
  console.log('[createCompany] Creating company with domain:', companyData.domain, 'name:', companyData.name);

  const requestBody = {
    properties: {
      // Standard company properties
      domain: companyData.domain,           // Maps to Company Domain in HubSpot
      name: companyData.name,               // Maps to Company Name in HubSpot

      // TCR ROI Calculator custom properties (must exist in HubSpot as Company properties)
      institution_name: companyData.institutionName,
      monthly_transactions: companyData.monthlyTransactions.toString(),
      current_ftes: companyData.currentFTEs.toString(),
      annual_fte_cost: companyData.annualFTECost.toString(),
      estimated_annual_roi: companyData.estimatedROI.toString(),
      n5year_roi: companyData.fiveYearROI.toString(),
      fte_savings: companyData.fteSavings.toString(),
      payback_period_months: companyData.paybackPeriodMonths.toString(),
      pain_points: companyData.painPoints.join('; '),
      number_of_pain_points: companyData.painPoints.length.toString(),
    },
  };
  console.log('[createCompany] Request body:', JSON.stringify(requestBody));

  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/companies', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log('[createCompany] Response status:', response.status);
    console.log('[createCompany] Response body:', responseText);

    if (!response.ok) {
      console.error('[createCompany] Company creation error:', responseText);
      return null;
    }

    const result = JSON.parse(responseText);
    console.log('[createCompany] Created company with ID:', result.id);
    return result.id;
  } catch (error) {
    console.error('[createCompany] Error:', error);
    return null;
  }
}

// Helper: Update an existing company with ROI properties
async function updateCompany(companyId: string, companyData: CompanyData, accessToken: string): Promise<boolean> {
  console.log('[updateCompany] Updating company:', companyId, 'with ROI data');

  const requestBody = {
    properties: {
      // TCR ROI Calculator custom properties
      institution_name: companyData.institutionName,
      monthly_transactions: companyData.monthlyTransactions.toString(),
      current_ftes: companyData.currentFTEs.toString(),
      annual_fte_cost: companyData.annualFTECost.toString(),
      estimated_annual_roi: companyData.estimatedROI.toString(),
      n5year_roi: companyData.fiveYearROI.toString(),
      fte_savings: companyData.fteSavings.toString(),
      payback_period_months: companyData.paybackPeriodMonths.toString(),
      pain_points: companyData.painPoints.join('; '),
      number_of_pain_points: companyData.painPoints.length.toString(),
    },
  };
  console.log('[updateCompany] Request body:', JSON.stringify(requestBody));

  try {
    const response = await fetch(`https://api.hubapi.com/crm/v3/objects/companies/${companyId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log('[updateCompany] Response status:', response.status);
    console.log('[updateCompany] Response body:', responseText);

    if (!response.ok) {
      console.error('[updateCompany] Company update error:', responseText);
      return false;
    }

    console.log('[updateCompany] Successfully updated company');
    return true;
  } catch (error) {
    console.error('[updateCompany] Error:', error);
    return false;
  }
}

// Helper: Find a contact by email
async function findContactByEmail(email: string, accessToken: string): Promise<string | null> {
  console.log('[findContactByEmail] Searching for contact with email:', email);
  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filterGroups: [{
          filters: [{
            propertyName: 'email',
            operator: 'EQ',
            value: email,
          }],
        }],
        properties: ['email'],
        limit: 1,
      }),
    });

    const responseText = await response.text();
    console.log('[findContactByEmail] Response status:', response.status);

    if (!response.ok) {
      console.error('[findContactByEmail] Contact search error:', responseText);
      return null;
    }

    const result = JSON.parse(responseText);
    if (result.results && result.results.length > 0) {
      console.log('[findContactByEmail] Found contact ID:', result.results[0].id);
      return result.results[0].id;
    }
    console.log('[findContactByEmail] No contact found with email:', email);
    return null;
  } catch (error) {
    console.error('[findContactByEmail] Error:', error);
    return null;
  }
}

// Helper: Associate a contact with a company using v4 API
async function associateContactWithCompany(
  contactId: string,
  companyId: string,
  accessToken: string
): Promise<boolean> {
  console.log('[associateContactWithCompany] Associating contact:', contactId, 'with company:', companyId);

  // Use HubSpot v4 Associations API - more reliable
  const url = `https://api.hubapi.com/crm/v4/objects/contacts/${contactId}/associations/companies/${companyId}`;
  console.log('[associateContactWithCompany] URL:', url);

  // Association type for Contact to Company
  const requestBody = [
    {
      associationCategory: 'HUBSPOT_DEFINED',
      associationTypeId: 1  // 1 = Contact to Company (Primary)
    }
  ];
  console.log('[associateContactWithCompany] Request body:', JSON.stringify(requestBody));

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log('[associateContactWithCompany] Response status:', response.status);
    console.log('[associateContactWithCompany] Response body:', responseText);

    if (!response.ok) {
      console.error('[associateContactWithCompany] Association error:', responseText);
      return false;
    }

    console.log('[associateContactWithCompany] Successfully associated contact with company');
    return true;
  } catch (error) {
    console.error('[associateContactWithCompany] Error:', error);
    return false;
  }
}

// Helper: Create or find company and associate with contact
async function ensureCompanyAssociation(
  email: string,
  companyData: CompanyData,
  accessToken: string
): Promise<void> {
  console.log('[ensureCompanyAssociation] Starting for domain:', companyData.domain);
  console.log('[ensureCompanyAssociation] Company data:', JSON.stringify(companyData));

  // Step 1: Find or create the company
  let companyId = await findCompanyByDomain(companyData.domain, accessToken);

  if (!companyId) {
    console.log('[ensureCompanyAssociation] Company not found, creating new company');
    companyId = await createCompany(companyData, accessToken);
  } else {
    console.log('[ensureCompanyAssociation] Found existing company with ID:', companyId);
    // Update existing company with latest ROI data
    console.log('[ensureCompanyAssociation] Updating existing company with ROI data');
    await updateCompany(companyId, companyData, accessToken);
  }

  if (!companyId) {
    console.error('[ensureCompanyAssociation] Failed to find or create company');
    return;
  }

  // Step 2: Wait a moment for the contact to be created by the form submission
  // HubSpot form submissions are async, so we may need to retry
  let contactId: string | null = null;
  let retries = 3;

  while (!contactId && retries > 0) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    contactId = await findContactByEmail(email, accessToken);
    retries--;
    if (!contactId && retries > 0) {
      console.log('[ensureCompanyAssociation] Contact not found yet, retrying... (' + retries + ' attempts left)');
    }
  }

  if (!contactId) {
    console.error('[ensureCompanyAssociation] Could not find contact after form submission');
    return;
  }

  console.log('[ensureCompanyAssociation] Found contact with ID:', contactId);

  // Step 3: Associate the contact with the company
  const success = await associateContactWithCompany(contactId, companyId, accessToken);

  if (success) {
    console.log('[ensureCompanyAssociation] Successfully associated contact', contactId, 'with company', companyId);
  } else {
    console.error('[ensureCompanyAssociation] Failed to associate contact with company');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the incoming data - but don't block on validation errors
    const result = hubspotSubmissionSchema.safeParse(body);

    if (!result.success) {
      // Log validation errors but don't block the user
      console.error('HubSpot validation warning:', result.error.errors);
      // Return success anyway - user experience is priority
      return NextResponse.json({
        success: true,
        message: 'Form received (validation warning)',
      });
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
    // The Forms API uses simple { name, value } format (NOT objectTypeId format)
    // Build ROI summary message for notes field
    const roiSummary = `TCR ROI Calculator Results:
- Institution: ${data.institutionName}
- Branch: ${data.branchName}
- Monthly Transactions: ${data.monthlyTransactions.toLocaleString()}
- Current FTEs: ${data.currentFTEs}
- Annual FTE Cost: $${data.annualFTECost.toLocaleString()}
- Estimated Annual ROI: $${data.estimatedROI.toLocaleString()}
- 5-Year ROI: $${data.fiveYearROI.toLocaleString()}
- FTE Savings: ${data.fteSavings}
- Payback Period: ${data.paybackPeriodMonths} months
- Has Positive ROI: ${data.hasPositiveROI ? 'Yes' : 'No'}
- Pain Points: ${data.painPoints.length > 0 ? data.painPoints.join(', ') : 'None selected'}`;

    // Build fields array - conditionally include website if provided
    const fields = [
      // Standard HubSpot contact properties (these always work)
      { name: 'firstname', value: data.firstName },
      { name: 'lastname', value: data.lastName },
      { name: 'email', value: data.email },
      { name: 'phone', value: data.phone || '' },
      { name: 'company', value: data.branchName }, // Branch Name → Company Name
      { name: 'jobtitle', value: data.jobTitle || '' },

      // Store all ROI data in message/notes field (always works, no custom properties needed)
      { name: 'message', value: roiSummary },

      // Custom properties - these only work if added to HubSpot form
      // Institution & Branch Information
      { name: 'institution_name', value: data.institutionName },
      { name: 'monthly_transactions', value: data.monthlyTransactions.toString() },
      { name: 'current_ftes', value: data.currentFTEs.toString() },
      { name: 'annual_fte_cost', value: data.annualFTECost.toString() },

      // ROI Results
      { name: 'estimated_roi', value: data.estimatedROI.toString() },
      { name: 'five_year_roi', value: data.fiveYearROI.toString() },
      { name: 'fte_savings', value: data.fteSavings.toString() },
      { name: 'payback_period_months', value: data.paybackPeriodMonths.toString() },
      { name: 'has_positive_roi', value: data.hasPositiveROI ? 'true' : 'false' },

      // Pain Points
      { name: 'pain_points', value: data.painPoints.join('; ') },
      { name: 'pain_point_count', value: data.painPoints.length.toString() },
    ];

    // NOTE: We do NOT send 'domain' to the Forms API because:
    // - 'domain' is a Company property, not a Contact property
    // - The Forms API only handles Contact fields
    // - Company creation/association is handled separately via CRM API after form submission

    const hubspotPayload = {
      fields,
      context: {
        pageUri: request.headers.get('referer') || 'https://roi.qdsdata.com',
        pageName: 'TCR ROI Calculator',
      },
      // Note: legalConsentOptions removed - it can cause submission failures
      // if the HubSpot form doesn't have GDPR/consent settings enabled
    };

    // Submit to HubSpot Forms API
    const hubspotUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formGuid}`;

    console.log('Submitting to HubSpot:', hubspotUrl);
    console.log('Payload fields:', hubspotPayload.fields.map(f => f.name));

    let hubspotResponse = await fetch(hubspotUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(hubspotPayload),
    });

    // If initial submission fails, retry with only standard fields
    if (!hubspotResponse.ok) {
      const errorText = await hubspotResponse.text();
      console.error('HubSpot API error (full payload):', errorText);

      // Fallback: Try with only standard HubSpot fields
      const fallbackFields = [
        { name: 'firstname', value: data.firstName },
        { name: 'lastname', value: data.lastName },
        { name: 'email', value: data.email },
        { name: 'phone', value: data.phone || '' },
        { name: 'company', value: data.branchName },
        { name: 'jobtitle', value: data.jobTitle || '' },
        { name: 'message', value: roiSummary },
      ];

      const fallbackPayload = {
        fields: fallbackFields,
        context: hubspotPayload.context,
      };

      console.log('Retrying HubSpot with fallback (standard fields only)');

      hubspotResponse = await fetch(hubspotUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fallbackPayload),
      });

      if (!hubspotResponse.ok) {
        const fallbackError = await hubspotResponse.text();
        console.error('HubSpot API error (fallback):', fallbackError);

        // Still return success to user, but log for debugging
        return NextResponse.json({
          success: true,
          message: 'Form processed (HubSpot sync pending)',
          debug: process.env.NODE_ENV === 'development' ? fallbackError : undefined,
        });
      }
    }

    const hubspotResult = await hubspotResponse.json();
    console.log('HubSpot submission successful:', hubspotResult);

    // If we have a domain and access token, create/find company and associate with contact
    // IMPORTANT: We MUST await this because Vercel serverless terminates after returning response
    const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;
    // Log the data we received for company association
    console.log('[HubSpot API] Company association check:');
    console.log('  - institutionWebsite (domain):', data.institutionWebsite || '(not provided)');
    console.log('  - institutionName (company name):', data.institutionName || '(not provided)');
    console.log('  - email:', data.email);
    console.log('  - accessToken configured:', !!accessToken);

    if (data.institutionWebsite && accessToken) {
      console.log('[HubSpot API] Starting company creation/association...');

      // Build company data with all ROI properties
      const companyData: CompanyData = {
        domain: data.institutionWebsite,
        name: data.institutionName,
        institutionName: data.institutionName,
        monthlyTransactions: data.monthlyTransactions,
        currentFTEs: data.currentFTEs,
        annualFTECost: data.annualFTECost,
        estimatedROI: data.estimatedROI,
        fiveYearROI: data.fiveYearROI,
        fteSavings: data.fteSavings,
        paybackPeriodMonths: data.paybackPeriodMonths,
        painPoints: data.painPoints,
      };

      console.log('[HubSpot API] Company data:', JSON.stringify(companyData));

      try {
        await ensureCompanyAssociation(
          data.email,
          companyData,
          accessToken
        );
        console.log('[HubSpot API] Company association completed successfully');
      } catch (err) {
        console.error('[HubSpot API] Company association error:', err);
        // Don't fail the whole request if company association fails
      }
    } else {
      if (!data.institutionWebsite) {
        console.log('[HubSpot API] No institution domain provided, skipping company association');
      }
      if (!accessToken) {
        console.log('[HubSpot API] No HUBSPOT_ACCESS_TOKEN configured, skipping company association');
      }
    }

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
      debug: process.env.NODE_ENV === 'development' ? String(error) : undefined,
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
 * FIELD MAPPING:
 * - Branch Name from calculator → HubSpot 'company' field (standard Company Name)
 * - Institution Name from calculator → custom 'institution_name' property
 *
 * INSTITUTION & BRANCH PROPERTIES:
 *
 * 1. institution_name
 *    - Label: Institution Name
 *    - Type: Single-line text
 *    - Group: TCR Calculator
 *    - Description: The financial institution name (e.g., "First National Bank")
 *    - Note: Branch Name is stored in the standard 'company' field
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
 * 5. estimated_annual_roi
 *    - Label: Estimated Annual ROI
 *    - Type: Number
 *    - Group: TCR Calculator
 *
 * 6. n5year_roi
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
 * 11. number_of_pain_points
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
