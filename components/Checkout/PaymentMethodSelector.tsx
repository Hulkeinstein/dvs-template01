import React from 'react';

interface PaymentMethod {
  id: string;
  value: string;
  label: string;
  description: string;
  icon?: string;
}

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  showPayLater?: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'payment_stripe',
    value: 'stripe',
    label: 'Credit/Debit Card (Stripe)',
    description: 'Pay securely with your credit or debit card through Stripe. Your payment information is encrypted and secure.',
    icon: 'feather-credit-card',
  },
  {
    id: 'payment_paypal',
    value: 'paypal',
    label: 'PayPal',
    description: 'Pay with your PayPal account. You will be redirected to PayPal to complete your payment securely.',
    icon: 'feather-dollar-sign',
  },
  {
    id: 'payment_cash',
    value: 'cash',
    label: 'Pay Later',
    description: 'Reserve your course now and pay later. Your enrollment will be confirmed, and you can access the course after payment is completed.',
    icon: 'feather-clock',
  },
];

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange,
  showPayLater = true,
}) => {
  const displayMethods = showPayLater
    ? paymentMethods
    : paymentMethods.filter(m => m.value !== 'cash');

  return (
    <div className="checkout-payment-method accordion rbt-accordion-style rbt-accordion-05 accordion" id="accordionExamplea1">
      {displayMethods.map((method, index) => (
        <div key={method.id} className="single-method">
          <input
            type="radio"
            id={method.id}
            name="payment-method"
            value={method.value}
            checked={selectedMethod === method.value}
            onChange={(e) => onMethodChange(e.target.value)}
          />
          <label
            htmlFor={method.id}
            data-bs-toggle="collapse"
            data-bs-target={`#${method.value}`}
            aria-expanded={selectedMethod === method.value}
            aria-controls={method.value}
          >
            {method.icon && <i className={`${method.icon} me-2`}></i>}
            {method.label}
          </label>
          <div
            className={`accordion-collapse collapse ${selectedMethod === method.value ? 'show' : ''}`}
            id={method.value}
            aria-labelledby={`heading${index + 1}`}
            data-bs-parent="#accordionExamplea1"
          >
            <div className="accordion-body">
              {method.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PaymentMethodSelector;