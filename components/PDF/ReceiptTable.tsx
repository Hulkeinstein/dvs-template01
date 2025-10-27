import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from './styles';
import type { OrderItem, Money } from './types';

interface ReceiptTableProps {
  items: OrderItem[];
}

export const ReceiptTable: React.FC<ReceiptTableProps> = ({ items }) => {
  const formatMoney = (money: Money) => {
    const symbol = money.currency === 'USD' ? '$' : money.currency;
    return `${symbol}${money.value.toFixed(2)}`;
  };

  return (
    <View style={styles.table}>
      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderText, styles.tableCol1]}>
          Description
        </Text>
        <Text style={[styles.tableHeaderText, styles.tableCol2]}>Qty</Text>
        <Text style={[styles.tableHeaderText, styles.tableCol3]}>
          Unit Price
        </Text>
        <Text style={[styles.tableHeaderText, styles.tableCol4]}>Amount</Text>
      </View>

      {/* Table Rows */}
      {items.map((item, index) => (
        <View
          key={item.id}
          style={index % 2 === 0 ? styles.tableRow : styles.tableRowEven}
        >
          <Text style={styles.tableCol1}>{item.name}</Text>
          <Text style={styles.tableCol2}>{item.qty}</Text>
          <Text style={styles.tableCol3}>{formatMoney(item.unitPrice)}</Text>
          <Text style={styles.tableCol4}>{formatMoney(item.total)}</Text>
        </View>
      ))}
    </View>
  );
};
