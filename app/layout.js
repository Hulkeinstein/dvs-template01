import { cookies } from 'next/headers';
import React from "react";

import "bootstrap/scss/bootstrap.scss";
import "../public/scss/default/euclid-circulara.scss";
import Providers from './Providers'; 


// ========= Plugins CSS START =========
import "../node_modules/sal.js/dist/sal.css";
import "../public/css/plugins/fontawesome.min.css";
import "../public/css/plugins/feather.css";
import "../public/css/plugins/odometer.css";
import "../public/css/plugins/animation.css";
import "../public/css/plugins/euclid-circulara.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-cards";
import "swiper/css/free-mode";
import "swiper/css/thumbs";
// ========= Plugins CSS END =========

import "../public/scss/styles.scss";
import BootstrapClient from './bootstrap-client';

export default function RootLayout({ children }) {
  // 서버에서 쿠키를 읽어 테마 결정
  const theme = cookies().get('theme')?.value || 'light';
  const isDark = theme === 'dark';

  return (
    <html lang="en" dir="ltr" data-theme={theme}>
      <body className={isDark ? "active-dark-mode" : ""} suppressHydrationWarning={true}>
        <BootstrapClient />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
