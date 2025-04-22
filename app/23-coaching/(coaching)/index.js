"use client";

import { Provider } from "react-redux";
import Context from "@/context/Context";
import Store from "@/redux/store";
import { ParallaxProvider } from "react-scroll-parallax";

import MobileMenu from "@/components/Header/MobileMenu";
import Cart from "@/components/Header/Offcanvas/Cart";
import Coaching from "@/components/23-coaching/Coaching";
import FooterThree from "@/components/Footer/Footer-Three";
import HeaderStyleThirteen from "@/components/Header/HeaderStyle-Thirteen";

const CoachingPage = ({ getAllBlogs }) => {
  return (
    <>
      <Provider store={Store}>
        <Context>
          <MobileMenu />
          <HeaderStyleThirteen headerSticky="rbt-sticky" headerType="" />
          <ParallaxProvider>
            <Coaching blogdata={getAllBlogs} />
          </ParallaxProvider>
          <Cart />

          <FooterThree />
        </Context>
      </Provider>
    </>
  );
};

export default CoachingPage;
