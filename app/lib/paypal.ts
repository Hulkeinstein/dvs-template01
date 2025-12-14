import paypal from '@paypal/checkout-server-sdk';

/**
 * PayPal SDK Configuration
 *
 * Environment variables required:
 * - PAYPAL_CLIENT_ID: PayPal client ID
 * - PAYPAL_CLIENT_SECRET: PayPal client secret
 * - NODE_ENV: 'production' for Live, otherwise Sandbox
 */

/**
 * Check if PayPal is enabled
 * @returns true if PayPal credentials are configured
 */
export function isPayPalEnabled(): boolean {
  const clientId = process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  return !!(clientId && clientSecret);
}

/**
 * Get PayPal environment (Sandbox or Live)
 */
function getPayPalEnvironment():
  | paypal.core.SandboxEnvironment
  | paypal.core.LiveEnvironment {
  const clientId =
    process.env.PAYPAL_CLIENT_ID ||
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
    '';
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';

  if (process.env.NODE_ENV === 'production') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  }

  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

/**
 * PayPal HTTP Client
 * Singleton instance for making PayPal API requests
 */
export const paypalClient = new paypal.core.PayPalHttpClient(
  getPayPalEnvironment()
);
