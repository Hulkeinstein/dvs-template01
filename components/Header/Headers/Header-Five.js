"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppContext } from "@/context/Context";

import logo from "../../../public/images/logo/logo.png";
import logoLight from "../../../public/images/dark/logo/logo-light.png";

import Nav from "../Nav";
import Search from "../Offcanvas/Search";

const HeaderFive = ({
  gapSpaceBetween,
  sticky,
  navigationEnd,
  container,
  btnText,
  btnClass,
  transparent,
}) => {
  const { mobile, setMobile, search, setSearch, isLightTheme } =
    useAppContext();
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      if (scrolled > 180) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <>
      <div
        className={`rbt-header-wrapper ${transparent} ${gapSpaceBetween} ${sticky} ${
          isSticky ? "rbt-sticky" : ""
        }`}
      >
        <div className={`${container}`}>
          <div className={`mainbar-row ${navigationEnd} align-items-center`}>
            <div className="header-left">
              <div className="logo">
                <Link href="/">
                  {isLightTheme ? (
                    <Image
                      src={logo}
                      width={152}
                      height={50}
                      priority={true}
                      alt="Education Logo Images"
                    />
                  ) : (
                    <Image
                      src={logoLight}
                      width={152}
                      height={50}
                      priority={true}
                      alt="Education Logo Images"
                    />
                  )}
                </Link>
              </div>
            </div>
            <div className="rbt-main-navigation d-none d-xl-block">
              <Nav />
            </div>
            <div className="header-right">
              <ul className="quick-access">
                <li className="access-icon">
                  <Link
                    className={`search-trigger-active rbt-round-btn ${
                      search ? "" : "open"
                    }`}
                    href="#"
                    onClick={() => setSearch(!search)}
                  >
                    <i className="feather-search"></i>
                  </Link>
                </li>
              </ul>

              <div className="rbt-btn-wrapper d-none d-xl-block ml--20">
                <a className={`rbt-btn ${btnClass}`} href="#">
                  <span data-text={`${btnText}`}>{btnText}</span>
                </a>
              </div>

              <div className="mobile-menu-bar d-block d-xl-none">
                <div className="hamberger">
                  <button
                    className="hamberger-button rbt-round-btn"
                    onClick={() => setMobile(!mobile)}
                  >
                    <i className="feather-menu"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Search />
      </div>
    </>
  );
};

export default HeaderFive;
