import React from "react";
import Link from "next/link";
import Image from "next/image";
import { IconComponent } from "../Common/IconComponent";

import { useAppContext } from "@/context/Context";

import TeamData from "../../data/elements/team.json";

const TeamTen = () => {
  const { team, setTeam } = useAppContext();
  return (
    <>
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12">
            <div className="section-title text-center mb--60">
              <h2 className="theme-gradient rbt-display-1">
                Our <strong>Experts</strong>
              </h2>
              <p className="description has-medium-font-size mt--20">
                Find the instructor that&apos;s right for you. Through the
                platform you <br />
                can connect with thousands of statistics instructors.
              </p>
              <div className="row">
                <div className="col-lg-12">
                  <div className="section-action-btn text-center mt--40">
                    <Link
                      className="rbt-btn btn-gradient hover-icon-reverse"
                      href="#"
                    >
                      <span className="icon-reverse-wrapper">
                        <span className="btn-text">See All Instructor</span>
                        <span className="btn-icon">
                          <IconComponent iconName="feather-arrow-right" />
                        </span>
                        <span className="btn-icon">
                          <IconComponent iconName="feather-arrow-right" />
                        </span>
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row g-5">
          {TeamData &&
            TeamData.team.slice(0, 4).map((data, index) => (
              <div
                className="col-lg-3 col-md-6 col-sm-6 col-12"
                key={index}
                data-sal-delay="150"
                data-sal="slide-up"
                data-sal-duration="800"
              >
                {data.details.map((item, innerIndex) => (
                  <div
                    className="rbt-team-modal-thumb h-100"
                    key={innerIndex}
                    data-bs-toggle="modal"
                    data-bs-target={`#exampleModal${index}`}
                    onClick={() => setTeam(item.id)}
                  >
                    <div className="thumb">
                      <Image
                        src={item.img}
                        width={415}
                        height={555}
                        alt="Testimonial Images"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>

      <div className={team ? "team-details-popup open" : "team-details-popup"}>
        <div className="thumbnail thumbnail-popup">
          <div className="close-popup">
            <button
              className="rbt-round-btn"
              onClick={() => setTeam("")}
            >
              <IconComponent iconName="feather-x" />
            </button>
          </div>
          {TeamData &&
            TeamData.team.map((data, index) => (
              <div key={index}>
                {data.details.map(
                  (item, innerIndex) =>
                    team === item.id && (
                      <div className="inner" key={innerIndex}>
                        <div className="row g-5 row--30 align-items-center">
                          <div className="col-lg-6">
                            <div className="rbt-team-thumbnail">
                              <div className="thumb">
                                <Image
                                  src={item.img}
                                  width={415}
                                  height={555}
                                  alt="Corporate Template"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="col-lg-6">
                            <div className="rbt-team-details">
                              <div className="author-info">
                                <h4 className="title">{item.name}</h4>
                                <span className="designation theme-gradient">
                                  {item.type}
                                </span>
                                <span className="team-form">
                                  <IconComponent iconName="feather-map-pin" />
                                  <span className="location">
                                    {item.location}
                                  </span>
                                </span>
                              </div>
                              <p className="mb--15">{item.desc}</p>

                              <p>{item.desc}</p>
                              <ul className="social-icon social-default mt--20 justify-content-start">
                                <li>
                                  <Link href="https://www.facebook.com/">
                                    <IconComponent iconName="feather-facebook" />
                                  </Link>
                                </li>
                                <li>
                                  <Link href="https://www.twitter.com">
                                    <IconComponent iconName="feather-twitter" />
                                  </Link>
                                </li>
                                <li>
                                  <Link href="https://www.instagram.com/">
                                    <IconComponent iconName="feather-instagram" />
                                  </Link>
                                </li>
                                <li>
                                  <Link href="https://www.linkdin.com/">
                                    <IconComponent iconName="feather-linkedin" />
                                  </Link>
                                </li>
                              </ul>
                              <ul className="rbt-information-list mt--25">
                                <li>
                                  <Link href="#">
                                    <IconComponent iconName="feather-phone" />
                                    {item.phone}
                                  </Link>
                                </li>
                                <li>
                                  <Link href="mailto:hello@example.com">
                                    <IconComponent iconName="feather-mail" />
                                    {item.email}
                                  </Link>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div className="top-circle-shape"></div>
                      </div>
                    )
                )}
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default TeamTen;
