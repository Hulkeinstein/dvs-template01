import { useState, useEffect } from "react";

import Image from "next/image";
import Link from "next/link";
import { useParallax } from "react-scroll-parallax";

import bannerBg from "../../public/images/shape/art-banner-bg.png";
import bannerBg2 from "../../public/images/banner/art-banner-bg-2.png";
import artShape1 from "../../public/images/shape/art-shape-1.png";
import artShape2 from "../../public/images/shape/art-shape-2.png";
import artShape3 from "../../public/images/shape/art-star.png";
import artTextElm1 from "../../public/images/shape/art-text-element-1.png";
import artTextElm2 from "../../public/images/shape/art-text-element-2.png";
import artTextElm3 from "../../public/images/shape/art-text-element-3.png";
import bannerMen from "../../public/images/banner/art-banner-men.png";
import artBg from "../../public/images/shape/art-o-bg.png";
import artStar1 from "../../public/images/shape/art-o-star-1.png";
import artStar2 from "../../public/images/shape/art-o-star-2.png";
import artStar3 from "../../public/images/shape/art-o-star-3.png";
import bannerShape from "../../public/images/shape/art-arrow-shape.png";
import artIcon from "../../public/images/shape/art-icon.png";
import artStu1 from "../../public/images/shape/art-stu-1.png";
import artStu2 from "../../public/images/shape/art-stu-2.png";
import artStu3 from "../../public/images/shape/art-stu-3.png";

const ArtDesignSchoolBanner = () => {
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const { ref: ref1, style: style1 } = useParallax({
    translateY: [0, -10],
  });

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
      <div className="rbt-banner-area rbt-banner-21">
        <div className="wrapper">
          <div className="shape-wrap">
            <div className="main-bg">
              <Image
                src={bannerBg}
                width={1425}
                height={1058}
                unoptimized={true}
                alt="Banner Shape"
              />
            </div>
            <div className="shape-1">
              <Image
                src={artShape1}
                width={143}
                height={129}
                alt="Banner Shape"
              />
            </div>
            <div className="shape-2">
              <Image
                src={artShape2}
                width={40}
                height={40}
                alt="Banner Shape"
              />
            </div>
            <div className="shape-star">
              <Image
                src={artShape3}
                width={40}
                height={43}
                alt="Banner Shape"
              />
            </div>
          </div>
          <div className="container">
            <h5 className="subtitle">Grow Your Skills On Trend</h5>
            <div className="title-wrap">
              <h1 className="title">
                <span className="icon scene">
                  <Image
                    src={artTextElm1}
                    width={127}
                    height={112}
                    style={{
                      transform: `translate(${offsetX * 2}px, ${
                        offsetY * 2
                      }px)`,
                    }}
                    alt="Text Shape"
                  />
                </span>
                Art &
              </h1>
              <h2 className="title">
                <span className="icon scene">
                  <Image
                    src={artTextElm2}
                    width={135}
                    height={135}
                    style={{
                      transform: `translate(${offsetX * -2}px, ${
                        offsetY * 2
                      }px)`,
                    }}
                    alt="Text Shape"
                  />
                </span>
                <span className="text-outline">Design</span>
              </h2>
            </div>
            <h2 className="title school">
              <span className="icon scene">
                <Image
                  src={artTextElm3}
                  width={137}
                  height={144}
                  style={{
                    transform: `translate(${offsetX * 2}px, ${offsetY * -2}px)`,
                  }}
                  alt="Text Shape"
                />
              </span>
              School.
            </h2>
            <div className="rbt-banner-bottom">
              <div className="bg-img">
                <Image
                  src={bannerBg2}
                  width={1725}
                  height={628}
                  unoptimized={true}
                  alt="Banner Shape"
                />
              </div>
              <div className="main-img">
                <Image
                  // data-parallax='{"x": 0, "y": -80}'
                  width={971}
                  height={971}
                  src={bannerMen}
                  ref={ref1}
                  style={style1}
                  alt="Banner Shape"
                />
              </div>
            </div>
            <div className="rbt-offer">
              <div className="offer-bg">
                <Image
                  src={artBg}
                  width={1301}
                  height={265}
                  unoptimized={true}
                  alt="Banner Shape"
                />
              </div>
              <div className="offer-shape-1">
                <div className="star-1">
                  <Image
                    src={artStar1}
                    width={38}
                    height={39}
                    alt="Star Shape"
                  />
                </div>
                <div className="star-2">
                  <Image
                    src={artStar2}
                    width={35}
                    height={35}
                    alt="Star Shape"
                  />
                </div>
                <div className="star-3">
                  <Image
                    src={artStar3}
                    width={35}
                    height={35}
                    alt="Star Shape"
                  />
                </div>
              </div>
              <div className="offer-shape-2">
                <Image
                  src={bannerShape}
                  width={185}
                  height={39}
                  alt="Banner Shape"
                />
              </div>

              <div className="satisfied">
                <span>
                  <Image
                    src={artIcon}
                    width={41}
                    height={41}
                    alt="Banner Icon"
                  />
                </span>
                <div className="cont">
                  <h6 className="number">
                    <span className="odometer rbt-font-primary">99</span>%
                  </h6>
                  <span className="number-title">Satisfied</span>
                </div>
              </div>
              <div className="offer-content">
                <div className="enroll">
                  <div className="profile-share">
                    <Link
                      href="#"
                      className="avatar"
                      data-tooltip="Mark Jordan"
                      tabIndex="0"
                    >
                      <Image
                        src={artStu1}
                        width={51}
                        height={51}
                        alt="education"
                      />
                    </Link>
                    <Link
                      href="#"
                      className="avatar"
                      data-tooltip="Jordan"
                      tabIndex="0"
                    >
                      <Image
                        src={artStu3}
                        width={53}
                        height={53}
                        alt="education"
                      />
                    </Link>
                    <Link
                      href="#"
                      className="avatar"
                      data-tooltip="Ava Miller"
                      tabIndex="0"
                    >
                      <Image
                        src={artStu2}
                        width={51}
                        height={51}
                        alt="education"
                      />
                    </Link>
                  </div>
                  <div>
                    <h6 className="number">
                      <span
                        className="odometer rbt-font-primary"
                        // data-count="36"
                      >
                        36
                      </span>
                      K+
                    </h6>
                    <p className="number-title">Enrolled Students</p>
                  </div>
                </div>
                <p className="description">
                  Start today get <span className="parcent">-20%</span> less for
                  first-time <span className="bold">Histudy admission.</span>{" "}
                  Don't miss this offer!!
                </p>
              </div>
              <Link
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
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ArtDesignSchoolBanner;
