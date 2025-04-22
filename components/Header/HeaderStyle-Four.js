import { useAppContext } from "@/context/Context";
import HeaderTopFour from "./Header-Top/HeaderTop-Four";
import HeaderFour from "./Headers/Header-Four";
import DarkSwitch from "./dark-switch";

const HeaderStyleFour = ({
  btnText,
  parentClass,
  borderTop,
  isShadow,
  isContainerFluid,
}) => {
  const { isLightTheme, toggleTheme } = useAppContext();
  return (
    <>
      <DarkSwitch isLight={isLightTheme} switchTheme={toggleTheme} />
      <header
        className={`rbt-header rbt-header-4 ${parentClass ? parentClass : ""}`}
      >
        <div className="rbt-sticky-placeholder"></div>
        <HeaderTopFour
          bgColor={`bg-color-white ${
            borderTop ? borderTop : ""
          } rbt-border-bottom`}
          gapSpaceBetween="header-space-betwween"
          container={`${isContainerFluid ? "container-fluid" : "container"}`}
          flexDirection=""
          btnClass="rbt-switch-btn btn-gradient btn-xs"
          btnText={`${btnText ? btnText : "Call us now"}`}
        />

        <HeaderFour
          sticky="bg-color-white header-sticky"
          gapSpaceBetween={`header-space-betwween ${isShadow ? isShadow : ""}`}
          container={`${isContainerFluid ? "container-fluid" : "container"}`}
          navigationEnd="rbt-navigation-start"
          btnClass="rbt-marquee-btn marquee-auto btn-border-gradient radius-round btn-sm hover-transform-none"
          btnText="Enroll Now"
        />
      </header>
    </>
  );
};

export default HeaderStyleFour;
