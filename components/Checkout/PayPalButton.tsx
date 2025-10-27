'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

interface PayPalButtonProps {
  courseId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

/**
 * PayPal 결제 버튼 컴포넌트
 *
 * @paypal/react-paypal-js 설치 후 사용 가능
 * 설치 명령어: npm install @paypal/react-paypal-js
 */
export default function PayPalButton({
  courseId,
  onSuccess,
  onError,
}: PayPalButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * PayPal Order 생성
   */
  const createOrder = async (): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/payment/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      return data.paypalOrderId;
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to initialize payment';
      setError(errorMsg);
      onError?.(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * PayPal Order Capture (결제 승인)
   */
  const onApprove = async (data: { orderID: string }): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/payment/paypal/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paypalOrderId: data.orderID,
          orderId: data.orderID, // 실제로는 create-order에서 받은 orderId 사용 필요
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Payment capture failed');
      }

      // 성공 콜백 실행
      onSuccess?.();

      // 성공 페이지로 리다이렉트
      router.push(`/checkout/success?orderId=${result.orderId}`);
    } catch (err: any) {
      const errorMsg = err.message || 'Payment failed';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 결제 취소 핸들러
   */
  const onCancel = () => {
    setError('Payment was cancelled');
    onError?.('Payment was cancelled by user');
  };

  /**
   * PayPal 에러 핸들러
   */
  const onPayPalError = (err: any) => {
    console.error('[PayPal] Error:', err);
    const errorMsg = err.message || 'PayPal error occurred';
    setError(errorMsg);
    onError?.(errorMsg);
  };

  // PayPal 클라이언트 ID 확인
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

  if (!paypalClientId) {
    return (
      <div className="alert alert-danger" role="alert">
        <h6 className="mb-2">
          <i className="feather-alert-triangle me-2"></i>
          PayPal Configuration Missing
        </h6>
        <p className="mb-0">
          Please set <code>NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> in your
          environment variables.
        </p>
      </div>
    );
  }

  return (
    <div className="paypal-button-container">
      {error && (
        <div className="alert alert-danger mb-3" role="alert">
          <i className="feather-alert-circle me-2"></i>
          {error}
        </div>
      )}

      {isLoading && (
        <div className="alert alert-info mb-3" role="alert">
          <i className="feather-loader me-2 spin"></i>
          Processing payment...
        </div>
      )}

      <PayPalScriptProvider
        options={{
          clientId: paypalClientId,
          currency: 'USD',
          intent: 'capture',
        }}
      >
        <PayPalButtons
          createOrder={createOrder}
          onApprove={onApprove}
          onCancel={onCancel}
          onError={onPayPalError}
          disabled={isLoading}
          style={{
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
          }}
        />
      </PayPalScriptProvider>

      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
