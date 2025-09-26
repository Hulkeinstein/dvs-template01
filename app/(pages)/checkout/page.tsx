import { Metadata } from 'next';
import CheckoutPage from './(checkout)';

export const metadata: Metadata = {
  title: 'Checkout - Online Courses & Education NEXTJS14 Template',
  description: 'Online Courses & Education NEXTJS14 Template',
};

const CheckoutLayout = (): JSX.Element => {
  return (
    <>
      <CheckoutPage />
    </>
  );
};

export default CheckoutLayout;
