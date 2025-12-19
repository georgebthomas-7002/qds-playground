import { NextRequest, NextResponse } from 'next/server';
import ReactPDF from '@react-pdf/renderer';
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import { formatCurrency, formatFTE, formatNumber } from '@/lib/calculations';
import {
  TRANSACTIONS_PER_FTE_MONTHLY,
  ANNUAL_TCR_COST,
  TCR_CAPITAL_COST,
  PAIN_POINTS,
  PAIN_POINT_SOLUTIONS,
  QDS_CONTACT_URL,
  QDS_RESOURCES,
} from '@/lib/constants';

// QDS Brand Colors
const colors = {
  navy: '#20376c',
  sky: '#a5d7f1',
  lime: '#c0d844',
  teal: '#0d9488',
  gray: '#6b7280',
  lightGray: '#f3f4f6',
  white: '#ffffff',
  black: '#111827',
};

// Styles for PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: colors.black,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: colors.navy,
  },
  logo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.navy,
  },
  logoSubtitle: {
    fontSize: 9,
    color: colors.gray,
  },
  date: {
    fontSize: 8,
    color: colors.gray,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.navy,
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 11,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.navy,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Executive Summary Box
  execSummary: {
    backgroundColor: colors.navy,
    padding: 20,
    borderRadius: 6,
    marginBottom: 15,
  },
  execTitle: {
    fontSize: 10,
    color: colors.sky,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 5,
  },
  execValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
  },
  execSubtext: {
    fontSize: 9,
    color: colors.sky,
    marginTop: 5,
  },
  // Metrics Grid
  metricsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.lightGray,
    padding: 12,
    marginHorizontal: 3,
    borderRadius: 4,
  },
  metricLabel: {
    fontSize: 7,
    color: colors.gray,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.black,
  },
  metricSubtext: {
    fontSize: 7,
    color: colors.gray,
    marginTop: 2,
  },
  // Table styles
  table: {
    marginTop: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 6,
  },
  tableRowHighlight: {
    flexDirection: 'row',
    backgroundColor: colors.lightGray,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 3,
  },
  tableLabel: {
    flex: 1,
    fontSize: 9,
    color: colors.gray,
  },
  tableValue: {
    flex: 1,
    fontSize: 9,
    color: colors.black,
    textAlign: 'right',
    fontFamily: 'Courier',
  },
  tableValueBold: {
    flex: 1,
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.navy,
    textAlign: 'right',
    fontFamily: 'Courier',
  },
  // Pain Points
  painPointBox: {
    backgroundColor: '#f0fdfa',
    padding: 10,
    borderRadius: 4,
    marginBottom: 8,
  },
  painPointHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  painPointTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.black,
  },
  painPointStat: {
    fontSize: 7,
    color: colors.teal,
    fontWeight: 'bold',
  },
  painPointSolution: {
    fontSize: 8,
    color: colors.teal,
    marginBottom: 2,
  },
  painPointBenefit: {
    fontSize: 8,
    color: colors.gray,
  },
  // CTA
  ctaBox: {
    backgroundColor: colors.teal,
    padding: 15,
    borderRadius: 6,
    marginTop: 15,
  },
  ctaTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
  ctaSubtext: {
    fontSize: 9,
    color: colors.white,
    textAlign: 'center',
    marginTop: 4,
  },
  ctaUrl: {
    fontSize: 8,
    color: colors.white,
    textAlign: 'center',
    marginTop: 8,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 7,
    color: colors.gray,
    textAlign: 'center',
  },
  // Why QDS section
  whyQdsBox: {
    backgroundColor: colors.lightGray,
    padding: 12,
    borderRadius: 4,
    marginBottom: 15,
  },
  whyQdsItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  whyQdsBullet: {
    width: 12,
    fontSize: 9,
    color: colors.lime,
  },
  whyQdsText: {
    flex: 1,
    fontSize: 8,
    color: colors.black,
  },
  // Resources section
  resourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  resourceCard: {
    width: '48%',
    marginBottom: 8,
    marginRight: '2%',
    padding: 10,
    backgroundColor: colors.lightGray,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.lime,
  },
  resourceType: {
    fontSize: 6,
    color: colors.teal,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  resourceTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.navy,
    marginBottom: 4,
  },
  resourceDesc: {
    fontSize: 7,
    color: colors.gray,
    marginBottom: 4,
    lineHeight: 1.3,
  },
  resourceUrl: {
    fontSize: 6,
    color: colors.teal,
  },
});

// Types for the API
interface PDFRequestBody {
  results: {
    branchData: {
      institutionName: string;
      branchName: string;
      monthlyTransactions: number;
      currentFTEs: number;
      annualFTECost: number;
      painPoints: string[];
    };
    calculation: {
      recommendedFTEs: number;
      fteSavings: number;
      annualLaborSavings: number;
      annualTCRCost: number;
      netAnnualROI: number;
      monthlyROI: number;
      paybackPeriodMonths: number;
      fiveYearROI: number;
      roiPercentage: number;
      firstYearNetSavings: number;
      totalFiveYearInvestment: number;
      efficiencyGainPercent: number;
      hasPositiveROI: boolean;
      isAtMinimumStaff: boolean;
      isUnderstaffed: boolean;
    };
    timestamp: string;
  };
  contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  uploadToHubSpot?: boolean;
  hubSpotContactId?: string;
}

// PDF Document Component
function ROIReportPDF({ results, contactInfo }: { results: PDFRequestBody['results']; contactInfo: PDFRequestBody['contactInfo'] }) {
  // Ensure branchData has defaults
  const branchData = {
    institutionName: results?.branchData?.institutionName || 'Unknown Institution',
    branchName: results?.branchData?.branchName || 'Unknown Branch',
    monthlyTransactions: results?.branchData?.monthlyTransactions ?? 0,
    currentFTEs: results?.branchData?.currentFTEs ?? 0,
    annualFTECost: results?.branchData?.annualFTECost ?? 42000,
    painPoints: results?.branchData?.painPoints || [],
  };

  // Ensure calculation has defaults
  const calculation = {
    recommendedFTEs: results?.calculation?.recommendedFTEs ?? 0,
    fteSavings: results?.calculation?.fteSavings ?? 0,
    annualLaborSavings: results?.calculation?.annualLaborSavings ?? 0,
    annualTCRCost: results?.calculation?.annualTCRCost ?? ANNUAL_TCR_COST,
    netAnnualROI: results?.calculation?.netAnnualROI ?? 0,
    monthlyROI: results?.calculation?.monthlyROI ?? 0,
    paybackPeriodMonths: results?.calculation?.paybackPeriodMonths ?? 0,
    fiveYearROI: results?.calculation?.fiveYearROI ?? 0,
    roiPercentage: results?.calculation?.roiPercentage ?? 0,
    firstYearNetSavings: results?.calculation?.firstYearNetSavings ?? 0,
    totalFiveYearInvestment: results?.calculation?.totalFiveYearInvestment ?? 0,
    efficiencyGainPercent: results?.calculation?.efficiencyGainPercent ?? 0,
    hasPositiveROI: results?.calculation?.hasPositiveROI ?? false,
    isAtMinimumStaff: results?.calculation?.isAtMinimumStaff ?? false,
    isUnderstaffed: results?.calculation?.isUnderstaffed ?? false,
  };

  const timestamp = results?.timestamp;
  const date = new Date(timestamp || new Date()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Get pain point solutions
  const painPointDetails = (branchData.painPoints || [])
    .map((id) => {
      const painPoint = PAIN_POINTS.find((p) => p.id === id);
      const solution = PAIN_POINT_SOLUTIONS[id];
      return painPoint && solution ? { painPoint, solution } : null;
    })
    .filter(Boolean);

  return React.createElement(Document, {},
    React.createElement(Page, { size: 'A4', style: styles.page },
      // Header
      React.createElement(View, { style: styles.header },
        React.createElement(View, {},
          React.createElement(Text, { style: styles.logo }, 'Quality Data Systems'),
          React.createElement(Text, { style: styles.logoSubtitle }, 'TCR ROI Calculator')
        ),
        React.createElement(Text, { style: styles.date }, `Generated: ${date}`)
      ),

      // Title
      React.createElement(Text, { style: styles.title }, 'TCR ROI Analysis'),
      React.createElement(Text, { style: styles.subtitle },
        `${branchData.institutionName} - ${branchData.branchName}`
      ),
      contactInfo?.firstName && React.createElement(Text, {
        style: { fontSize: 9, color: colors.gray, textAlign: 'center', marginBottom: 15 }
      }, `Prepared for: ${contactInfo.firstName} ${contactInfo.lastName || ''}`),

      // Executive Summary
      React.createElement(View, { style: styles.execSummary },
        React.createElement(Text, { style: styles.execTitle }, 'Estimated Annual Savings'),
        React.createElement(Text, { style: styles.execValue }, formatCurrency(calculation.netAnnualROI)),
        React.createElement(Text, { style: styles.execSubtext },
          `Based on ${formatFTE(calculation.fteSavings)} FTE optimization | ${Math.round(calculation.roiPercentage || 0)}% annual ROI`
        )
      ),

      // Key Metrics Row
      React.createElement(View, { style: styles.metricsRow },
        React.createElement(View, { style: styles.metricCard },
          React.createElement(Text, { style: styles.metricLabel }, 'Gross Labor Savings'),
          React.createElement(Text, { style: styles.metricValue }, formatCurrency(calculation.annualLaborSavings)),
          React.createElement(Text, { style: styles.metricSubtext }, 'Before TCR costs')
        ),
        React.createElement(View, { style: styles.metricCard },
          React.createElement(Text, { style: styles.metricLabel }, 'Monthly Savings'),
          React.createElement(Text, { style: styles.metricValue }, formatCurrency(calculation.monthlyROI)),
          React.createElement(Text, { style: styles.metricSubtext }, 'Net per month')
        ),
        React.createElement(View, { style: styles.metricCard },
          React.createElement(Text, { style: styles.metricLabel }, '5-Year ROI'),
          React.createElement(Text, { style: styles.metricValue }, formatCurrency(calculation.fiveYearROI)),
          React.createElement(Text, { style: styles.metricSubtext }, 'Total projected')
        ),
        React.createElement(View, { style: styles.metricCard },
          React.createElement(Text, { style: styles.metricLabel }, 'Payback Period'),
          React.createElement(Text, { style: styles.metricValue },
            calculation.paybackPeriodMonths === Infinity ? 'N/A' : `${calculation.paybackPeriodMonths} mo`
          ),
          React.createElement(Text, { style: styles.metricSubtext }, 'Break-even')
        )
      ),

      // Calculation Breakdown
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Calculation Breakdown'),
        React.createElement(View, { style: styles.table },
          React.createElement(View, { style: styles.tableRow },
            React.createElement(Text, { style: styles.tableLabel }, 'Transaction Analysis'),
            React.createElement(Text, { style: styles.tableValue },
              `${formatNumber(branchData.monthlyTransactions)} ÷ ${formatNumber(TRANSACTIONS_PER_FTE_MONTHLY)} = ${formatFTE(calculation.recommendedFTEs)} FTEs`
            )
          ),
          React.createElement(View, { style: styles.tableRow },
            React.createElement(Text, { style: styles.tableLabel }, 'Staff Optimization'),
            React.createElement(Text, { style: styles.tableValue },
              `${branchData.currentFTEs} − ${formatFTE(calculation.recommendedFTEs)} = ${formatFTE(calculation.fteSavings)} FTE reduction`
            )
          ),
          React.createElement(View, { style: styles.tableRow },
            React.createElement(Text, { style: styles.tableLabel }, 'Annual Labor Savings'),
            React.createElement(Text, { style: styles.tableValue },
              `${formatFTE(calculation.fteSavings)} × ${formatCurrency(branchData.annualFTECost)} = ${formatCurrency(calculation.annualLaborSavings)}`
            )
          ),
          React.createElement(View, { style: styles.tableRow },
            React.createElement(Text, { style: styles.tableLabel }, 'Less: Annual TCR Cost'),
            React.createElement(Text, { style: styles.tableValue }, formatCurrency(ANNUAL_TCR_COST))
          ),
          React.createElement(View, { style: styles.tableRowHighlight },
            React.createElement(Text, { style: { ...styles.tableLabel, fontWeight: 'bold', color: colors.black } }, 'Net Annual Savings'),
            React.createElement(Text, { style: styles.tableValueBold }, formatCurrency(calculation.netAnnualROI))
          )
        )
      ),

      // Pain Point Solutions (if any)
      painPointDetails.length > 0 && React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'How TCR Addresses Your Challenges'),
        ...painPointDetails.map((item, index) =>
          React.createElement(View, { key: index, style: styles.painPointBox },
            React.createElement(View, { style: styles.painPointHeader },
              React.createElement(Text, { style: styles.painPointTitle }, (item as any).painPoint.label),
              (item as any).solution.stat && React.createElement(Text, { style: styles.painPointStat }, (item as any).solution.stat)
            ),
            React.createElement(Text, { style: styles.painPointSolution }, (item as any).solution.solution),
            React.createElement(Text, { style: styles.painPointBenefit }, (item as any).solution.benefit)
          )
        )
      ),

      // Why QDS
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Why Quality Data Systems'),
        React.createElement(View, { style: styles.whyQdsBox },
          React.createElement(View, { style: styles.whyQdsItem },
            React.createElement(Text, { style: styles.whyQdsBullet }, '✓'),
            React.createElement(Text, { style: styles.whyQdsText }, '40+ years serving financial institutions across the country')
          ),
          React.createElement(View, { style: styles.whyQdsItem },
            React.createElement(Text, { style: styles.whyQdsBullet }, '✓'),
            React.createElement(Text, { style: styles.whyQdsText }, 'Comprehensive implementation support and training programs')
          ),
          React.createElement(View, { style: styles.whyQdsItem },
            React.createElement(Text, { style: styles.whyQdsBullet }, '✓'),
            React.createElement(Text, { style: styles.whyQdsText }, 'Dedicated service team with industry-leading response times')
          ),
          React.createElement(View, { style: styles.whyQdsItem },
            React.createElement(Text, { style: styles.whyQdsBullet }, '✓'),
            React.createElement(Text, { style: styles.whyQdsText }, 'Partnership with leading TCR manufacturers for best-in-class equipment')
          )
        )
      ),

      // Continue Your Journey - Resources (show all 6)
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'Continue Your Journey'),
        React.createElement(View, { style: styles.resourcesGrid },
          ...QDS_RESOURCES.map((resource, index) =>
            React.createElement(View, { key: index, style: styles.resourceCard },
              React.createElement(Text, { style: styles.resourceType },
                resource.type === 'guide' ? 'Ultimate Guide' : resource.type === 'product' ? 'Product Info' : 'Blog Article'
              ),
              React.createElement(Text, { style: styles.resourceTitle }, resource.title),
              React.createElement(Text, { style: styles.resourceDesc }, resource.description),
              React.createElement(Text, { style: styles.resourceUrl }, resource.url)
            )
          )
        )
      ),

      // CTA
      React.createElement(View, { style: styles.ctaBox },
        React.createElement(Text, { style: styles.ctaTitle }, 'Ready to Start a Conversation?'),
        React.createElement(Text, { style: styles.ctaSubtext },
          'Our team is ready to help you implement TCR technology and achieve these savings.'
        ),
        React.createElement(Text, { style: styles.ctaUrl }, QDS_CONTACT_URL)
      ),

      // Footer
      React.createElement(View, { style: styles.footer },
        React.createElement(Text, { style: styles.footerText },
          'Quality Data Systems • Charlotte, NC • Serving financial institutions for 40+ years'
        ),
        React.createElement(Text, { style: { ...styles.footerText, marginTop: 3 } },
          `This analysis uses industry-standard assumptions. TCR capital cost: ${formatCurrency(TCR_CAPITAL_COST)}. Annual TCR cost: ${formatCurrency(ANNUAL_TCR_COST)}.`
        )
      )
    )
  );
}

export async function POST(request: NextRequest) {
  try {
    const body: PDFRequestBody = await request.json();
    const { results, contactInfo, uploadToHubSpot } = body;

    // Validate we have required data
    if (!results || !results.branchData || !results.calculation) {
      console.error('PDF generation error: Missing required data', {
        hasResults: !!results,
        hasBranchData: !!results?.branchData,
        hasCalculation: !!results?.calculation
      });
      return NextResponse.json(
        { error: 'Missing required data for PDF generation' },
        { status: 400 }
      );
    }

    // Safe filename
    const institutionName = results.branchData?.institutionName || 'Report';
    const safeFilename = `TCR-ROI-Report-${institutionName.replace(/[^a-zA-Z0-9-]/g, '-')}.pdf`;

    console.log('Generating PDF for:', institutionName);

    // Generate PDF
    const pdfDoc = React.createElement(ROIReportPDF, { results, contactInfo });
    const pdfBuffer = await ReactPDF.renderToBuffer(pdfDoc as any);

    console.log('PDF generated successfully, size:', pdfBuffer.length);

    // If HubSpot upload is requested and we have an access token
    // Do this BEFORE returning the PDF so it's attached to the contact
    if (uploadToHubSpot && process.env.HUBSPOT_ACCESS_TOKEN && contactInfo.email) {
      try {
        console.log('Starting HubSpot PDF attachment for:', contactInfo.email);

        // Step 1: Look up the contact by email to get their ID
        const contactId = await findHubSpotContactByEmail(contactInfo.email);

        if (contactId) {
          console.log('Found HubSpot contact ID:', contactId);

          // Step 2: Upload file to HubSpot Files
          const fileUploadResult = await uploadToHubSpotFiles(
            pdfBuffer,
            safeFilename,
            contactInfo.email
          );
          console.log('File uploaded to HubSpot, file ID:', fileUploadResult.id);

          // Step 3: Create a note with the PDF attached to the contact
          await createHubSpotNoteWithAttachment(
            contactId,
            fileUploadResult.id,
            results,
            contactInfo
          );
          console.log('PDF attached to contact successfully');
        } else {
          console.log('Contact not found in HubSpot yet (may still be processing)');
        }
      } catch (hubspotError) {
        // Log but don't fail - still return the PDF
        console.error('HubSpot PDF attachment error:', hubspotError);
      }
    }

    // ALWAYS return PDF as download (never return JSON for successful PDF generation)
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    // Return more details in development
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

// Find a HubSpot contact by email and return their ID
async function findHubSpotContactByEmail(email: string): Promise<string | null> {
  const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('HubSpot access token not configured');
  }

  try {
    // Use HubSpot CRM API to search for contact by email
    const response = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts/search`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'email',
                  operator: 'EQ',
                  value: email,
                },
              ],
            },
          ],
          properties: ['email', 'firstname', 'lastname'],
          limit: 1,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('HubSpot contact search error:', error);
      return null;
    }

    const result = await response.json();

    if (result.results && result.results.length > 0) {
      return result.results[0].id;
    }

    return null;
  } catch (error) {
    console.error('Error searching for HubSpot contact:', error);
    return null;
  }
}

// Upload file to HubSpot Files API
async function uploadToHubSpotFiles(
  pdfBuffer: Buffer,
  filename: string,
  contactEmail: string
): Promise<{ id: string; url: string }> {
  const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('HubSpot access token not configured');
  }

  // Create form data for file upload
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(pdfBuffer)], { type: 'application/pdf' });
  formData.append('file', blob, filename);
  formData.append('folderPath', '/roi-calculator-reports');
  formData.append('options', JSON.stringify({
    access: 'PRIVATE',
    overwrite: false,
    duplicateValidationStrategy: 'NONE',
    duplicateValidationScope: 'ENTIRE_PORTAL',
  }));

  const response = await fetch('https://api.hubapi.com/files/v3/files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HubSpot Files API error: ${error}`);
  }

  const result = await response.json();
  return { id: result.id, url: result.url };
}

// Create a note in HubSpot with the PDF attached
async function createHubSpotNoteWithAttachment(
  contactId: string,
  fileId: string,
  results: PDFRequestBody['results'],
  contactInfo: PDFRequestBody['contactInfo']
): Promise<void> {
  const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error('HubSpot access token not configured');
  }

  const noteBody = `
TCR ROI Calculator Report

Institution: ${results.branchData.institutionName}
Branch: ${results.branchData.branchName}
Contact: ${contactInfo.firstName} ${contactInfo.lastName}

Key Results:
• Annual Savings: ${formatCurrency(results.calculation.netAnnualROI)}
• FTE Optimization: ${formatFTE(results.calculation.fteSavings)}
• 5-Year ROI: ${formatCurrency(results.calculation.fiveYearROI)}
• Payback Period: ${results.calculation.paybackPeriodMonths} months

PDF report attached.
  `.trim();

  // Create engagement (note)
  const engagementResponse = await fetch('https://api.hubapi.com/engagements/v1/engagements', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      engagement: {
        active: true,
        type: 'NOTE',
      },
      associations: {
        contactIds: [contactId],
      },
      attachments: [
        { id: fileId },
      ],
      metadata: {
        body: noteBody,
      },
    }),
  });

  if (!engagementResponse.ok) {
    const error = await engagementResponse.text();
    throw new Error(`HubSpot Engagement API error: ${error}`);
  }
}
