// app/Providers.js
'use client';

import { SessionProvider } from 'next-auth/react';
import { Provider } from 'react-redux';
import Store from '@/redux/store';
import Context from '@/context/Context';

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <Provider store={Store}>
        <Context>{children}</Context>
      </Provider>
    </SessionProvider>
  );
}
