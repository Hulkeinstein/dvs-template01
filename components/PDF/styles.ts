import { StyleSheet } from '@react-pdf/renderer';

// Design tokens (기존 스타일 기반)
export const tokens = {
  colors: {
    primary: '#2563eb',
    success: '#10b981',
    text: '#0f172a',
    muted: '#64748b',
    border: '#e2e8f0',
    light: '#f8fafc',
    lightBlue: '#e0e7ff',
    lightGreen: '#ecfdf5',
    greenText: '#047857',
  },
  space: {
    xs: 3,
    sm: 5,
    md: 9,
    lg: 13,
    xl: 20,
    '2xl': 24,
    '3xl': 35,
  },
  fontSize: {
    xs: 8,
    sm: 9,
    base: 10.5,
    md: 11,
    lg: 12,
    xl: 14,
    '2xl': 17,
    '3xl': 24,
  },
  radius: {
    sm: 4,
    md: 8,
  },
};

export const styles = StyleSheet.create({
  // Page
  page: {
    padding: tokens.space['3xl'],
    fontSize: tokens.fontSize.base,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },

  // Header
  header: {
    backgroundColor: tokens.colors.primary,
    marginBottom: tokens.space.xl,
    padding: 16,
    marginLeft: -tokens.space['3xl'],
    marginRight: -tokens.space['3xl'],
    marginTop: -tokens.space['3xl'],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoImage: {
    height: 38,
    width: 'auto',
  },
  receiptTitle: {
    fontSize: tokens.fontSize.xl,
    color: tokens.colors.lightBlue,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: 'bold',
  },

  // Info cards
  infoCard: {
    backgroundColor: tokens.colors.light,
    padding: tokens.space.lg,
    marginBottom: tokens.space.md,
    borderRadius: tokens.radius.md,
    borderLeft: '4 solid #2563eb',
  },
  infoCardTitle: {
    fontSize: tokens.fontSize.sm,
    color: tokens.colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: tokens.space.sm,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: tokens.space.md,
  },
  label: {
    fontSize: tokens.fontSize.base,
    color: tokens.colors.muted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: 'bold',
  },
  value: {
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.text,
    fontWeight: 'normal',
  },
  valueHighlight: {
    fontSize: tokens.fontSize.lg,
    color: tokens.colors.primary,
    fontWeight: 'bold',
  },

  // Table
  table: {
    marginTop: 18,
    marginBottom: 18,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingVertical: 9,
    paddingHorizontal: 11,
    borderRadius: tokens.radius.sm,
    marginBottom: 2,
  },
  tableHeaderText: {
    fontWeight: 'bold',
    fontSize: tokens.fontSize.sm,
    textTransform: 'uppercase',
    color: '#475569',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 11,
    paddingHorizontal: 11,
    borderBottom: '1 solid #e2e8f0',
  },
  tableRowEven: {
    flexDirection: 'row',
    paddingVertical: 11,
    paddingHorizontal: 11,
    backgroundColor: tokens.colors.light,
    borderBottom: '1 solid #e2e8f0',
  },
  tableCol1: {
    flex: 3,
    fontSize: tokens.fontSize.md,
    color: tokens.colors.text,
  },
  tableCol2: {
    flex: 1,
    fontSize: tokens.fontSize.md,
    textAlign: 'center',
    color: '#475569',
  },
  tableCol3: {
    flex: 1,
    fontSize: tokens.fontSize.md,
    textAlign: 'right',
    color: '#475569',
  },
  tableCol4: {
    flex: 1,
    fontSize: tokens.fontSize.md,
    textAlign: 'right',
    color: tokens.colors.text,
    fontWeight: 'bold',
  },

  // Totals section
  totalSection: {
    marginTop: 18,
    backgroundColor: tokens.colors.light,
    padding: 16,
    borderRadius: tokens.radius.md,
    borderTop: '3 solid #2563eb',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 9,
  },
  totalLabel: {
    fontSize: tokens.fontSize.md,
    marginRight: 30,
    width: 100,
    textAlign: 'right',
    color: '#475569',
  },
  totalValue: {
    fontSize: tokens.fontSize.md,
    width: 120,
    textAlign: 'right',
    color: tokens.colors.text,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingTop: 12,
    borderTop: '2 solid #cbd5e1',
  },
  grandTotal: {
    fontWeight: 'bold',
    fontSize: 16,
    color: tokens.colors.primary,
  },

  // Payment badge
  paymentBadge: {
    marginTop: 14,
    padding: tokens.space.lg,
    backgroundColor: tokens.colors.lightGreen,
    borderRadius: tokens.radius.md,
    borderLeft: '4 solid #10b981',
  },
  paymentTitle: {
    fontSize: tokens.fontSize.base,
    color: tokens.colors.greenText,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 7,
    fontWeight: 'bold',
  },

  // Thank you section
  thankYou: {
    fontSize: tokens.fontSize['2xl'],
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: tokens.space['2xl'],
    marginBottom: 9,
    color: tokens.colors.primary,
    letterSpacing: 0.5,
  },
  thankYouSubtext: {
    fontSize: tokens.fontSize.base,
    textAlign: 'center',
    color: tokens.colors.muted,
    marginBottom: 35,
  },

  // Divider line
  divider: {
    borderBottom: '1 solid #cbd5e1',
    marginHorizontal: 60,
    marginBottom: 12,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 25,
    left: tokens.space['3xl'],
    right: tokens.space['3xl'],
    textAlign: 'center',
  },
  footerText: {
    fontSize: tokens.fontSize.sm,
    color: '#94a3b8',
    marginBottom: 5,
    lineHeight: 1.5,
  },
  footerBrand: {
    fontSize: 10.5,
    color: tokens.colors.primary,
    fontWeight: 'bold',
    marginBottom: 7,
    marginTop: 4,
  },
});
