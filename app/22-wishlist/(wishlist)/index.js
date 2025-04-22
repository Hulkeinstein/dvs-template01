"use client";

import { Provider } from "react-redux";
import Context from "@/context/Context";
import Store from "@/redux/store";

import MobileMenu from "@/components/Header/MobileMenu";
import Cart from "@/components/Header/Offcanvas/Cart";
import HeaderStyleSix from "@/components/Header/HeaderStyle-Six";
import Wishlist from "@/components/22-wishlist/Wishlist";
import FooterFive from "@/components/Footer/FooterFive";
import { ParallaxProvider } from "react-scroll-parallax";

const WishlistPage = ({ getAllBlogs }) => {
  return (
    <>
      <Provider store={Store}>
        <Context>
          <MobileMenu />
          <HeaderStyleSix headerType="" isShadow={true} />
          <ParallaxProvider>
            <Wishlist />
          </ParallaxProvider>
          <Cart />

          <ParallaxProvider>
            <FooterFive />
          </ParallaxProvider>
        </Context>
      </Provider>
    </>
  );
};

export default WishlistPage;
