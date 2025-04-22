"use client";

import { Provider } from "react-redux";
import Context from "@/context/Context";
import Store from "@/redux/store";

import MobileMenu from "@/components/Header/MobileMenu";
import Cart from "@/components/Header/Offcanvas/Cart";
import FooterOne from "@/components/Footer/Footer-One";
import OnlineAcademy from "@/components/17-online-academy/OnlineAcademy";
import HeaderTypeFour from "@/components/Header/package/HeaderType-Container-Four";

const OnlineAcademyPage = ({ getAllBlogs }) => {
  return (
    <>
      <Provider store={Store}>
        <Context>
          <MobileMenu />
          <HeaderTypeFour headerSticky="rbt-sticky" headerType="" />
          <OnlineAcademy blogdata={getAllBlogs} />
          <Cart />

          <FooterOne newsletterBorder={true} />
        </Context>
      </Provider>
    </>
  );
};

export default OnlineAcademyPage;
