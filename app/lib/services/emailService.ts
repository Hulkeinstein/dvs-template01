import { Resend } from 'resend';

const EMAIL_FROM =
  process.env.EMAIL_FROM || 'DVS Education <onboarding@resend.dev>';

// 키가 없는 환경(CI, Docker 빌드)에서 import만으로 실패하지 않도록 발송 시점에 생성한다
function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(apiKey);
}

export interface OrderItem {
  course_title?: string;
  product?: {
    title?: string;
    courseTitle?: string;
  };
  amount: number;
  validated_price?: number;
  subtotal?: number;
}

interface OrderConfirmationData {
  email: string;
  name: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
}

export async function sendOrderConfirmationEmail(data: OrderConfirmationData) {
  // Create HTML for items table
  const itemsHtml = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">
        ${item.course_title || item.product?.title || item.product?.courseTitle}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.amount}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
        $${(item.validated_price || 0).toFixed(2)}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
        $${(item.subtotal || 0).toFixed(2)}
      </td>
    </tr>
  `
    )
    .join('');

  const paymentMethodDisplay =
    {
      stripe: 'Credit/Debit Card',
      paypal: 'PayPal',
      cash_on_delivery: 'Pay Later',
    }[data.paymentMethod] || data.paymentMethod;

  try {
    const resend = getResendClient();

    await resend.emails.send({
      from: EMAIL_FROM,
      to: data.email,
      subject: `Order Confirmation - ${data.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px 0; background: #f8f9fa;">
            <h1 style="color: #333; margin: 0;">DVS Education</h1>
          </div>

          <div style="padding: 20px;">
            <h2 style="color: #333;">Order Confirmation</h2>
            <p>Dear ${data.name},</p>
            <p>Thank you for your order! Your order has been received and confirmed.</p>

            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Order Details</h3>
              <p><strong>Order Number:</strong> ${data.orderNumber}</p>
              <p><strong>Payment Method:</strong> ${paymentMethodDisplay}</p>
              <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            <h3 style="color: #333;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="padding: 8px; text-align: left;">Course</th>
                  <th style="padding: 8px; text-align: center;">Qty</th>
                  <th style="padding: 8px; text-align: right;">Price</th>
                  <th style="padding: 8px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 8px; text-align: right;"><strong>Subtotal:</strong></td>
                  <td style="padding: 8px; text-align: right;">$${data.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 8px; text-align: right;"><strong>Tax (5%):</strong></td>
                  <td style="padding: 8px; text-align: right;">$${data.tax.toFixed(2)}</td>
                </tr>
                <tr style="background: #f5f5f5;">
                  <td colspan="3" style="padding: 8px; text-align: right;"><strong>Total:</strong></td>
                  <td style="padding: 8px; text-align: right;"><strong>$${data.total.toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </table>

            <div style="margin-top: 30px; padding: 15px; background: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px;">
              <h4 style="margin-top: 0; color: #155724;">🎉 Payment Successful!</h4>
              <p style="color: #155724;">Your payment has been confirmed and your course access is now active.</p>
              <p style="color: #155724;">You can start learning right away!</p>
              <p style="margin-bottom: 0; color: #155724;">
                <a href="${process.env.NEXTAUTH_URL}/student-enrolled-course" style="color: #155724; font-weight: bold;">
                  Start Learning →
                </a>
              </p>
            </div>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

            <div style="text-align: center; color: #666; font-size: 14px;">
              <p>If you have any questions, please contact our support team.</p>
              <p>© ${new Date().getFullYear()} DVS Education. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    });

    console.log(`Order confirmation email sent to ${data.email}`);
    return true;
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return false;
  }
}
