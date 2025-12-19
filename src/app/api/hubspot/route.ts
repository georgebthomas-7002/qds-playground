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
 * - estimated_roi (Number)
 * - five_year_roi (Number)
 * - fte_savings (Number)
 * - payback_period_months (Number)
 * - pain_points (Multiple checkboxes or Multi-line text)
 */

// Helper: Find a company by domain using HubSpot CRM API
async function findCompanyByDomain(domain: string, accessToken: string): Promise<string | null> {
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

    if (!response.ok) {
      console.error('Company search error:', await response.text());
      return null;
    }

    const result = await response.json();
    if (result.results && result.results.length > 0) {
      return result.results[0].id;
    }
    return null;
  } catch (error) {
    console.error('Error searching for company:', error);
    return null;
  }
}

// Helper: Create a company with the given domain
async function createCompany(domain: string, companyName: string, accessToken: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/companies', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          domain: domain,
          name: companyName,
        },
      }),
    });

    if (!response.ok) {
      console.error('Company creation error:', await response.text());
      return null;
    }

    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Error creating company:', error);
    return null;
  }
}

// Helper: Find a contact by email
async function findContactByEmail(email: string, accessToken: string): Promise<string | null> {
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

    if (!response.ok) {
      console.error('Contact search error:', await response.text());
      return null;
    }

    const result = await response.json();
    if (result.results && result.results.length > 0) {
      return result.results[0].id;
    }
    return null;
  } catch (error) {
    console.error('Error searching for contact:', error);
    return null;
  }
}

// Helper: Associate a contact with a company
async function associateContactWithCompany(
  contactId: string,
  companyId: string,
  accessToken: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}/associations/companies/${companyId}/contact_to_company`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Association error:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error associating contact with company:', error);
    return false;
  }
}

// Helper: Create or find company and associate with contact
async function ensureCompanyAssociation(
  email: string,
  domain: string,
  companyName: string,
  accessToken: string
): Promise<void> {
  console.log('Starting company association for domain:', domain);

  // Step 1: Find or create the company
  let companyId = await findCompanyByDomain(domain, accessToken);

  if (!companyId) {
    console.log('Company not found, creating new company for domain:', domain);
    companyId = await createCompany(domain, companyName, accessToken);
  } else {
    console.log('Found existing company with ID:', companyId);
  }

  if (!companyId) {
    console.error('Failed to find or create company');
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
      console.log('Contact not found yet, retrying... (' + retries + ' attempts left)');
    }
  }

  if (!contactId) {
    console.error('Could not find contact after form submission');
    return;
  }

  console.log('Found contact with ID:', contactId);

  // Step 3: Associate the contact with the company
  const success = await associateContactWithCompany(contactId, companyId, accessToken);

  if (success) {
    console.log('Successfully associated contact', contactId, 'with company', companyId);
  } else {
    console.error('Failed to associate contact with company');
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

    // Add domain field if provided - this helps HubSpot with company association
    // The 'domain' field is HubSpot's Company Domain property used for matching/association
    if (data.institutionWebsite) {
      fields.push({ name: 'domain', value: data.institutionWebsite });
    }

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

      // Include domain in fallback if provided
      if (data.institutionWebsite) {
        fallbackFields.push({ name: 'domain', value: data.institutionWebsite });
      }

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
    // Do this in the background (don't await) to not slow down the response
    const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;
    if (data.institutionWebsite && accessToken) {
      // Run company association in background - don't block the response
      ensureCompanyAssociation(
        data.email,
        data.institutionWebsite,
        data.institutionName, // Use institution name as company name
        accessToken
      ).catch((err) => {
        console.error('Background company association error:', err);
      });
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
