'use client';

import React from 'react';
import HeaderStyleTen from '@/components/Header/HeaderStyle-Ten';

import MobileMenu from '@/components/Header/MobileMenu';
import Cart from '@/components/Header/Offcanvas/Cart';
import Separator from '@/components/Common/Separator';
import FooterThree from '@/components/Footer/Footer-Three';

import MainDemo from '@/components/01-Main-Demo/01-Main-Demo';

interface BlogPost {
  id: string | number;
  title: string;
  [key: string]: unknown;
}

interface HomePageLayoutProps {
  getBlog: BlogPost[];
}

const HomePageLayout = ({ getBlog }: HomePageLayoutProps) => {
  return (
    <>
      <MobileMenu />
      <HeaderStyleTen headerSticky="rbt-sticky" />
      <MainDemo blogs={getBlog} />
      <Cart />

      <Separator />
      <FooterThree />
    </>
  );
};

export default HomePageLayout;
