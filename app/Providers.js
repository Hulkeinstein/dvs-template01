// app/Providers.js
'use client';

import { SessionProvider } from 'next-auth/react';
import { Provider } from 'react-redux';
import Store from '@/redux/store';
import Context from '@/context/Context';
import CartProvider from '@/context/CartProvider';

export default function Providers({ children, initialTheme }) {
  return (
    <SessionProvider>
      <Provider store={Store}>
        <CartProvider>
          <Context initialTheme={initialTheme}>{children}</Context>
        </CartProvider>
      </Provider>
    </SessionProvider>
  );
}
