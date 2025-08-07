import { cookies } from 'next/headers';
import React from 'react';

// ========= Core Framework =========
import 'bootstrap/scss/bootstrap.scss';

// ========= Template Main Styles (Bootstrap 오버라이드) =========
import '../public/scss/styles.scss';

// ========= Custom Fonts =========
import '../public/scss/default/euclid-circulara.scss';

// ========= Plugins CSS =========
import '../node_modules/sal.js/dist/sal.css';
import '../public/css/plugins/fontawesome.min.css';
import '../public/css/plugins/feather.css';
import '../public/css/plugins/odometer.css';
import '../public/css/plugins/animation.css';
// euclid-circulara.css 제거 - SCSS와 중복

// ========= Swiper CSS =========
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-cards';
import 'swiper/css/free-mode';
import 'swiper/css/thumbs';

import Providers from './Providers';
import BootstrapClient from './bootstrap-client';

export default function RootLayout({ children }) {
  // 서버에서 쿠키를 읽어 테마 결정
  const theme = cookies().get('theme')?.value || 'light';
  const isDark = theme === 'dark';

  return (
    <html lang="en" dir="ltr" data-theme={theme}>
      <body
        className={isDark ? 'active-dark-mode' : ''}
        suppressHydrationWarning={true}
      >
        <BootstrapClient />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
