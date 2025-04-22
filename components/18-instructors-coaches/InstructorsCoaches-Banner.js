"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import bannerImg from "../../public/images/banner/i-banner.png";
import glassShape from "../../public/images/shape/i-glass.png";
import unionShape from "../../public/images/shape/o-union.png";
import dotsShape from "../../public/images/shape/ic-dots.png";
import LineArrow from "../../public/images/shape/i-line-arrow.png";
import Icon1 from "../../public/images/shape/o-icon-1.png";
import Icon2 from "../../public/images/shape/o-icon-2.png";
import Icon3 from "../../public/images/shape/o-icon-3.png";
import leafImg from "../../public/images/shape/i-leaf.png";
import uionBig from "../../public/images/shape/i-uion-big.png";

import brand1 from "../../public/images/brand/partner-sm-1.png";
import brand2 from "../../public/images/brand/partner-sm-2.png";
import brand3 from "../../public/images/brand/partner-sm-3.png";
import brand4 from "../../public/images/brand/partner-sm-4.png";
import brand5 from "../../public/images/brand/partner-sm-5.png";
import brand6 from "../../public/images/brand/partner-sm-6.png";
import brand7 from "../../public/images/brand/partner-sm-7.png";

const profiles = [
  { name: "Ava Miller", src: "/images/shape/art-stu-2.png" },
  { name: "Mark Jordan", src: "/images/shape/art-stu-1.png" },
  { name: "Jordan", src: "/images/shape/art-stu-3.png" },
  { name: "Ava Miller", src: "/images/shape/i-team.png" },
];

const InstructorsCoachesBanner = () => {
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (event) => {
      const { clientX, clientY } = event;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      const moveX = ((clientX - centerX) / centerX) * 2;
      const moveY = ((clientY - centerY) / centerY) * 2;

      setOffsetX(moveX);
      setOffsetY(moveY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  return (
    <>
      <div className="rbt-banner-area rbt-banner-18">
        <div className="wrapper">
          <div className="shape-wrap">
            <div className="shadow-1"></div>
            <div className="shadow-2"></div>
            <div className="shadow-3"></div>
            <div className="shadow-4"></div>
            <div className="glass">
              <Image
                src={glassShape}
                width={1242}
                height={1065}
                unoptimized={true}
                alt="Banner Shape"
              />
            </div>
            <div className="union">
              <Image
                src={unionShape}
                width={46}
                height={46}
                unoptimized={true}
                alt="Banner Shape"
              />
            </div>
            <div className="dot-shape-1 scene">
              <span data-depth="1">
                <Image
                  src={dotsShape}
                  width={82}
                  height={31}
                  unoptimized={true}
                  alt="Banner Shape"
                />
              </span>
            </div>
          </div>
          <div className="container">
            <div className="row">
              <div className="col-xl-7">
                <div className="inner position-relative">
                  <h6 className="subtitle">
                    <span className="theme-gradient">
                      Professional & Lifelong Learning
                    </span>
                  </h6>
                  <h1 className="sec-title">
                    Online Learning Now In Your
                    <span className="theme-gradient ps-3">Fingertips</span>
                  </h1>
                  <p className="description">
                    Amet minim mollit non deserunt ullamco est sit aliqua dolor
                    do amet sint. 
                    <span className="w-500">Velit officia consequat.</span>
                  </p>
                  <div className="button-group">
                    <a
                      className="rbt-btn btn-gradient hover-icon-reverse"
                      href="#"
                    >
                      <span className="icon-reverse-wrapper">
                        <span className="btn-text">Get Started Now</span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                      </span>
                    </a>
                  </div>
                  <div className="line-arrow scene">
                    <span data-depth="1">
                      <Image
                        src={LineArrow}
                        width={69}
                        height={40}
                        unoptimized={true}
                        alt="Banner Shape"
                        style={{
                          transform: `translate(${offsetX * 2}px, ${
                            offsetY * 2
                          }px)`,
                        }}
                      />
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-xl-5">
                <div className="banner-wrap">
                  <div className="banner" data-parallax='{"x": 0, "y": 60}'>
                    <Image
                      src={bannerImg}
                      width={466}
                      height={704}
                      unoptimized={true}
                      alt="Banner"
                    />
                  </div>
                  <div className="feature">
                    <span>
                      <Image
                        src={Icon1}
                        width={42}
                        height={37}
                        alt="image"
                        unoptimized={true}
                      />
                    </span>
                    <div>
                      <h6 className="feature-title">Your</h6>
                      <p className="feature-description">Admissoin Complete</p>
                    </div>
                  </div>
                  <div className="enrolled">
                    <div className="enrolled-cont">
                      <span>
                        <Image
                          src={Icon2}
                          width={41}
                          height={31}
                          alt="image"
                          unoptimized={true}
                        />
                      </span>
                      <div>
                        <h6 className="feature-title">36k+</h6>
                        <p className="feature-description">Enrolled Students</p>
                      </div>
                    </div>
                    <div className="profile-share">
                      {profiles.map((profile, index) => (
                        <Link
                          key={index}
                          href="#"
                          className="avatar"
                          data-tooltip={profile.name}
                          tabIndex="0"
                        >
                          <Image
                            src={profile.src}
                            alt="education"
                            width={35}
                            height={35}
                            unoptimized={true}
                          />
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="feature item-2">
                    <span>
                      <Image
                        src={Icon3}
                        width={40}
                        height={40}
                        alt="image"
                        unoptimized={true}
                      />
                    </span>
                    <div>
                      <h6 className="feature-title">99%</h6>
                      <p className="feature-description">Satisfied</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="brand-box-wrap">
              <div className="uion">
                <Image
                  src={uionBig}
                  width={136}
                  height={136}
                  unoptimized={true}
                  alt="Banner Shape"
                />
              </div>
              <div className="leaf" data-parallax='{"x": 0, "y": -30}'>
                <Image
                  src={leafImg}
                  width={44}
                  height={116}
                  unoptimized={true}
                  alt="Banner Shape"
                />
              </div>
              <div className="brand-box text-center bg-white">
                <span className="b1 w-600 mb-0">
                  Making Sensitive Clients More Valuable For Companies Like
                </span>

                <ul className="brand-list brand-style-3 justify-content-start justify-content-lg-between mt--30">
                  <li>
                    <a href="#">
                      <Image
                        src={brand1}
                        width={106}
                        height={31}
                        alt="Brand Image"
                      />
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <Image
                        src={brand2}
                        width={89}
                        height={31}
                        alt="Brand Image"
                      />
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <Image
                        src={brand3}
                        width={124}
                        height={31}
                        alt="Brand Image"
                      />
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <Image
                        src={brand4}
                        width={99}
                        height={24}
                        alt="Brand Image"
                      />
                    </a>
                  </li>{" "}
                  <li>
                    <a href="#">
                      <Image
                        src={brand5}
                        width={100}
                        height={31}
                        alt="Brand Image"
                      />
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <Image
                        src={brand6}
                        width={78}
                        height={31}
                        alt="Brand Image"
                      />
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <Image
                        src={brand7}
                        width={139}
                        height={27}
                        alt="Brand Image"
                      />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorsCoachesBanner;
