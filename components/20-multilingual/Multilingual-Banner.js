import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import shadow1 from "../../public/images/shape/shadow-1.png";
import shadow2 from "../../public/images/shape/shadow-2.png";
import shadow3 from "../../public/images/shape/shadow-3.png";
import line1 from "../../public/images/shape/curve-line-1.png";
import line2 from "../../public/images/shape/curve-line-2.png";
import line3 from "../../public/images/shape/curve-line-3.png";
import line4 from "../../public/images/shape/curve-line-4.png";
import handCap from "../../public/images/shape/hand-cap.png";
import dotBg from "../../public/images/shape/dot-bg.png";
import dotElement from "../../public/images/shape/dot-element.png";
import translate from "../../public/images/shape/translate.png";
import translateText from "../../public/images/shape/translate-in-text.png";
import awardText from "../../public/images/shape/award-in-text.png";
import worldImg from "../../public/images/shape/world.png";

const profiles = [
  { name: "Ava Miller", src: "/images/shape/user-1.png" },
  { name: "Mark Jordan", src: "/images/shape/avatar-in-text-2.png" },
];

const countryFlag = [
  { country: "Australia", image: "/images/shape/flag-australia.png" },
  { country: "Canada", image: "/images/shape/flag-canada.png" },
  { country: "China", image: "/images/shape/flag-china.png" },
  { country: "France", image: "/images/shape/flag-french.png" },
  { country: "Germany", image: "/images/shape/flag-germany.png" },
  { country: "Japan", image: "/images/shape/flag-japan.png" },
  { country: "Korea", image: "/images/shape/flag-korea.png" },
  { country: "Pakistan", image: "/images/shape/flag-pakistan.png" },
  { country: "Sri Lanka", image: "/images/shape/flag-srilonka.png" },
  { country: "United Kingdom", image: "/images/shape/flag-uk.png" },
  { country: "United States", image: "/images/shape/flag-usa.png" },
];

const MultilingualBanner = () => {
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);
  
    useEffect(() => {
      const handleMouseMove = (event) => {
        const { clientX, clientY } = event;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
  
        const moveX = ((clientX - centerX) / centerX) * 5;
        const moveY = ((clientY - centerY) / centerY) * 5;
  
        setOffsetX(moveX);
        setOffsetY(moveY);
      };
  
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);
  return (
    <>
      <div className="rbt-banner-area rbt-banner-20 position-relative">
        <div className="wrapper">
          <div className="circle-sd-wrapper">
            <div className="circle-shadow-1">
              <Image
                src={shadow1}
                width={313}
                height={278}
                alt="Bannder Shadow"
              />
            </div>
            <div className="circle-shadow-2">
              <Image
                src={shadow2}
                width={571}
                height={450}
                alt="Bannder Shadow"
              />
            </div>
            <div className="circle-shadow-3">
              <Image
                src={shadow3}
                width={805}
                height={354}
                alt="Bannder Shadow"
              />
            </div>
          </div>
          <div className="shapes-wrapper">
            <div className="curve-line-1">
              <Image src={line1} width={493} height={820} alt="Banner Line" />
            </div>
            <div className="curve-line-2">
              <Image src={line2} width={806} height={820} alt="Banner Line" />
            </div>
            <div className="curve-line-3">
              <Image src={line3} width={614} height={47} alt="Banner Line" />
            </div>
            <div className="curve-line-4">
              <Image src={line4} width={368} height={325} alt="Banner Line" />
            </div>
            <div className="shape-hand scene">
              <span data-depth="2">
                <Image src={handCap} width={91} height={91} alt="Banner hand" />
              </span>
            </div>
            <div className="dot-bg">
              <Image src={dotBg} width={1352} height={195} alt="Banner Dot" />
            </div>
            <div className="dot-element scene">
              <span data-depth="2">
                <Image
                  src={dotElement}
                  width={92}
                  height={36}
                  alt="Banner Dot"
                  style={{
                    transform: `translate(${offsetX * 2}px, ${offsetY * 2}px)`,
                  }}
                />
              </span>
            </div>
          </div>

          <div className="container">
            <div className="row col-wrap flex-column-reverse flex-xl-row">
              <div className="col-xl-6">
                <div className="inner position-relative">
                  <div className="shape-1 scene">
                    <span data-depth="3">
                      <Image src={translate} width={66} height={66} alt="" />
                    </span>
                  </div>
                  <h6 className="subtitle theme-gradient">
                    Multi-Language Academy
                  </h6>
                  <div className="title-in-shape d-flex flex-wrap align-items-center gap-2">
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
                            width={51}
                            height={51}
                            unoptimized={true}
                          />
                        </Link>
                      ))}
                    </div>
                    <h1 className="title">Take Online</h1>
                  </div>
                  <h1 className="title">
                    Language{" "}
                    <span>
                      <Image
                        src={translateText}
                        width={50}
                        height={50}
                        alt=""
                      />
                    </span>{" "}
                    Courses
                  </h1>
                  <h1 className="title">
                    With
                    <span className="mx-3">
                      <Image src={awardText} width={50} height={50} alt="" />
                    </span>
                    Certificate
                  </h1>
                  <p className="description mt--20 mb--40 mb_sm--30">
                    Amet minim mollit non deserunt ullamco est sit aliqua dolor
                    do amet sint. Velit officia consequat.
                  </p>
                  <Link
                    className="rbt-btn btn-gradient hover-icon-reverse"
                    href="#"
                  >
                    <span className="icon-reverse-wrapper">
                      <span className="btn-text">Find Your Course</span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                    </span>
                  </Link>
                </div>
              </div>
              <div className="col-xl-6">
                <div className="language-world">
                  <div className="world">
                    <Image src={worldImg} width={441} height={442} alt="" />
                  </div>
                  <div className="flages">
                    {countryFlag.map((flag, index) => (
                      <div
                        className="flag"
                        key={index}
                        data-tooltip={flag.country}
                        tabIndex={0}
                      >
                        <Image
                          src={flag.image}
                          alt={flag.country}
                          width={50}
                          height={50}
                        />
                      </div>
                    ))}
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

export default MultilingualBanner;
