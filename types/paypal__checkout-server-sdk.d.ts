/**
 * Type definitions for @paypal/checkout-server-sdk
 * Official package: https://www.npmjs.com/package/@paypal/checkout-server-sdk
 *
 * Note: This is a minimal type definition for the SDK.
 * For full type support, refer to PayPal SDK documentation.
 */

declare module '@paypal/checkout-server-sdk' {
  /**
   * Core namespace for PayPal environments and client
   */
  export namespace core {
    /**
     * PayPal Sandbox Environment
     */
    export class SandboxEnvironment {
      constructor(clientId: string, clientSecret: string);
    }

    /**
     * PayPal Live Environment
     */
    export class LiveEnvironment {
      constructor(clientId: string, clientSecret: string);
    }

    /**
     * PayPal HTTP Client for making API requests
     */
    export class PayPalHttpClient {
      constructor(environment: SandboxEnvironment | LiveEnvironment);
      execute<T = any>(
        request: any
      ): Promise<{ result: T; statusCode: number }>;
    }
  }

  /**
   * Orders namespace for order-related operations
   */
  export namespace orders {
    /**
     * Request to create a PayPal order
     */
    export class OrdersCreateRequest {
      prefer(value: string): void;
      headers: Record<string, string>;
      requestBody(body: any): void;
    }

    /**
     * Request to capture a PayPal order
     */
    export class OrdersCaptureRequest {
      constructor(orderId: string);
      headers: Record<string, string>;
      requestBody(body: any): void;
    }
  }
}
