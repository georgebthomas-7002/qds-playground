import { NextRequest, NextResponse } from 'next/server';
import { hubspotSubmissionSchema } from '@/lib/validations';

/**
 * HubSpot Forms API Integration
 *
 * This endpoint submits lead data to HubSpot using the Forms API.
 * Documentation: https://developers.hubspot.com/docs/api/marketing/forms
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
        { objectTypeId: '0-1', name: 'firstname', value: data.firstName },
        { objectTypeId: '0-1', name: 'lastname', value: data.lastName },
        { objectTypeId: '0-1', name: 'email', value: data.email },
        { objectTypeId: '0-1', name: 'phone', value: data.phone || '' },
        { objectTypeId: '0-1', name: 'company', value: data.company },
        // Custom properties (need to be created in HubSpot first)
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
          name: 'estimated_roi',
          value: data.estimatedROI.toString(),
        },
        {
          objectTypeId: '0-1',
          name: 'pain_points',
          value: data.painPoints.join('; '),
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
 * Alternative: Using HubSpot Private App Token API
 *
 * If you prefer to use the CRM API instead of Forms API,
 * you can create contacts directly. This requires a private app.
 */
async function createContactWithCRM(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company: string;
}) {
  const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;

  if (!accessToken) {
    throw new Error('HubSpot access token not configured');
  }

  const response = await fetch(
    'https://api.hubapi.com/crm/v3/objects/contacts',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          firstname: data.firstName,
          lastname: data.lastName,
          email: data.email,
          phone: data.phone,
          company: data.company,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HubSpot CRM API error: ${error}`);
  }

  return response.json();
}
