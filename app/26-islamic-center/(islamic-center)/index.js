"use client";

import { Provider } from "react-redux";
import Context from "@/context/Context";
import Store from "@/redux/store";
import { ParallaxProvider } from "react-scroll-parallax";

import MobileMenu from "@/components/Header/MobileMenu";
import Cart from "@/components/Header/Offcanvas/Cart";
import FooterOne from "@/components/Footer/Footer-One";
import IslamicCenter from "@/components/26-islamic-center/IslamicCenter";
import HeaderStyleThirteen from "@/components/Header/HeaderStyle-Thirteen";

const IslamicCenterPage = ({ getAllBlogs }) => {
  return (
    <>
      <Provider store={Store}>
        <Context>
          <MobileMenu />
          <HeaderStyleThirteen headerSticky="rbt-sticky" headerType="" />

          <ParallaxProvider>
            <IslamicCenter blogdata={getAllBlogs} />
          </ParallaxProvider>
          <Cart />

          <FooterOne islamic="footer-islamic" />
        </Context>
      </Provider>
    </>
  );
};

export default IslamicCenterPage;
