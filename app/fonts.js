import {
  Source_Serif_4,
  Nanum_Gothic,
  Nanum_Myeongjo,
  Noto_Sans_KR,
  Gothic_A1,
  Jua,
  Do_Hyeon,
} from 'next/font/google';

// Source Serif Pro 폰트 설정
export const sourceSerif = Source_Serif_4({
  weight: ['400', '600', '700', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-source-serif',
});

// 한국어 폰트들 설정
export const nanumGothic = Nanum_Gothic({
  weight: ['400', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nanum-gothic',
});

export const nanumMyeongjo = Nanum_Myeongjo({
  weight: ['400', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nanum-myeongjo',
});

export const notoSansKR = Noto_Sans_KR({
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans-kr',
});

export const gothicA1 = Gothic_A1({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-gothic-a1',
});

export const jua = Jua({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jua',
});

export const doHyeon = Do_Hyeon({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-do-hyeon',
});

// 모든 폰트 클래스를 결합
export const fontClassNames = `${sourceSerif.variable} ${nanumGothic.variable} ${nanumMyeongjo.variable} ${notoSansKR.variable} ${gothicA1.variable} ${jua.variable} ${doHyeon.variable}`;
