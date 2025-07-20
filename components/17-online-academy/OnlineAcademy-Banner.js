import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import "venobox/dist/venobox.min.css";


import BannerImg from "../../public/images/banner/o-banner.png";
import Trustpilot from "../../public/images/shape/o-trustpilot.png";
import TrustpilotDark from "../../public/images/shape/o-trustpilot-dark.png";
import LineArrow from "../../public/images/shape/o-line-arrow.png";
import Line3 from "../../public/images/shape/o-icon-3.png";
import Icon1 from "../../public/images/shape/o-icon-1.png";
import Icon2 from "../../public/images/shape/o-icon-2.png";

const imagesShape = [
  {
    className: "shape-bg",
    src: "/images/shape/o-bg-1.png",
    width: 606,
    height: 554,
  },
  {
    className: "shadow-bg",
    src: "/images/shape/o-shadow-bg.png",
    width: 1519,
    height: 705,
  },
  {
    className: "shape-1",
    src: "/images/shape/o-shape-1.png",
    width: 535,
    height: 105,
  },
  {
    className: "shape-2",
    src: "/images/shape/o-shape-2.png",
    width: 535,
    height: 91,
  },
  {
    className: "union",
    src: "/images/shape/o-union.png",
    width: 46,
    height: 46,
  },
  {
    className: "star scene",
    src: "/images/shape/o-star.png",
    depth: "1",
    width: 45,
    height: 47,
  },
  {
    className: "dot-shape-1",
    src: "/images/shape/o-dots-1.png",
    width: 92,
    height: 36,
  },
  {
    className: "dot-shape-2",
    src: "/images/shape/o-dots-2.png",
    width: 36,
    height: 92,
  },
];
const profiles = [
  { name: "Ava Miller", src: "/images/shape/art-stu-2.png" },
  { name: "Mark Jordan", src: "/images/shape/art-stu-1.png" },
  { name: "Jordan", src: "/images/shape/art-stu-3.png" },
  { name: "Ava Miller", src: "/images/shape/i-team.png" },
];

const OnlineAcademyBanner = () => {
  useEffect(() => {
    import("venobox/dist/venobox.min.js").then((venobox) => {
      new venobox.default({
        selector: ".popup-video",
      });
    });
  }, []);
  return (
    <>
      <div className="rbt-banner-area rbt-banner-17">
        <div className="wrapper">
          <div className="shape-wrap">
            {imagesShape.map((data, index) => (
              <div key={index} className={data.className}>
                {data.depth ? (
                  <span data-depth={data.depth}>
                    <Image
                      src={data.src}
                      alt="Banner Shape"
                      width={data.width}
                      height={data.height}
                      unoptimized={true}
                    />
                  </span>
                ) : (
                  <Image
                    src={data.src}
                    alt="Banner Shape"
                    width={data.width}
                    height={data.height}
                    unoptimized={true}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="container">
            <div className="row flex-column-reverse flex-xl-row">
              <div className="col-xl-7">
                <div className="inner position-relative">
                  <h6 className="subtitle">
                    <span className="trustpilot-dark">
                      <Image
                        src={Trustpilot}
                        width={225}
                        height={26}
                        alt="trustpilot"
                        unoptimized={true}
                      />
                    </span>
                    <span className="trustpilot-white">
                      <Image
                        src={TrustpilotDark}
                        width={225}
                        height={26}
                        alt="trustpilot"
                        unoptimized={true}
                      />
                    </span>
                    Excellent 4.9 out of 5
                  </h6>
                  <h1 className="title">
                    Education Is The Best Key{" "}
                    <span className="theme-gradient">Success In Life</span>
                  </h1>
                  <p className="description">
                    Amet minim mollit non deserunt ullamco est sit aliqua dolor
                    do amet sint. 
                    <span className="w-500">Velit officia consequat.</span>
                  </p>
                  <div className="button-group">
                    <Link
                      className="rbt-btn btn-gradient hover-icon-reverse"
                      href="#"
                    >
                      <span className="icon-reverse-wrapper">
                        <span className="btn-text">Get Started</span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                      </span>
                    </Link>
                    <Link
                      className="rbt-btn btn-border hover-icon-reverse popup-video"
                      data-vbtype="video"
                      controls
                      href="https://www.youtube.com/watch?v=nA1Aqp0sPQo"
                    >
                      <span className="icon-reverse-wrapper">
                        <span className="btn-text">Watch Video</span>
                        <span className="btn-icon">
                          <i className="feather-play"></i>
                        </span>
                        <span className="btn-icon">
                          <i className="feather-play"></i>
                        </span>
                      </span>
                    </Link>
                  </div>
                  <div className="line-arrow scene">
                    <span data-depth="1">
                      <Image
                        src={LineArrow}
                        width={86}
                        height={50}
                        alt="Banner Shape"
                        unoptimized={true}
                      />
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-xl-5">
                <div className="banner-wrap">
                  <div className="banner">
                    <Image
                      src={BannerImg}
                      width={555}
                      height={625}
                      alt="Banner"
                      unoptimized={true}
                    />
                  </div>
                  <div className="feature" data-parallax='{"x": 40, "y": 0}'>
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
                  <div className="enrolled" data-parallax='{"x": -40, "y": 0}'>
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
                  <div
                    className="feature item-2"
                    data-parallax='{"x": 0, "y": 30}'
                  >
                    <span>
                      <Image
                        src={Line3}
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
          </div>
        </div>
      </div>
    </>
  );
};

export default OnlineAcademyBanner;
