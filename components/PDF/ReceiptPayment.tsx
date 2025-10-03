import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from './styles';
import type { PaymentInfo } from './types';

interface ReceiptPaymentProps {
  payment?: PaymentInfo;
}

export const ReceiptPayment: React.FC<ReceiptPaymentProps> = ({ payment }) => {
  if (!payment) return null;

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.paymentBadge}>
      <Text style={styles.paymentTitle}>Payment Information</Text>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Method</Text>
          <Text style={styles.value}>{payment.method}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Transaction ID</Text>
          <Text style={styles.value}>{payment.transactionId || '-'}</Text>
        </View>
      </View>

      {payment.paidAt && (
        <View style={{ marginTop: 9 }}>
          <Text style={styles.label}>Paid At</Text>
          <Text style={styles.value}>{formatDate(payment.paidAt)}</Text>
        </View>
      )}
    </View>
  );
};
