"use client";

import { Provider } from "react-redux";
import Context from "@/context/Context";
import Store from "@/redux/store";

import MobileMenu from "@/components/Header/MobileMenu";
import Cart from "@/components/Header/Offcanvas/Cart";
import HeaderStyleSix from "@/components/Header/HeaderStyle-Six";
import InstructorsCoaches from "@/components/18-instructors-coaches/InstructorsCoaches";
import FooterThree from "@/components/Footer/Footer-Three";

const InstructorsCoachesPage = ({ getAllBlogs }) => {
  return (
    <>
      <Provider store={Store}>
        <Context>
          <MobileMenu />
          <HeaderStyleSix
            headerSticky="rbt-sticky"
            headerType=""
            isShadow={true}
          />
          <InstructorsCoaches blogdata={getAllBlogs} />
          <Cart />

          <FooterThree />
        </Context>
      </Provider>
    </>
  );
};

export default InstructorsCoachesPage;
