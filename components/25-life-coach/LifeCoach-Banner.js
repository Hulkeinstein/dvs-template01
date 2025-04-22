import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import lShape1 from "../../public/images/shape/l-shape-1.png";
import lShape2 from "../../public/images/shape/l-shape-2.png";
import lStar1 from "../../public/images/shape/l-star-1.png";
import lStar2 from "../../public/images/shape/l-star-2.png";
import lShapeDot from "../../public/images/shape/l-shape-dot.png";
import lHeart from "../../public/images/shape/l-heart.png";
import lShadow1 from "../../public/images/shape/l-shadow-2.png";
import lShadow2 from "../../public/images/shape/l-shadow.png";
import lBanner from "../../public/images/banner/l-banner.png";
import lIcon from "../../public/images/shape/l-icon.png";
import lTextMen from "../../public/images/shape/l-text-men.png";

const profiles = [
  { name: "Ava Miller", src: "/images/shape/art-stu-2.png" },
  { name: "Mark Jordan", src: "/images/shape/art-stu-1.png" },
  { name: "Jordan", src: "/images/shape/art-stu-3.png" },
  { name: "Ava Miller", src: "/images/shape/i-team.png" },
];

const LifeCoachBanner = () => {
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (event) => {
      const { clientX, clientY } = event;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      const moveX = ((clientX - centerX) / centerX) * 10;
      const moveY = ((clientY - centerY) / centerY) * 10;

      setOffsetX(moveX);
      setOffsetY(moveY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  return (
    <>
      <div className="rbt-banner-area rbt-banner-25">
        <div className="wrapper">
          <div className="shape-wrapper">
            <div className="shape-1">
              <Image
                src={lShape1}
                width={647}
                height={715}
                alt="Banner Shape"
              />
            </div>
            <div className="shape-2">
              <Image
                src={lShape2}
                width={649}
                height={950}
                alt="Banner Shape"
              />
            </div>
            <div className="star-1 scene">
              <span data-depth="2">
                <Image
                  src={lStar1}
                  width={30}
                  height={33}
                  alt="Banner Shape"
                  style={{
                    transform: `translate(${offsetX * 1}px, ${offsetY * 1}px)`,
                  }}
                />
              </span>
            </div>
            <div className="star-2 scene">
              <span data-depth="1">
                <Image
                  src={lStar2}
                  width={47}
                  height={68}
                  style={{
                    transform: `translate(${offsetX * -1}px, ${offsetY * 1}px)`,
                  }}
                  alt="Banner Shape"
                />
              </span>
            </div>
            <div className="shape-dot scene">
              <span data-depth="1">
                <Image
                  src={lShapeDot}
                  width={90}
                  height={35}
                  style={{
                    transform: `translate(${offsetX * 1}px, ${offsetY * 1}px)`,
                  }}
                  alt="Banner Shape"
                />
              </span>
            </div>
            <div className="heart">
              <Image src={lHeart} width={56} height={56} alt="Banner Shape" />
            </div>
            <div className="shape-3">
              <Image
                src={lShadow1}
                width={465}
                height={465}
                alt="Banner Shape"
              />
            </div>
          </div>
          <div className="container">
            <div className="row g-5 flex-column-reverse flex-xl-row">
              <div className="col-xl-5">
                <div className="inner">
                  <div className="rbt-new-badge rbt-new-badge-one">
                    <span className="theme-gradient">I am a Life Coach!</span>
                  </div>
                  <h1 className="title">
                    Take Control of{" "}
                    <Image
                      src={lTextMen}
                      width={95}
                      height={60}
                      alt="Banner Text"
                    />{" "}
                    Your Life
                  </h1>
                  <p className="description">
                    If you are ready to make positive changes, life coach John
                    can help you achieve that.
                  </p>
                  <a
                    className="rbt-btn btn-gradient hover-icon-reverse"
                    href="#"
                  >
                    <span className="icon-reverse-wrapper">
                      <span className="btn-text">Schedule A Call</span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                    </span>
                  </a>
                </div>
              </div>
              <div className="col-xl-7">
                <div className="rbt-banner-25-thumbnails">
                  <div className="shadow-shape">
                    <Image
                      src={lShadow2}
                      width={771}
                      height={415}
                      alt="Banner Shape"
                    />
                  </div>
                  <div className="main-img">
                    <Image
                      data-parallax='{"x": 0, "y": -80}'
                      src={lBanner}
                      width={639}
                      height={796}
                      alt="Banner Men"
                    />
                  </div>
                  <div className="rbt-banner-25-satisfied">
                    <span className="icon">
                      <Image
                        src={lIcon}
                        width={40}
                        height={40}
                        alt="Banner Icon"
                      />
                    </span>
                    <div className="cont">
                      <h6 className="satis-title">2.6k+</h6>
                      <span className="satis-subtitle">Satisfied</span>
                    </div>
                  </div>
                  <div className="rbt-banner-25-review">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="raging">
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                        <i className="fas fa-star"></i>
                      </div>
                      <span className="heart">
                        <i className="fas fa-heart"></i>
                      </span>
                    </div>
                    <h5 className="review-title">99% Positive Review</h5>
                    <div className="d-flex align-items-center gap-3">
                      <span className="parcent">100%</span>
                      <span className="review-subtitle">Coach Efficiency</span>
                    </div>
                  </div>
                  <div className="rbt-banner-25-team">
                    <h6 className="day">30 Days</h6>
                    <span className="team-title">
                      Organize Your Life With Histudy
                    </span>
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
                            width={34}
                            height={34}
                            unoptimized={true}
                          />
                        </Link>
                      ))}
                      <div className="number">
                        <span>4k+</span>
                      </div>
                    </div>
                    <span className="team-join">joined me</span>
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

export default LifeCoachBanner;
