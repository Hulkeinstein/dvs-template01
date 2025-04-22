import { useAppContext } from "@/context/Context";
import DarkSwitch from "./dark-switch";
import HeaderTopSeven from "./Header-Top/HeaderTop-Seven";
import HeaderFive from "./Headers/Header-Five";

const HeaderStyleFive = () => {
  const { isLightTheme, toggleTheme } = useAppContext();
  return (
    <>
      <DarkSwitch isLight={isLightTheme} switchTheme={toggleTheme} />
      <header
        className={`rbt-header rbt-header-default`}
      >
        <div className="rbt-sticky-placeholder"></div>
        <HeaderTopSeven
          bgColor="bg-color-transparent"
          gapSpaceBetween="header-space-betwween"
          container="container"
          flexDirection=""
          btnClass="rbt-switch-btn btn-gradient btn-xs"
          btnText="Call us now"
        />

        <HeaderFive
          sticky="bg-color-white header-sticky"
          gapSpaceBetween=""
          container="container"
          navigationEnd="rbt-navigation-start"
          btnClass="rbt-switch-btn btn-gradient btn-sm hover-transform-none"
          btnText="Join Now"
          transparent="shadow-none"
        />
      </header>
    </>
  );
};

export default HeaderStyleFive;
