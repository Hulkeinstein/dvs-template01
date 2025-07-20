import { useAppContext } from "@/context/Context";
import HeaderTopFour from "../Header-Top/HeaderTop-Four";
import HeaderFour from "../Headers/Header-Four";
import DarkSwitch from "../dark-switch";

const HeaderTypeFour = () => {
  const { isLightTheme, toggleTheme } = useAppContext();
  return (
    <>
      <DarkSwitch isLight={isLightTheme} switchTheme={toggleTheme} />
      <header className="rbt-header rbt-header-4 rbt-header-4-container-var">
        <div className="rbt-sticky-placeholder"></div>
        <HeaderTopFour
          bgColor="bg-color-white rbt-border-bottom"
          gapSpaceBetween="header-space-betwween"
          container="container"
          flexDirection=""
          btnClass="rbt-switch-btn btn-gradient btn-xs"
          btnText="Register Now"
        />

        <HeaderFour
          sticky="bg-color-white header-sticky"
          gapSpaceBetween="header-space-betwween shadow-none"
          container="container"
          navigationEnd="rbt-navigation-start"
          btnClass="rbt-marquee-btn marquee-auto btn-border-gradient radius-round btn-sm hover-transform-none"
          btnText="Enroll Now"
        />
      </header>
    </>
  );
};

export default HeaderTypeFour;
