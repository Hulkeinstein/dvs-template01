import { Metadata } from 'next';
import OrderSuccessPage from './(order-success)';

export const metadata: Metadata = {
  title: 'Order Success - Thank You for Your Purchase',
  description: 'Your order has been successfully placed',
};

const OrderSuccessLayout = (): JSX.Element => {
  return <OrderSuccessPage />;
};

export default OrderSuccessLayout;
