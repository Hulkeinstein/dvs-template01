import Image from "next/image";
import React from "react";

import courseFeatures from "../../data/pages/lifeCoach.json";

const LifeCoachFeature = () => {
  return (
    <>
      <div className="rbt-feature-area bg-color-white rbt-section-gap">
        <div className="container">
          <div className="row mb--60 mb_sm--50">
            <div className="col-lg-12">
              <div className="section-title text-center">
                <span className="subtitle bg-primary-opacity">
                  The Practice
                </span>
                <h2 className="title w-600">
                  Our Job Is To Help You <br /> Grow Mentally
                </h2>
              </div>
            </div>
          </div>
          <div className="row g-5 rbt-index-upper">
            {courseFeatures.coachFeature.map((feature) => (
              <div
                key={feature.id}
                className="col-xl-4 col-lg-6 col-md-6 col-12"
              >
                <div className="rbt-feature-card">
                  <div className="d-sm-flex align-items-center gap-4">
                    <span className={`icon ${feature.bgColor}`}>
                      <Image
                        src={feature.icon}
                        alt="Banner Icon"
                        width={feature.wdt}
                        height={feature.htd}
                      />
                    </span>
                    <h6 className="card-title mt-4 mt-sm-0">{feature.title}</h6>
                  </div>
                  <p className="description">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default LifeCoachFeature;
