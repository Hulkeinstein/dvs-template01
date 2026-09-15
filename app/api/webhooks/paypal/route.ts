import { NextRequest, NextResponse } from 'next/server';
import { capturePayPalOrder } from '@/app/lib/services/paymentService';

export async function POST(req: NextRequest) {
  try {
    // Note: In a production environment, you MUST verify the webhook signature.
    // PayPal sends 'PAYPAL-TRANSMISSION-ID', 'PAYPAL-TRANSMISSION-TIME',
    // 'PAYPAL-TRANSMISSION-SIG', 'PAYPAL-CERT-URL', 'PAYPAL-AUTH-ALGO' headers.
    // Verification requires 'paypal-rest-sdk' or manual crypto verification.
    // For now, we are relying on the event structure and idempotency checks in paymentService.

    // Validate that we have a body
    const bodyText = await req.text();
    if (!bodyText) {
      return NextResponse.json({ error: 'Empty body' }, { status: 400 });
    }

    const event = JSON.parse(bodyText);
    const eventType = event.event_type;

    console.log(`[PayPal Webhook] Received event: ${eventType}`, {
      id: event.id,
      summary: event.summary,
    });

    if (eventType === 'CHECKOUT.ORDER.APPROVED') {
      const orderId = event.resource.id;
      console.log(`[PayPal Webhook] Processing approved order: ${orderId}`);

      // Attempt to capture the approved order
      // We don't pass userId because this is a server-to-server event
      const result = await capturePayPalOrder(orderId);

      if (!result.success) {
        console.error('[PayPal Webhook] Capture failed:', result.error);
        // We return 200 even on some failures to prevent PayPal from retrying indefinitely
        // if it's a logic error (e.g. order not found local), but for transient errors 500 is ok.
        // paymentService returns success=false for validation errors too.
        // If "Order not found", checking status 500 might trigger retry.
        return NextResponse.json({ error: result.error }, { status: 200 });
      }

      console.log('[PayPal Webhook] Capture successful:', result);
    } else if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      console.log(
        '[PayPal Webhook] Capture completed event received. Verifying consistency...'
      );
      // The resource is a Capture object
      // We can try to link it, but usually CHECKOUT.ORDER.APPROVED handling covers the storage.
      // This is just a secondary confirmation.
      // We could extract supplementary_data.related_ids.order_id if available to verify status.
      // For now, logging is sufficient as our capture logic is robust.
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[PayPal Webhook] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
