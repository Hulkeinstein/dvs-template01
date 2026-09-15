import React from 'react';

interface CartItem {
  product: {
    id: string;
    title?: string;
    courseTitle?: string;
    price: number;
  };
  amount: number;
}

interface CartSummaryProps {
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount?: number;
  taxRate?: number;
  className?: string;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  items,
  subtotal,
  tax,
  discount = 0,
  taxRate = 0.05,
  className = '',
}) => {
  const grandTotal = subtotal + tax - discount;
  const isFreeOrder = grandTotal === 0;

  return (
    <div className={`checkout-cart-total ${className}`}>
      <h4>
        Product <span>Total</span>
      </h4>

      {/* Product list */}
      <ul>
        {items.map((data, index) => {
          const title =
            data.product.courseTitle || data.product.title || 'Unknown Course';
          const lineTotal = data.product.price * data.amount;

          return (
            <li key={`${data.product.id}-${index}`}>
              <span className="product-name">
                {title}
                {data.amount > 1 && (
                  <span className="quantity"> × {data.amount}</span>
                )}
              </span>
              <span className="product-price">${lineTotal.toFixed(2)}</span>
            </li>
          );
        })}
      </ul>

      {/* Subtotal */}
      <p className="subtotal-row">
        Sub Total
        <span>${subtotal.toFixed(2)}</span>
      </p>

      {/* Discount (if applicable) */}
      {discount > 0 && (
        <p className="discount-row">
          Discount
          <span>-${discount.toFixed(2)}</span>
        </p>
      )}

      {/* Tax */}
      <p className="tax-row">
        Tax ({(taxRate * 100).toFixed(0)}%)
        <span>${tax.toFixed(2)}</span>
      </p>

      {/* Grand Total */}
      <h4 className="mt--30 grand-total">
        Grand Total
        <span className={isFreeOrder ? 'free-badge' : ''}>
          {isFreeOrder ? 'FREE' : `$${grandTotal.toFixed(2)}`}
        </span>
      </h4>

      {/* Free order notice */}
      {isFreeOrder && (
        <div className="alert alert-success mt-3" role="alert">
          <i className="feather-check-circle me-2"></i>
          This is a free order! No payment required.
        </div>
      )}
    </div>
  );
};

export default CartSummary;
