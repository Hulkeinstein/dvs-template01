import React, { useEffect } from "react";
import Image from "next/image";
import sal from "sal.js";
import { useParallax } from "react-scroll-parallax";

import WishlistBanner from "./Wishlist-Banner";

import bgShape from "../../public/images/shape/wishlist-title-bg-shape.png";
import wishCourse from "../../public/images/course/wishlist-course-01.png";
import wishCourse3 from "../../public/images/course/wishlist-course-03.png";
import wishCourse4 from "../../public/images/course/wishlist-course-04.png";
import wishCourse5 from "../../public/images/course/wishlist-course-05.png";
import wishCourseGif from "../../public/images/course/wishlist-course-02.gif";
import wishTextShape from "../../public/images/shape/wishlist-text-shape-01.png";
import wishTextShape2 from "../../public/images/shape/wishlist-text-shape-02.png";
import wishDot from "../../public/images/shape/wishlist-dots.png";
import wishMen from "../../public/images/shape/wishlist-b-men.png";

const Wishlist = () => {
  const { ref: ref1, style: style1 } = useParallax({
    translateY: [0, 40],
    easing: "easeOutQuad",
    speed: -1,
    lerp: 0.8,
  });

  useEffect(() => {
    sal({
      threshold: 0.01,
      once: true,
    });
  }, []);
  return (
    <>
      <WishlistBanner />

      <div className="rbt-course-area rbt-section-gapBottom">
        <div className="container">
          <div className="section-title-2 text-center with-shape mb--170 mb_lg--100 mb_md--100 mb_sm--100">
            <div className="shape-1" ref={ref1} style={style1}>
              <Image src={bgShape} width={285} height={285} alt="Shape" />
            </div>
            <h2 className="title">
              A design tool <span className="color-body">(Figma)</span> for
              crafting engaging UI/UX{" "}
              <span className="color-body">design experiences</span> and visual
              assets with <span className="theme-gradient">Histudy.</span>
            </h2>
          </div>
          <div className="row g-5">
            <div
              className="col-xl-6 col-lg-6 col-md-6 col-12"
              data-sal-delay="0"
              data-sal="slide-up"
              data-sal-duration="800"
            >
              <div className="rbt-card variation-03 style_2">
                <div className="rbt-card-body">
                  <h5 className="rbt-card-title">
                    Learn UX/UI Design, (Figma) Zero To Mastery
                  </h5>
                  <p className="rbt-card-text">
                    Take yourself a step further stay with me.
                  </p>
                </div>
                <div className="rbt-card-img">
                  <Image
                    src={wishCourse}
                    width={406}
                    height={355}
                    alt="Card image"
                  />
                </div>
              </div>
            </div>

            <div
              className="col-xl-6 col-lg-6 col-md-6 col-12"
              data-sal-delay="0"
              data-sal="slide-up"
              data-sal-duration="800"
            >
              <div className="rbt-card variation-03 style_2">
                <div className="rbt-card-body">
                  <h5 className="rbt-card-title">26 Lessons And 180 Hours</h5>
                  <p className="rbt-card-text">
                    We will teach different parts of each chapter, such as
                    Typography, Prototype, Color, and many more.
                  </p>
                </div>
                <div className="rbt-card-img">
                  <Image
                    className="w-100"
                    src={wishCourseGif}
                    width={538}
                    height={302}
                    alt="Card image"
                  />
                </div>
              </div>
            </div>

            <div
              className="col-xl-6 col-lg-6 col-md-6 col-12"
              data-sal-delay="100"
              data-sal="slide-up"
              data-sal-duration="800"
            >
              <div className="rbt-card variation-03 style_2">
                <div className="rbt-card-body">
                  <h5 className="rbt-card-title">
                    Know About Figma, PS, XD, AI
                  </h5>
                  <p className="rbt-card-text">
                    The tools needed for the job will be taught.
                  </p>
                </div>
                <div className="rbt-card-img">
                  <Image
                    src={wishCourse3}
                    width={402}
                    height={368}
                    alt="Card image"
                  />
                </div>
              </div>
            </div>

            <div
              className="col-xl-6 col-lg-6 col-md-6 col-12"
              data-sal-delay="100"
              data-sal="slide-up"
              data-sal-duration="800"
            >
              <div className="rbt-card variation-03 style_2">
                <div className="rbt-card-body">
                  <h5 className="rbt-card-title">Learn Offline & Online</h5>
                  <p className="rbt-card-text">
                    The tools needed for the job will be taught.
                  </p>
                </div>
                <div className="rbt-card-img">
                  <Image
                    src={wishCourse4}
                    width={448}
                    height={354}
                    alt="Card image"
                  />
                </div>
              </div>
            </div>

            <div
              className="col-12"
              data-sal-delay="150"
              data-sal="slide-up"
              data-sal-duration="800"
            >
              <div className="rbt-card variation-03 style_2 card-horizontal">
                <div className="rbt-card-body">
                  <h6>
                    <span className="theme-gradient">Support System</span>
                  </h6>
                  <h5 className="rbt-card-title">
                    I’m{" "}
                    <span>
                      <Image
                        src={wishTextShape}
                        width={36}
                        height={36}
                        alt="Shape"
                      />
                    </span>{" "}
                    Always With You, To Solve Any
                    <span>
                      <Image
                        src={wishTextShape2}
                        width={48}
                        height={48}
                        alt="Shape"
                      />
                    </span>
                    Problem
                  </h5>
                  <p className="rbt-card-text">
                    Feel free to let me know if there is any problem with the
                    work and solve it.
                  </p>
                </div>
                <div className="rbt-card-img-wrap">
                  <div className="shape-1">
                    <Image src={wishDot} width={66} height={32} alt="Shape" />
                  </div>
                  <div className="men-circle">
                    <Image src={wishMen} width={151} height={145} alt="Shape" />
                  </div>
                  <div className="rbt-card-img">
                    <Image
                      src={wishCourse5}
                      width={580}
                      height={270}
                      alt="Card image"
                    />
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

export default Wishlist;
