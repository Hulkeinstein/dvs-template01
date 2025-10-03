import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from './styles';
import type { Order } from './types';

interface ReceiptInfoCardsProps {
  order: Order;
}

export const ReceiptInfoCards: React.FC<ReceiptInfoCardsProps> = ({
  order,
}) => {
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.row}>
      {/* Order Details Card */}
      <View style={{ flex: 1, marginRight: 9 }}>
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Order Details</Text>
          <View>
            <Text style={styles.label}>Order Number</Text>
            <Text style={styles.valueHighlight}>{order.number}</Text>
          </View>
          <View style={{ marginTop: 9 }}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>{formatDate(order.createdAt)}</Text>
          </View>
        </View>
      </View>

      {/* Bill To Card */}
      <View style={{ flex: 1 }}>
        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Bill To</Text>
          <View>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{order.billTo.name}</Text>
          </View>
          <View style={{ marginTop: 9 }}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{order.billTo.line1}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
