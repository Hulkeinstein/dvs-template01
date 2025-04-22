"use client";

import { Provider } from "react-redux";
import Context from "@/context/Context";
import Store from "@/redux/store";

import MobileMenu from "@/components/Header/MobileMenu";
import Cart from "@/components/Header/Offcanvas/Cart";
import HeaderStyleSix from "@/components/Header/HeaderStyle-Six";
import FooterThree from "@/components/Footer/Footer-Three";
import ArtDesignSchool from "@/components/21-art-design-school/ArtDesignSchool";

const ArtDesignSchoolPage = ({ getAllBlogs }) => {
  return (
    <>
      <Provider store={Store}>
        <Context>
          <MobileMenu />
          <HeaderStyleSix headerType="" />

          <ArtDesignSchool blogdata={getAllBlogs} />
          <Cart />

          <FooterThree />
        </Context>
      </Provider>
    </>
  );
};

export default ArtDesignSchoolPage;
