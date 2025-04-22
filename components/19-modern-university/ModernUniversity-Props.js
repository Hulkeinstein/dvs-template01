import React from "react";
import Image from "next/image";
import Link from "next/link";

const ModernUniversityProps = ({
  parentClass,
  bannerImg,
  rating,
  trustpilotImg,
  title,
  desc,
  userProfiles,
}) => {
  return (
    <>
      <div className={`rbt-banner-item bg_image ${parentClass}`}>
        <div className="shape-1">
          <Image src={bannerImg} width={155} height={33} alt="Shape" />
        </div>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="inner">
                <h6 className="subtitle">
                  <span>
                    <Image
                      width={225}
                      height={26}
                      src={trustpilotImg}
                      alt="trustpilot"
                    />
                  </span>
                  {rating}
                </h6>
                <h1 className="title">{title}</h1>
                <p className="description">{desc}</p>
                <div className="bottom-content d-flex align-items-center gap-5 flex-wrap">
                  <Link
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
                  </Link>
                  <div className="d-flex flex-wrap gap-4 align-items-center">
                    <div className="profile-share">
                      {userProfiles &&
                        userProfiles.map((profile, index) => (
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
    </>
  );
};

export default ModernUniversityProps;
