"use client";

import { Provider } from "react-redux";
import Context from "@/context/Context";
import Store from "@/redux/store";
import { ParallaxProvider } from "react-scroll-parallax";

import MobileMenu from "@/components/Header/MobileMenu";
import Cart from "@/components/Header/Offcanvas/Cart";
import FooterThree from "@/components/Footer/Footer-Three";
import LifeCoach from "@/components/25-life-coach/LifeCoach";
import HeaderStyleThirteen from "@/components/Header/HeaderStyle-Thirteen";

const LifeCoachPage = ({ getAllBlogs }) => {
  return (
    <>
      <Provider store={Store}>
        <Context>
          <MobileMenu />
          <HeaderStyleThirteen headerSticky="rbt-sticky" headerType="" />

          <ParallaxProvider>
            <LifeCoach blogdata={getAllBlogs} />
          </ParallaxProvider>
          <Cart />

          <FooterThree />
        </Context>
      </Provider>
    </>
  );
};

export default LifeCoachPage;
