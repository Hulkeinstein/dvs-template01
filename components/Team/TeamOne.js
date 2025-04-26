import Image from "next/image";
import Link from "next/link";
import { IconComponent } from "../Common/IconComponent";

import TeamData from "../../data/elements/team.json";
import TeamHead from "./TeamHead";

import { useAppContext } from "@/context/Context";

const TeamOne = ({ isHead }) => {
  const { team, setTeam } = useAppContext();

  return (
    <>
      <div className="container">
        {isHead ? (
          <TeamHead title="Team (With Popup)." desc="With Popup Style." />
        ) : (
          ""
        )}
        <div className="row g-5">
          {TeamData &&
            TeamData.team.slice(3, 9).map((data, index) => (
              <div
                className="col-lg-4 col-md-6 col-12 mt--30"
                key={index}
                data-sal-delay="150"
                data-sal="slide-up"
                data-sal-duration="800"
              >
                {data.details.map((item, innerIndex) => (
                  <div
                    className="rbt-team team-style-default style-three small-layout rbt-hover"
                    key={innerIndex}
                  >
                    <div className="inner">
                      <div className="thumbnail">
                        <Image
                          src={item.img}
                          width={415}
                          height={555}
                          priority
                          alt="Corporate Template"
                        />
                      </div>
                      <div className="content">
                        <h2 className="title">{item.name}</h2>
                        <h6 className="subtitle theme-gradient">{item.type}</h6>
                      </div>
                    </div>
                    <div className="rbt-team-modal-thumb">
                      <button
                        className="popup-modal-button rbt-btn rounded hover-icon-reverse bg-primary-opacity w-100 text-center"
                        onClick={() => setTeam(item.id)}
                      >
                        <span className="btn-text">View Profile</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>

      <div className={team ? "team-details-popup open" : "team-details-popup"}>
        <div className="thumbnail thumbnail-popup text-center">
          <div className="close-popup">
            <button
              className="rbt-round-btn circle btn-white-hover"
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
                        <div className="rbt-team-thumbnail mb--0">
                          <div className="thumb">
                            <Image
                              src={item.img}
                              width={415}
                              height={555}
                              alt="Corporate Template"
                            />
                          </div>
                        </div>
                        <div className="rbt-team-details pt--30">
                          <div className="author-info mb--20">
                            <h4 className="title">{item.name}</h4>
                            <span className="designation theme-gradient">{item.type}</span>
                            <div className="team-form mt--15">
                              <IconComponent iconName="feather-map-pin" />
                              <span className="location">{item.location}</span>
                            </div>
                          </div>
                          <p>{item.desc}</p>
                          <ul className="social-icon social-default icon-naked mt--20 justify-content-center">
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
                              <Link href="https://www.linkedin.com/">
                                <IconComponent iconName="feather-linkedin" />
                              </Link>
                            </li>
                          </ul>
                          <ul className="rbt-information-list mt--20">
                            <li>
                              <Link href="tel:+1-202-555-0174">
                                <IconComponent iconName="feather-phone" />
                                {item.phone}
                              </Link>
                            </li>
                            <li>
                              <Link href="mailto:example@gmail.com">
                                <IconComponent iconName="feather-mail" />
                                {item.email}
                              </Link>
                            </li>
                          </ul>
                        </div>
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

export default TeamOne;
