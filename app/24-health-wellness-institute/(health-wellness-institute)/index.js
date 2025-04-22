"use client";

import { Provider } from "react-redux";
import Context from "@/context/Context";
import Store from "@/redux/store";
import { ParallaxProvider } from "react-scroll-parallax";

import MobileMenu from "@/components/Header/MobileMenu";
import Cart from "@/components/Header/Offcanvas/Cart";
import FooterOne from "@/components/Footer/Footer-One";
import HealthInstitute from "@/components/24-health-wellness-institute/HealthInstitute";
import HeaderStyleFour from "@/components/Header/HeaderStyle-Four";

const HealthInstitutePage = ({ getAllBlogs }) => {
  return (
    <>
      <Provider store={Store}>
        <Context>
          <MobileMenu />
          <HeaderStyleFour
            headerType=""
            btnText="Register Now"
            parentClass="rbt-header rbt-header-4-container-var"
            borderTop=""
            isShadow="shadow-none"
            isContainerFluid={false}
          />

          <ParallaxProvider>
            <HealthInstitute blogdata={getAllBlogs} />
          </ParallaxProvider>
          <Cart />

          <FooterOne
            bgColor="bg-color-darker"
            isBox="rbt-section-box box-footer"
          />
        </Context>
      </Provider>
    </>
  );
};

export default HealthInstitutePage;
