import React from "react";
import HeaderSix from "./Headers/Header-Six";
import HeaderTopBar from "./HeaderTopBar/HeaderTopBar";
import { useRouter } from "next/navigation";
import DarkSwitch from "./dark-switch";
import { useAppContext } from "@/context/Context";

const HeaderStyleSix = ({ headerType, isShadow }) => {
  const router = useRouter();
  const { isLightTheme, toggleTheme } = useAppContext();
  return (
    <>
      <DarkSwitch isLight={isLightTheme} switchTheme={toggleTheme} />
      <header className={`rbt-header rbt-header-default ${headerType}`}>
        <div className="rbt-sticky-placeholder"></div>
        {router.pathname === "/02-course-school" ? <HeaderTopBar /> : ""}
        <HeaderSix
          sticky="bg-color-white header-sticky"
          gapSpaceBetween=""
          navigationEnd="rbt-navigation-center"
          btnClass="rbt-switch-btn btn-gradient btn-sm hover-transform-none"
          btnText={
            router.pathname === "/18-instructors-coaches"
              ? "Join Us Today"
              : "Join Now"
          }
          isShadow={isShadow}
        />
      </header>
    </>
  );
};

export default HeaderStyleSix;
