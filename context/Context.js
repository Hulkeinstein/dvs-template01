"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export const CreateContext = createContext();

export const useAppContext = () => useContext(CreateContext);

// 쿠키 설정 함수 - 클라이언트 측에서만 실행
const setCookie = (name, value, days = 365) => {
  if (typeof document !== 'undefined') {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`;
  }
};

// 쿠키 읽기 함수 - 클라이언트 측에서만 실행
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // 최초 로드 시 쿠키에서 테마 읽기
    const themeType = getCookie("theme") || 
      (typeof localStorage !== 'undefined' ? localStorage.getItem("histudy-theme") : null);
    
    if (themeType === "dark") {
      setLightTheme(false);
    }
  }, []);

  useEffect(() => {
    dispatch({ type: "COUNT_CART_TOTALS" });
  }, [cart]);

  useEffect(() => {
    if (!mounted) return;

    if (isLightTheme) {
      document.body.classList.remove("active-dark-mode");
      document.documentElement.setAttribute('data-theme', 'light');
      setCookie("theme", "light");
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem("histudy-theme", "light"); // 이전 호환성 유지
      }
    } else {
      document.body.classList.add("active-dark-mode");
      document.documentElement.setAttribute('data-theme', 'dark');
      setCookie("theme", "dark");
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem("histudy-theme", "dark"); // 이전 호환성 유지
      }
    }
  }, [isLightTheme, mounted]);

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