import { renderToBuffer } from '@react-pdf/renderer';
import { ReceiptDocument } from './ReceiptDocument';
import { loadLogoBase64 } from './utils/loadLogo';
import { mapSupabaseOrderToReceipt } from './adapters/supabase';
import type { Order } from './types';

/**
 * Generate PDF receipt from order data
 * @param supabaseOrder - Raw order data from Supabase
 * @returns PDF buffer
 */
export async function generateReceiptPDF(supabaseOrder: any): Promise<Buffer> {
  // Transform Supabase data to PDF order format
  const order: Order = mapSupabaseOrderToReceipt(supabaseOrder);

  // Load logo
  const logoBase64 = loadLogoBase64();

  // Render PDF
  const pdfBuffer = await renderToBuffer(
    <ReceiptDocument order={order} logoBase64={logoBase64} />
  );

  return pdfBuffer;
}

// Export types for external use
export type {
  Order,
  Money,
  Address,
  OrderItem,
  PaymentInfo,
  Seller,
} from './types';
