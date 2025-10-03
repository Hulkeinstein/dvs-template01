import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from './styles';

export const ReceiptFooter: React.FC = () => {
  return (
    <View style={styles.footer}>
      <Text style={styles.thankYou}>Thank You for Your Purchase!</Text>
      <Text style={styles.thankYouSubtext}>
        We appreciate your business and hope you enjoy your course.
      </Text>

      <View style={styles.divider} />

      <Text style={styles.footerBrand}>Daniel Vision School</Text>
      <Text style={styles.footerText}>Online Learning Platform</Text>
      <Text style={styles.footerText}>
        support@dvs-education.com | https://dvs-education.com
      </Text>
    </View>
  );
};
