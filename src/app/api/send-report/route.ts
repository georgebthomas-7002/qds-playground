import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { sendReportSchema } from '@/lib/validations';
import { formatCurrency, formatNumber, formatFTE } from '@/lib/calculations';
import {
  TRANSACTIONS_PER_FTE_MONTHLY,
  ANNUAL_TCR_COST,
  TCR_CAPITAL_COST,
} from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the incoming data
    const result = sendReportSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: result.error.errors },
        { status: 400 }
      );
    }

    const { email, results, contactInfo } = result.data;

    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY) {
      console.log('Resend not configured - skipping email');
      return NextResponse.json({
        success: true,
        message: 'Email queued (Resend not configured)',
      });
    }

    // Initialize Resend client
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Generate the email HTML
    const emailHtml = generateEmailHtml(results, contactInfo);

    // Send the email
    const { data, error } = await resend.emails.send({
      from: 'QDS ROI Calculator <noreply@qdsdata.com>',
      to: email,
      subject: `Your TCR ROI Analysis - ${results.branchData.institutionName}`,
      html: emailHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      emailId: data?.id,
    });
  } catch (error) {
    console.error('Send report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateEmailHtml(
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
      hasPositiveROI: boolean;
      isAtMinimumStaff: boolean;
      isUnderstaffed: boolean;
    };
    timestamp: string | Date;
  },
  contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
  }
): string {
  const { branchData, calculation } = results;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TCR ROI Analysis</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
          <!-- Header -->
          <tr>
            <td style="background-color: #1e3a5f; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">TCR ROI Analysis</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 14px;">
                ${branchData.institutionName} - ${branchData.branchName}
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="background-color: #ffffff; padding: 30px;">
              <p style="color: #374151; margin: 0 0 20px 0;">
                Hello ${contactInfo.firstName},
              </p>
              <p style="color: #374151; margin: 0 0 30px 0;">
                Thank you for using the QDS TCR ROI Calculator. Here is your personalized analysis based on the information you provided.
              </p>

              <!-- Key Result -->
              ${
                calculation.hasPositiveROI
                  ? `
              <table role="presentation" style="width: 100%; background-color: #1e3a5f; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                      Estimated Annual ROI
                    </p>
                    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 36px; font-weight: bold; font-family: 'JetBrains Mono', monospace;">
                      ${formatCurrency(calculation.netAnnualROI)}
                    </p>
                    <p style="color: rgba(255,255,255,0.6); margin: 10px 0 0 0; font-size: 14px;">
                      Based on ${formatFTE(calculation.fteSavings)} FTE optimization
                    </p>
                  </td>
                </tr>
              </table>
              `
                  : `
              <table role="presentation" style="width: 100%; background-color: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <p style="color: #92400e; margin: 0; font-size: 16px; font-weight: bold;">
                      Limited Direct Savings Identified
                    </p>
                    <p style="color: #a16207; margin: 10px 0 0 0; font-size: 14px;">
                      ${
                        calculation.isUnderstaffed
                          ? 'Your branch may benefit from TCR to handle workload more efficiently.'
                          : 'Your branch is at minimum staffing. TCR can still improve efficiency.'
                      }
                    </p>
                  </td>
                </tr>
              </table>
              `
              }

              <!-- Metrics Grid -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 15px; background-color: #f9fafb; border-radius: 8px; text-align: center; width: 50%;">
                    <p style="color: #6b7280; margin: 0; font-size: 11px; text-transform: uppercase;">Monthly Savings</p>
                    <p style="color: #111827; margin: 5px 0 0 0; font-size: 20px; font-weight: bold;">
                      ${formatCurrency(calculation.monthlyROI)}
                    </p>
                  </td>
                  <td style="width: 10px;"></td>
                  <td style="padding: 15px; background-color: #f9fafb; border-radius: 8px; text-align: center; width: 50%;">
                    <p style="color: #6b7280; margin: 0; font-size: 11px; text-transform: uppercase;">5-Year ROI</p>
                    <p style="color: #111827; margin: 5px 0 0 0; font-size: 20px; font-weight: bold;">
                      ${formatCurrency(calculation.fiveYearROI)}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Calculation Breakdown -->
              <h2 style="color: #111827; font-size: 16px; margin: 0 0 15px 0;">Calculation Breakdown</h2>
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Transaction Analysis</span>
                  </td>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <span style="color: #111827; font-size: 14px; font-family: monospace;">
                      ${formatNumber(branchData.monthlyTransactions)} ÷ ${formatNumber(TRANSACTIONS_PER_FTE_MONTHLY)} = ${formatFTE(calculation.recommendedFTEs)} FTEs
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Staff Optimization</span>
                  </td>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <span style="color: #111827; font-size: 14px; font-family: monospace;">
                      ${branchData.currentFTEs} − ${formatFTE(calculation.recommendedFTEs)} = ${formatFTE(calculation.fteSavings)} FTE reduction
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-size: 14px;">Annual Labor Savings</span>
                  </td>
                  <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <span style="color: #111827; font-size: 14px; font-family: monospace;">
                      ${formatFTE(calculation.fteSavings)} × ${formatCurrency(branchData.annualFTECost)} = ${formatCurrency(calculation.annualLaborSavings)}
                    </span>
                  </td>
                </tr>
                <tr style="background-color: #f9fafb;">
                  <td style="padding: 12px;">
                    <span style="color: #111827; font-size: 14px; font-weight: bold;">Net Annual ROI</span>
                  </td>
                  <td style="padding: 12px; text-align: right;">
                    <span style="color: #1e3a5f; font-size: 14px; font-weight: bold; font-family: monospace;">
                      ${formatCurrency(calculation.annualLaborSavings)} − ${formatCurrency(ANNUAL_TCR_COST)} = ${formatCurrency(calculation.netAnnualROI)}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Input Summary -->
              <h2 style="color: #111827; font-size: 16px; margin: 0 0 15px 0;">Your Input Summary</h2>
              <table role="presentation" style="width: 100%; background-color: #f9fafb; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 15px;">
                    <p style="color: #6b7280; margin: 0; font-size: 12px;">Monthly Transactions</p>
                    <p style="color: #111827; margin: 5px 0 0 0; font-size: 16px; font-weight: bold;">
                      ${formatNumber(branchData.monthlyTransactions)}
                    </p>
                  </td>
                  <td style="padding: 15px;">
                    <p style="color: #6b7280; margin: 0; font-size: 12px;">Current Staff (FTEs)</p>
                    <p style="color: #111827; margin: 5px 0 0 0; font-size: 16px; font-weight: bold;">
                      ${branchData.currentFTEs}
                    </p>
                  </td>
                  <td style="padding: 15px;">
                    <p style="color: #6b7280; margin: 0; font-size: 12px;">Annual FTE Cost</p>
                    <p style="color: #111827; margin: 5px 0 0 0; font-size: 16px; font-weight: bold;">
                      ${formatCurrency(branchData.annualFTECost)}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" style="width: 100%; background-color: #0d9488; border-radius: 8px;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <p style="color: #ffffff; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">
                      Ready to Discuss Your Options?
                    </p>
                    <p style="color: rgba(255,255,255,0.8); margin: 0 0 20px 0; font-size: 14px;">
                      Our team is ready to help you implement TCR technology at your institution.
                    </p>
                    <a href="mailto:info@qdsdata.com" style="display: inline-block; background-color: #ffffff; color: #0d9488; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">
                      Contact QDS Today
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                Quality Data Systems • Charlotte, NC • Serving financial institutions for 40+ years
              </p>
              <p style="color: #9ca3af; margin: 10px 0 0 0; font-size: 11px;">
                This analysis is based on the information provided and uses industry-standard assumptions.
                Actual results may vary. TCR capital cost: ${formatCurrency(TCR_CAPITAL_COST)}. Annual TCR cost: ${formatCurrency(ANNUAL_TCR_COST)}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
