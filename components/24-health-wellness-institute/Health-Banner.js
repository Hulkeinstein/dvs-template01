import React from "react";
import Image from "next/image";
import Link from "next/link";

import bannerImg from "../../public/images/banner/h-banner.png";

const profiles = [
  { name: "Ava Miller", src: "/images/shape/art-stu-2.png" },
  { name: "Mark Jordan", src: "/images/shape/art-stu-1.png" },
  { name: "Jordan", src: "/images/shape/art-stu-3.png" },
];
const HealthBanner = () => {
  return (
    <>
      <div className="rbt-banner-area rbt-banner-24">
        <div className="wrapper">
          <div className="banner-img">
            <Image
              src={bannerImg}
              width={1425}
              height={820}
              unoptimized={true}
              alt="Banner Image"
            />
          </div>
          <div className="container">
            <div className="content-wrapper">
              <div className="row row--40">
                <div className="col-lg-7 col-12">
                  <div className="title-wrap">
                    <div className="rbt-new-badge rbt-new-badge-one">
                      <span className="color-primary">
                        Admission Open 2024-25
                      </span>
                    </div>
                    <h1 className="title">
                      Community Health & Wellness Institute
                    </h1>
                  </div>
                </div>
                <div className="col-lg-5 col-12">
                  <div className="inner">
                    <p className="description">
                      The institute of medical science offers a wide range of
                      stimulating
                      <span className="bold">Master of Science.</span>
                    </p>
                    <div className="d-flex flex-wrap gap-5 align-items-center">
                      <a
                        className="rbt-btn btn-gradient hover-icon-reverse"
                        href="#"
                      >
                        <span className="icon-reverse-wrapper">
                          <span className="btn-text">Apply Today</span>
                          <span className="btn-icon">
                            <i className="feather-arrow-right"></i>
                          </span>
                          <span className="btn-icon">
                            <i className="feather-arrow-right"></i>
                          </span>
                        </span>
                      </a>
                      <div className="d-flex flex-wrap gap-4 align-items-center">
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
                        <div>
                          <h6 className="number mb-0">36K+</h6>
                          <p className="number-title">Enrolled Students</p>
                        </div>
                      </div>
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

export default HealthBanner;
