'use client';

import React from 'react';
import HeaderStyleTen from '@/components/Header/HeaderStyle-Ten';

import MobileMenu from '@/components/Header/MobileMenu';
import Cart from '@/components/Header/Offcanvas/Cart';
import Separator from '@/components/Common/Separator';
import FooterThree from '@/components/Footer/Footer-Three';

import MainDemo from '@/components/01-Main-Demo/01-Main-Demo';

const HomePageLayout = () => {
  return (
    <>
      <MobileMenu />
      <HeaderStyleTen headerSticky="rbt-sticky" />
      <MainDemo />
      <Cart />

      <Separator />
      <FooterThree />
    </>
  );
};

export default HomePageLayout;
