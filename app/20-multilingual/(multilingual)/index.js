"use client";

import { Provider } from "react-redux";
import Context from "@/context/Context";
import Store from "@/redux/store";

import MobileMenu from "@/components/Header/MobileMenu";
import Cart from "@/components/Header/Offcanvas/Cart";
import FooterOne from "@/components/Footer/Footer-One";
import Multilingual from "@/components/20-multilingual/Multilingual";
import HeaderStyleFive from "@/components/Header/HeaderStyle-Five";

const MultilingualPage = ({ getAllBlogs }) => {
  return (
    <>
      <Provider store={Store}>
        <Context>
          <MobileMenu />
          <HeaderStyleFive headerType="" />

          <Multilingual blogdata={getAllBlogs} />
          <Cart />

          <FooterOne newsletterBorder={true} />
        </Context>
      </Provider>
    </>
  );
};

export default MultilingualPage;
