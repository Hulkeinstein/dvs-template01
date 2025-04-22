"use client";

import Link from "next/link";

import { useSelector } from "react-redux";

import { useAppContext } from "@/context/Context";

const HeaderRightThree = ({ btnClass, btnText }) => {
  const { mobile, setMobile, search, setSearch, cartToggle, setCart } =
    useAppContext();

  const { total_items } = useSelector((state) => state.CartReducer);

  return (
    <div className="header-right">
      <ul className="quick-access">
        <li className="access-icon rbt-mini-cart">
          <Link
            className="rbt-cart-sidenav-activation rbt-round-btn"
            href="#"
            onClick={() => setCart(!cartToggle)}
          >
            <i className="feather-shopping-cart"></i>
            <span className="rbt-cart-count">{total_items}</span>
          </Link>
        </li>

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
        <Link className={`rbt-btn ${btnClass}`} href="#">
          <span data-text={`${btnText}`}>{btnText}</span>
        </Link>
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
  );
};

export default HeaderRightThree;
