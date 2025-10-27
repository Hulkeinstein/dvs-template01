import React from 'react';
import { View, Text, Image } from '@react-pdf/renderer';
import { styles } from './styles';

interface ReceiptHeaderProps {
  logoBase64?: string;
  receiptNumber?: string;
}

export const ReceiptHeader: React.FC<ReceiptHeaderProps> = ({ logoBase64 }) => {
  return (
    <View style={styles.header}>
      {logoBase64 && <Image src={logoBase64} style={styles.logoImage} />}
      <Text style={styles.receiptTitle}>RECEIPT</Text>
    </View>
  );
};
