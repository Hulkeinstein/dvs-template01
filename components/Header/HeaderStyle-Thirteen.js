import { useAppContext } from "@/context/Context";
import DarkSwitch from "./dark-switch";
import HeaderEleven from "./Headers/Header-Eleven";

const HeaderStyleThirteen = () => {
  const { isLightTheme, toggleTheme } = useAppContext();
  return (
    <>
      <DarkSwitch isLight={isLightTheme} switchTheme={toggleTheme} />
      <header className="rbt-header rbt-header-default">
        <div className="rbt-sticky-placeholder"></div>
        <HeaderEleven
          transparent="shadow-none header-sticky"
          gapSpaceBetween=""
          navigationEnd="rbt-navigation-center"
          btnClass="rbt-marquee-btn marquee-auto btn-border-gradient radius-round btn-sm hover-transform-none"
          btnText="Join Us Today"
        />
      </header>
    </>
  );
};

export default HeaderStyleThirteen;
