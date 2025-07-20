"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import HeaderTopEight from "./Header-Top/HeaderTop-Eight";
import HeaderTopBar from "./HeaderTopBar/HeaderTopBar";
import HeaderEight from "./Headers/Header-Eight";
import { useAppContext } from "@/context/Context";

// 클라이언트 사이드에서만 렌더링되도록 동적 임포트
const DynamicDarkSwitch = dynamic(() => import('./dark-switch'), {
  ssr: false,
});

const HeaderStyleTen = ({ headerSticky }) => {
  const router = useRouter();
  const { isLightTheme, toggleTheme } = useAppContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* 클라이언트 사이드에서만 렌더링 */}
      {mounted && (
        <DynamicDarkSwitch isLight={isLightTheme} switchTheme={toggleTheme} />
      )}
      <header className="rbt-header rbt-header-10">
        {router.pathname === "/01-main-demo" &&
        "/16-udemy-affiliate" &&
        "/01-main-demo" ? (
          <HeaderTopBar />
        ) : (
          <HeaderTopEight
            bgColor="bg-not-transparent bg-color-darker"
            gapSpaceBetween="header-space-betwween"
            container="container-fluid"
            flexDirection=""
            btnClass="rbt-switch-btn btn-gradient btn-xs"
            btnText="Call us now"
          />
        )}
        <HeaderEight
          headerSticky={headerSticky}
          sticky="header-sticky"
          container="container-fluid"
          gapSpaceBetween="header-space-betwween"
          navigationEnd="rbt-navigation-start"
        />
      </header>
    </>
  );
};
export default HeaderStyleTen;