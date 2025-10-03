import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from './styles';
import type { Money } from './types';

interface ReceiptTotalsProps {
  subtotal: Money;
  tax?: Money;
  total: Money;
}

export const ReceiptTotals: React.FC<ReceiptTotalsProps> = ({
  subtotal,
  tax,
  total,
}) => {
  const formatMoney = (money: Money) => {
    const symbol = money.currency === 'USD' ? '$' : money.currency;
    return `${symbol}${money.value.toFixed(2)}`;
  };

  return (
    <View style={styles.totalSection}>
      {/* Subtotal */}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Subtotal:</Text>
        <Text style={styles.totalValue}>{formatMoney(subtotal)}</Text>
      </View>

      {/* Tax */}
      {tax && (
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tax (5%):</Text>
          <Text style={styles.totalValue}>{formatMoney(tax)}</Text>
        </View>
      )}

      {/* Total */}
      <View style={styles.grandTotalRow}>
        <Text style={[styles.totalLabel, styles.grandTotal]}>Total:</Text>
        <Text style={[styles.totalValue, styles.grandTotal]}>
          {formatMoney(total)}
        </Text>
      </View>
    </View>
  );
};
