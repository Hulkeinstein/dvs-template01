import Image from "next/image";
import React from "react";
import healthFeatures from "../../data/pages/healthInstitute.json";

const HealthFeature = () => {
  return (
    <div className="row g-5 rbt-index-upper mb--10">
      {healthFeatures.feature.map((feature) => (
        <div key={feature.id} className="col-xl-4 col-lg-6 col-md-6 col-12">
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
  );
};

export default HealthFeature;
