"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export const CreateContext = createContext();

export const useAppContext = () => useContext(CreateContext);

// 쿠키 설정 함수
const setCookie = (name, value, days = 365) => {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
};

// 쿠키 읽기 함수
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const Context = ({ children }) => {
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.CartReducer);

  const [cartToggle, setCart] = useState(true);
  const [toggle, setToggle] = useState(true);
  const [search, setSearch] = useState(true);
  const [mobile, setMobile] = useState(true);
  const [smallMobileMenu, setsmallMobileMenu] = useState(true);
  const [pricing, setPricing] = useState(true);
  const [pricingTwo, setPricingTwo] = useState(true);
  const [pricingThree, setPricingThree] = useState(true);
  const [pricingFour, setPricingFour] = useState(true);
  const [isLightTheme, setLightTheme] = useState(true);

  useEffect(() => {
    dispatch({ type: "COUNT_CART_TOTALS" });
  }, [cart]);

  useEffect(() => {
    // 최초 로드 시 쿠키에서 테마 읽기
    const themeType = getCookie("theme") || localStorage.getItem("histudy-theme");
    if (themeType === "dark") {
      setLightTheme(false);
      // body 클래스는 여기서 설정하지 않음 (서버에서 이미 설정함)
    }
  }, []);

  useEffect(() => {
    if (isLightTheme) {
      document.body.classList.remove("active-dark-mode");
      document.documentElement.setAttribute('data-theme', 'light');
      setCookie("theme", "light");
      localStorage.setItem("histudy-theme", "light"); // 이전 호환성 유지
    } else {
      document.body.classList.add("active-dark-mode");
      document.documentElement.setAttribute('data-theme', 'dark');
      setCookie("theme", "dark");
      localStorage.setItem("histudy-theme", "dark"); // 이전 호환성 유지
    }
  }, [isLightTheme]);

  const toggleTheme = () => {
    setLightTheme((prevTheme) => !prevTheme);
  };

  return (
    <CreateContext.Provider
      value={{
        toggle,
        setToggle,
        mobile,
        setMobile,
        smallMobileMenu,
        setsmallMobileMenu,
        cartToggle,
        setCart,
        search,
        setSearch,
        pricing,
        setPricing,
        pricingTwo,
        setPricingTwo,
        pricingThree,
        setPricingThree,
        pricingFour,
        setPricingFour,
        isLightTheme,
        setLightTheme,
        toggleTheme,
      }}
    >
      {children}
    </CreateContext.Provider>
  );
};

export default Context;
