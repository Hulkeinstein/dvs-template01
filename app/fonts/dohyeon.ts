import localFont from 'next/font/local';

export const dohyeon = localFont({
  src: '../../public/fonts/Dohyeon-Regular.woff2',
  weight: '400',
  style: 'normal',
  display: 'swap',
  preload: true,
  variable: '--font-dohyeon',
});
