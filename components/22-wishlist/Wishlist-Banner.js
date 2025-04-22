"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";

import wHello from "../../public/images/shape/w-hello.png";
import wColorElemt from "../../public/images/shape/w-color-elemt.png";
import wToolsElemt from "../../public/images/shape/w-tools-elemt.png";
import wCursor from "../../public/images/shape/w-cursor.png";
import wShadow from "../../public/images/shape/w-shadow.png";
import wBanner from "../../public/images/banner/w-banner.png";

const profiles = [
  { name: "Ava Miller", src: "/images/shape/art-stu-2.png" },
  { name: "Mark Jordan", src: "/images/shape/art-stu-1.png" },
  { name: "Jordan", src: "/images/shape/art-stu-3.png" },
];

const WishlistBanner = () => {
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  // Shape move
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

  // Cursor move
  useEffect(() => {
    let mouseX = 0,
      mouseY = 0;
    let xp = 0,
      yp = 0;

    const cursorFollower = document.getElementById("cursorFollower");
    const container = document.querySelector(".cf_boundary");

    if (cursorFollower && container) {
      const handleMouseMove = (e) => {
        const rect = container.getBoundingClientRect();

        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;

        const maxX = rect.width - cursorFollower.offsetWidth / 2;
        const maxY = rect.height - cursorFollower.offsetHeight / 2;
        const minX = cursorFollower.offsetWidth / 2;
        const minY = cursorFollower.offsetHeight / 2;

        mouseX = Math.max(minX, Math.min(mouseX, maxX));
        mouseY = Math.max(minY, Math.min(mouseY, maxY));
      };

      document.addEventListener("mousemove", handleMouseMove);

      const animateCursor = () => {
        xp += (mouseX - xp) * 0.1;
        yp += (mouseY - yp) * 0.1;

        if (cursorFollower) {
          cursorFollower.style.left = `${xp}px`;
          cursorFollower.style.top = `${yp}px`;
        }

        requestAnimationFrame(animateCursor);
      };

      animateCursor();

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, []);

  return (
    <>
      <div className="rbt-banner-area rbt-banner-22">
        <div className="wrapper">
          <div className="container">
            <div className="inner">
              <div className="shape-wrapper">
                <div className="shape-1">
                  <Image
                    src={wHello}
                    width={69}
                    height={52}
                    alt="Banner Shape"
                  />
                </div>
                <div className="shape-2 scene">
                  <span data-depth="1">
                    <Image
                      src={wColorElemt}
                      width={99}
                      height={99}
                      style={{
                        transform: `translate(${offsetX * 2}px, ${
                          offsetY * 2
                        }px)`,
                      }}
                      alt="Banner Shape"
                    />
                  </span>
                </div>
                <div className="shape-3 scene">
                  <span data-depth="1">
                    <Image
                      src={wToolsElemt}
                      width={127}
                      height={127}
                      style={{
                        transform: `translate(${offsetX * 2}px, ${
                          offsetY * -2
                        }px)`,
                      }}
                      alt="Banner Shape"
                    />
                  </span>
                </div>
              </div>
              <div className="content">
                <h1 className="title">
                  We’re making an course on{" "}
                  <span className="theme-gradient cf_boundary">
                    UX/UI{" "}
                    <Image
                      id="cursorFollower"
                      className="cursorFollower"
                      src={wCursor}
                      width={25}
                      height={25}
                      alt="Cursor Icon"
                    />
                  </span>
                  Advanced
                </h1>
                <p className="description">
                  Training, Practice, Portfolio, Certificate, And Successful
                  Career All In One.
                </p>
                <form
                  action="#"
                  className="newsletter-form-1 radius-round btn-mobile-center"
                >
                  <input
                    className="rbt-border"
                    type="email"
                    placeholder="Enter Your Email"
                  />
                  <button
                    type="submit"
                    className="rbt-btn btn-md btn-gradient hover-icon-reverse radius-round"
                  >
                    <span className="icon-reverse-wrapper">
                      <span className="btn-text">Join Wishlist</span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                      <span className="btn-icon">
                        <i className="feather-arrow-right"></i>
                      </span>
                    </span>
                  </button>
                </form>
                <div className="students">
                  <div className="profile-share">
                    {profiles &&
                      profiles.map((profile, index) => (
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
                  </div>
                  <div>
                    <h6 className="number">2,364</h6>
                    <p className="number-title">Students already joined</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="banner">
              <div className="shape-shadow">
                <Image
                  src={wShadow}
                  width={1305}
                  height={1187}
                  alt="Banner Shadow"
                />
              </div>
              <div className="browser">
                <div className="browser-img">
                  <Image
                    src={wBanner}
                    width={1321}
                    height={662}
                    alt="Banner Brwoser"
                  />
                </div>
                <video autoPlay muted loop>
                  <source
                    src="/images/video/wishlist-video-01.mp4"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WishlistBanner;
