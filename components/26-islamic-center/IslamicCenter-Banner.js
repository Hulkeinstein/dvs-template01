import { useEffect, useState, useRef } from "react";

import Image from "next/image";
import Link from "next/link";

import Icon2 from "../../public/images/shape/i-read-quran.png";
import shape1 from "../../public/images/shape/i-shape-1.png";
import shape2 from "../../public/images/shape/i-shape-2.png";
import star from "../../public/images/shape/i-star.png";
import moon from "../../public/images/shape/i-moon.png";
import book from "../../public/images/shape/i-book.png";
import mosque from "../../public/images/shape/i-mosque.png";
import graduation from "../../public/images/shape/i-graduation.png";
import textBook from "../../public/images/shape/i-text-book.png";
import iDots from "../../public/images/shape/i-dots.png";
import iArabian from "../../public/images/banner/i-arabian.png";
import lIcon from "../../public/images/shape/l-icon.png";
import ialbum from "../../public/images/shape/i-album.png";

const profiles = [
  { name: "Ava Miller", src: "/images/shape/art-stu-2.png" },
  { name: "Mark Jordan", src: "/images/shape/art-stu-1.png" },
  { name: "Jordan", src: "/images/shape/art-stu-3.png" },
  { name: "Ava Miller", src: "/images/shape/i-team.png" },
];

const IslamicCenterBanner = () => {
  const [offset, setOffset] = useState(-60);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const requestRef = useRef(null);

  useEffect(() => {
    const handleScrollAndMouseMove = (event) => {
      if (event.type === "scroll") {
        const targetOffset = window.scrollY * -0.2;
        cancelAnimationFrame(requestRef.current);

        const animate = () => {
          setOffset((prevOffset) => {
            let newOffset = prevOffset + (targetOffset - prevOffset) * 0.1;
            return Math.max(-60, Math.min(newOffset, -30));
          });

          requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);
      }

      if (event.type === "mousemove") {
        const { clientX, clientY } = event;
        const moveX =
          ((clientX - window.innerWidth / 1) / window.innerWidth) * 4;
        const moveY =
          ((clientY - window.innerHeight / 1) / window.innerHeight) * 4;
        setOffsetX(moveX);
        setOffsetY(moveY);
      }
    };

    window.addEventListener("scroll", handleScrollAndMouseMove);
    window.addEventListener("mousemove", handleScrollAndMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScrollAndMouseMove);
      window.removeEventListener("mousemove", handleScrollAndMouseMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <>
      <div className="rbt-banner-area rbt-banner-26">
        <div className="wrapper">
          <div className="shape-wrapper position-relative">
            <div
              className="shape-1"
              style={{ overflow: "hidden", position: "absolute" }}
            >
              <Image
                style={{
                  transform: `translateY(${offset}px)`,
                  transition: "transform 0.6s ease-out",
                }}
                src={shape1}
                width={130}
                height={184}
                alt="Banner Shape"
              />
            </div>
            <div
              className="shape-2"
              style={{ overflow: "hidden", position: "absolute" }}
            >
              <Image
                style={{
                  transform: `translateY(${offset}px)`,
                  transition: "transform 0.6s ease-out",
                }}
                src={shape2}
                width={120}
                height={201}
                alt="Banner Shape"
              />
            </div>
            <div className="star-1 scene">
              <span data-depth="2">
                <Image src={star} width={33} height={29} alt="Banner Shape" />
              </span>
            </div>
            <div className="moon scene">
              <span>
                <Image
                  src={moon}
                  width={45}
                  height={48}
                  style={{
                    transform: `translate(${offsetX * 1}px, ${offsetY * 1}px)`,
                  }}
                  alt="Banner Shape"
                />
              </span>
            </div>
            <div className="quran scene">
              <span data-depth="1">
                <Image src={book} width={72} height={48} alt="Banner Shape" />
              </span>
            </div>
          </div>
          <div className="shape-wrapper">
            <div className="banner">
              <Image
                src={mosque}
                width={1425}
                height={328}
                alt="Banner Shape"
              />
            </div>
          </div>
          <div className="container">
            <div className="row flex-column-reverse flex-xl-row">
              <div className="col-xl-7">
                <div className="inner">
                  <h6 className="subtitle">
                    <Image
                      src={graduation}
                      width={20}
                      height={15}
                      alt="Banner Icon"
                    />{" "}
                    Learn Quran For Peace
                  </h6>
                  <h1 className="title">
                    Guided By The Quran{" "}
                    <Image
                      src={textBook}
                      width={94}
                      height={60}
                      alt="Banner Text"
                    />{" "}
                    And Sunnah
                  </h1>
                  <p className="description">
                    Amet minim mollit non deserunt ullamco est sit aliqua dolor
                    do amet sint. 
                    <span className="bold">Velit officia consequat.</span>
                  </p>
                  <Link
                    className="rbt-btn btn-gradient hover-icon-reverse"
                    href="#"
                  >
                    <span className="icon-reverse-wrapper">
                      <span className="btn-text">Start Learning</span>
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
              <div className="col-xl-5">
                <div className="rbt-banner-26-thumbnails">
                  <div className="shape-dot scene">
                    <span data-depth="1">
                      <Image
                        src={iDots}
                        width={95}
                        height={87}
                        alt="Banner Shape"
                      />
                    </span>
                  </div>
                  <div className="main-img">
                    <Image
                      src={iArabian}
                      width={533}
                      height={571}
                      alt="Banner Men"
                    />
                  </div>
                  <div className="rbt-banner-26-satisfied">
                    <span className="icon">
                      <Image
                        src={lIcon}
                        width={40}
                        height={40}
                        alt="Banner Icon"
                      />
                    </span>
                    <div className="cont">
                      <h6 className="satis-title">99%</h6>
                      <span className="satis-subtitle">Satisfied</span>
                    </div>
                  </div>
                  <div className="rbt-banner-26-album">
                    <span className="icon">
                      <Image
                        src={ialbum}
                        width={35}
                        height={40}
                        alt="Banner Icon"
                      />
                    </span>
                    <div className="cont">
                      <h6 className="satis-title">200+</h6>
                      <span className="satis-subtitle">Video Course</span>
                    </div>
                  </div>
                  <div className="rbt-banner-26-team">
                    <div className="team-cont">
                      <span className="icon">
                        <Image
                          src={Icon2}
                          width={34}
                          height={42}
                          alt="image"
                          unoptimized={true}
                        />
                      </span>
                      <div className="cont">
                        <h6 className="satis-title">36k+</h6>
                        <span className="satis-subtitle">Active Students</span>
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
                            width={51}
                            height={51}
                            unoptimized={true}
                          />
                        </Link>
                      ))}
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

export default IslamicCenterBanner;
