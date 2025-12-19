'use client';

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  pdf,
} from '@react-pdf/renderer';
import { CalculatorResults, ContactInfo } from '@/lib/types';
import { formatCurrency, formatFTE, formatNumber } from '@/lib/calculations';
import {
  TRANSACTIONS_PER_FTE_MONTHLY,
  ANNUAL_TCR_COST,
  TCR_CAPITAL_COST,
  PAIN_POINTS,
  QDS_CONTACT_URL,
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
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.navy,
  },
  logo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.navy,
  },
  logoSubtitle: {
    fontSize: 10,
    color: colors.gray,
  },
  date: {
    fontSize: 9,
    color: colors.gray,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.navy,
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 25,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.navy,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  roiBox: {
    backgroundColor: colors.navy,
    padding: 25,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  roiLabel: {
    fontSize: 10,
    color: colors.sky,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  roiValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.white,
    marginTop: 5,
  },
  roiSubtext: {
    fontSize: 10,
    color: colors.sky,
    marginTop: 5,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.lightGray,
    padding: 15,
    borderRadius: 6,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 8,
    color: colors.gray,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    marginTop: 3,
  },
  table: {
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 8,
  },
  tableRowHighlight: {
    flexDirection: 'row',
    backgroundColor: colors.lightGray,
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderRadius: 4,
  },
  tableLabel: {
    flex: 1,
    fontSize: 10,
    color: colors.gray,
  },
  tableValue: {
    flex: 1,
    fontSize: 10,
    color: colors.black,
    textAlign: 'right',
    fontFamily: 'Courier',
  },
  tableValueBold: {
    flex: 1,
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.navy,
    textAlign: 'right',
    fontFamily: 'Courier',
  },
  inputGrid: {
    flexDirection: 'row',
    backgroundColor: colors.lightGray,
    padding: 15,
    borderRadius: 6,
  },
  inputItem: {
    flex: 1,
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 8,
    color: colors.gray,
  },
  inputValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.black,
    marginTop: 3,
  },
  painPointsBox: {
    backgroundColor: '#f0fdfa',
    padding: 15,
    borderRadius: 6,
  },
  painPointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  painPointBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.teal,
    marginRight: 10,
  },
  painPointText: {
    fontSize: 10,
    color: colors.black,
  },
  ctaBox: {
    backgroundColor: colors.teal,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  ctaTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
  },
  ctaSubtext: {
    fontSize: 10,
    color: colors.white,
    opacity: 0.8,
    marginTop: 5,
    textAlign: 'center',
  },
  ctaUrl: {
    fontSize: 9,
    color: colors.white,
    marginTop: 10,
    textDecoration: 'underline',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 15,
  },
  footerText: {
    fontSize: 8,
    color: colors.gray,
    textAlign: 'center',
  },
  disclaimerText: {
    fontSize: 7,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 5,
  },
  noSavingsBox: {
    backgroundColor: '#fef3c7',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  noSavingsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
  },
  noSavingsText: {
    fontSize: 10,
    color: '#a16207',
    marginTop: 5,
    textAlign: 'center',
  },
});

interface PDFReportProps {
  results: CalculatorResults;
  contactInfo: Partial<ContactInfo>;
}

// PDF Document Component
function ROIReportDocument({ results, contactInfo }: PDFReportProps) {
  const { branchData, calculation, timestamp } = results;
  const date = new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Get readable pain point labels
  const painPointLabels = (branchData.painPoints || [])
    .map((id) => PAIN_POINTS.find((p) => p.id === id)?.label || id)
    .filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>Quality Data Systems</Text>
            <Text style={styles.logoSubtitle}>TCR ROI Calculator</Text>
          </View>
          <Text style={styles.date}>Generated: {date}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>TCR ROI Analysis</Text>
        <Text style={styles.subtitle}>
          {branchData.institutionName} - {branchData.branchName}
        </Text>

        {/* Prepared For */}
        {contactInfo.firstName && (
          <Text style={{ fontSize: 10, color: colors.gray, textAlign: 'center', marginBottom: 20 }}>
            Prepared for: {contactInfo.firstName} {contactInfo.lastName}
          </Text>
        )}

        {/* Main ROI Result */}
        {calculation.hasPositiveROI ? (
          <View style={styles.roiBox}>
            <Text style={styles.roiLabel}>Estimated Annual ROI</Text>
            <Text style={styles.roiValue}>{formatCurrency(calculation.netAnnualROI)}</Text>
            <Text style={styles.roiSubtext}>
              Based on {formatFTE(calculation.fteSavings)} FTE optimization
            </Text>
          </View>
        ) : (
          <View style={styles.noSavingsBox}>
            <Text style={styles.noSavingsTitle}>Limited Direct Savings Identified</Text>
            <Text style={styles.noSavingsText}>
              {calculation.isUnderstaffed
                ? 'Your branch may benefit from TCR to handle workload more efficiently.'
                : 'Your branch is at minimum staffing. TCR can still improve efficiency.'}
            </Text>
          </View>
        )}

        {/* Key Metrics */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Monthly Savings</Text>
            <Text style={styles.metricValue}>{formatCurrency(calculation.monthlyROI)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>FTE Savings</Text>
            <Text style={styles.metricValue}>{formatFTE(calculation.fteSavings)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>5-Year ROI</Text>
            <Text style={styles.metricValue}>{formatCurrency(calculation.fiveYearROI)}</Text>
          </View>
        </View>

        {/* Calculation Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calculation Breakdown</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Transaction Analysis</Text>
              <Text style={styles.tableValue}>
                {formatNumber(branchData.monthlyTransactions)} ÷ {formatNumber(TRANSACTIONS_PER_FTE_MONTHLY)} = {formatFTE(calculation.recommendedFTEs)} FTEs
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Staff Optimization</Text>
              <Text style={styles.tableValue}>
                {branchData.currentFTEs} − {formatFTE(calculation.recommendedFTEs)} = {formatFTE(calculation.fteSavings)} FTE reduction
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Annual Labor Savings</Text>
              <Text style={styles.tableValue}>
                {formatFTE(calculation.fteSavings)} × {formatCurrency(branchData.annualFTECost)} = {formatCurrency(calculation.annualLaborSavings)}
              </Text>
            </View>
            <View style={styles.tableRowHighlight}>
              <Text style={{ ...styles.tableLabel, fontWeight: 'bold', color: colors.black }}>Net Annual ROI</Text>
              <Text style={styles.tableValueBold}>
                {formatCurrency(calculation.annualLaborSavings)} − {formatCurrency(ANNUAL_TCR_COST)} = {formatCurrency(calculation.netAnnualROI)}
              </Text>
            </View>
          </View>
        </View>

        {/* Input Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Input Summary</Text>
          <View style={styles.inputGrid}>
            <View style={styles.inputItem}>
              <Text style={styles.inputLabel}>Monthly Transactions</Text>
              <Text style={styles.inputValue}>{formatNumber(branchData.monthlyTransactions)}</Text>
            </View>
            <View style={styles.inputItem}>
              <Text style={styles.inputLabel}>Current Staff (FTEs)</Text>
              <Text style={styles.inputValue}>{branchData.currentFTEs}</Text>
            </View>
            <View style={styles.inputItem}>
              <Text style={styles.inputLabel}>Annual FTE Cost</Text>
              <Text style={styles.inputValue}>{formatCurrency(branchData.annualFTECost)}</Text>
            </View>
          </View>
        </View>

        {/* Pain Points */}
        {painPointLabels.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Challenges to Address</Text>
            <View style={styles.painPointsBox}>
              {painPointLabels.map((label, index) => (
                <View key={index} style={styles.painPointItem}>
                  <View style={styles.painPointBullet} />
                  <Text style={styles.painPointText}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* CTA */}
        <View style={styles.ctaBox}>
          <Text style={styles.ctaTitle}>Ready to Start a Conversation?</Text>
          <Text style={styles.ctaSubtext}>
            Our team is ready to help you implement TCR technology at your institution.
          </Text>
          <Text style={styles.ctaUrl}>{QDS_CONTACT_URL}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Quality Data Systems • Charlotte, NC • Serving financial institutions for 40+ years
          </Text>
          <Text style={styles.disclaimerText}>
            This analysis is based on the information provided and uses industry-standard assumptions.
            Actual results may vary. TCR capital cost: {formatCurrency(TCR_CAPITAL_COST)}. Annual TCR cost: {formatCurrency(ANNUAL_TCR_COST)}.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

// Function to generate and download PDF
export async function generatePDFReport(
  results: CalculatorResults,
  contactInfo: Partial<ContactInfo>
): Promise<Blob> {
  const doc = <ROIReportDocument results={results} contactInfo={contactInfo} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}

// Function to trigger download
export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export { ROIReportDocument };
