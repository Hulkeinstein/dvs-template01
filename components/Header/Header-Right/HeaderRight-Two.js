"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { useAppContext } from "@/context/Context";
import User from "../Offcanvas/User";
import { useSession } from "next-auth/react"; // ← 추가

const HeaderRightTwo = ({ btnClass, btnText }) => {
  const { mobile, setMobile, search, setSearch, cartToggle, setCart } = useAppContext();
  const { total_items } = useSelector((state) => state.CartReducer);
  const { data: session, status } = useSession(); // ← 추가

  return (
    <div className="header-right">
      <ul className="quick-access">
        <li className="access-icon">
          <Link
            className={`search-trigger-active rbt-round-btn ${search ? "" : "open"}`}
            href="#"
            onClick={() => setSearch(!search)}
          >
            <i className="feather-search"></i>
          </Link>
        </li>

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

        <li className="account-access rbt-user-wrapper d-none d-xl-block">
          <Link href={session ? "/dashboard" : "/login"}>
            <i className="feather-user"></i>
            {status === "loading" ? "..." : session ? session.user.name : "Login"}
          </Link>
          <User />
        </li>

        <li className="access-icon rbt-user-wrapper d-block d-xl-none">
          <Link className="rbt-round-btn" href={session ? "/dashboard" : "/login"}>
            <i className="feather-user"></i>
          </Link>
          <User />
        </li>
      </ul>

      <div className="rbt-btn-wrapper d-none d-xl-block">
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

export default HeaderRightTwo;
