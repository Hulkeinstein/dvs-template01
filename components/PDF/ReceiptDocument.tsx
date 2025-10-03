import React from 'react';
import { Document, Page } from '@react-pdf/renderer';
import { styles } from './styles';
import { ReceiptHeader } from './ReceiptHeader';
import { ReceiptInfoCards } from './ReceiptInfoCards';
import { ReceiptTable } from './ReceiptTable';
import { ReceiptTotals } from './ReceiptTotals';
import { ReceiptPayment } from './ReceiptPayment';
import { ReceiptFooter } from './ReceiptFooter';
import type { ReceiptProps } from './types';

export const ReceiptDocument: React.FC<ReceiptProps> = ({
  order,
  logoBase64,
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <ReceiptHeader logoBase64={logoBase64} />

        <ReceiptInfoCards order={order} />

        <ReceiptTable items={order.items} />

        <ReceiptTotals
          subtotal={order.subtotal}
          tax={order.tax}
          total={order.total}
        />

        <ReceiptPayment payment={order.payment} />

        <ReceiptFooter />
      </Page>
    </Document>
  );
};
