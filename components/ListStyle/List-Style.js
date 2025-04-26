import React from "react";
import { Check, X, Heart, Flag, Eye, Edit2, BatteryCharging, Book, Monitor } from "react-feather";

const ListStyle = () => {
  return (
    <div className="container">
      <div className="row g-5">
        <div className="col-lg-6 col-md-12 col-12">
          <ul className="rbt-list-style-1">
            <li>
              <Check />Become an advanced, confident.
            </li>
            <li>
              <Check />Have an intermediate skill level
              of.
            </li>
            <li>
              <Check />Have a portfolio of various data.
            </li>
            <li>
              <Check />Use the numpy library to create.
            </li>
          </ul>
        </div>
        <div className="col-lg-6 col-md-12 col-12">
          <ul className="rbt-list-style-2">
            <li>
              <Check />No Cridit Card
            </li>
            <li>
              <Check />14 Days Trial
            </li>
            <li>
              <Check />Free For Teachers
            </li>
          </ul>
        </div>
      </div>

      <div className="row g-5 mt--40">
        <div className="col-lg-4 col-md-6 col-12">
          <ul>
            <li>Name (required)</li>
            <li>Age (required)</li>
            <li>Date of birth (required)</li>
            <li>Passport/ ID no (required)</li>
            <li>Current career (required)</li>
            <li>Mobile phone numbers (required)</li>
          </ul>
        </div>
        <div className="col-lg-4 col-md-6 col-12">
          <ul className="plan-offer-list">
            <li>
              <Check /> 5 PPC Campaigns
            </li>
            <li>
              <Check /> Digital Marketing
            </li>
            <li>
              <Check /> Marketing Agency
            </li>
            <li>
              <Check /> Seo Friendly
            </li>
            <li>
              <Check /> App Development
            </li>
            <li className="off">
              <X /> 24/7 Dedicated Support
            </li>
          </ul>
        </div>
        <div className="col-lg-4 col-md-6 col-12">
          <ul className="plan-offer-list rbt-list-primary-opacity">
            <li>
              <Check /> 5 PPC Campaigns
            </li>
            <li>
              <Check /> Digital Marketing
            </li>
            <li>
              <Check /> Marketing Agency
            </li>
            <li>
              <Check /> Seo Friendly
            </li>
            <li>
              <Check /> App Development
            </li>
            <li className="off">
              <X /> 24/7 Dedicated Support
            </li>
          </ul>
        </div>
        <div className="col-lg-6 col-md-6 col-12">
          <div className="bg-gradient-7 rbt-shadow-box">
            <ul className="plan-offer-list rbt-list-white-opacity ">
              <li className="color-white">
                <Check /> 5 PPC Campaigns
              </li>
              <li className="color-white">
                <Check /> Digital Marketing
              </li>
              <li className="color-white">
                <Check /> Marketing Agency
              </li>
              <li className="color-white">
                <Check /> Seo Friendly
              </li>
              <li className="color-white">
                <Check /> App Development
              </li>
              <li className="off color-white">
                <X /> 24/7 Dedicated Support
              </li>
            </ul>
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-12">
          <ul className="rbt-list-style-3">
            <li>
              <Heart /> Health and Wellness
            </li>
            <li>
              <Flag /> Literacy and Language
            </li>
            <li>
              <Eye /> Social-Emotional Learning
            </li>
            <li>
              <Edit2 /> Visual and Creative Arts
            </li>
            <li>
              <BatteryCharging /> Thinking and Learning
            </li>
          </ul>
        </div>
      </div>

      <div className="row g-5 pt--60">
        <div className="col-lg-6">
          <div className="rbt-feature-wrapper">
            <div className="rbt-feature feature-style-1">
              <div className="icon bg-pink-opacity">
                <Heart />
              </div>
              <div className="feature-content">
                <h6 className="feature-title">Flexible Classes</h6>
                <p className="feature-description">
                  It is a long established fact that a reader will be distracted
                  by this on readable content of when looking at its layout.
                </p>
              </div>
            </div>

            <div className="rbt-feature feature-style-1">
              <div className="icon bg-primary-opacity">
                <Book />
              </div>
              <div className="feature-content">
                <h6 className="feature-title">Learn From Anywhere</h6>
                <p className="feature-description">
                  Sed distinctio repudiandae eos recusandae laborum eaque non
                  eius iure suscipit laborum eaque non eius iure suscipit.
                </p>
              </div>
            </div>

            <div className="rbt-feature feature-style-1">
              <div className="icon bg-coral-opacity">
                <Monitor />
              </div>
              <div className="feature-content">
                <h6 className="feature-title">
                  Experienced Teachers service.
                </h6>
                <p className="feature-description">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Officia, aliquid mollitia Officia, aliquid mollitia.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="rbt-feature-wrapper">
            <div className="rbt-feature feature-style-2">
              <div className="icon bg-pink-opacity">
                <Heart />
              </div>
              <div className="feature-content">
                <h6 className="feature-title">Flexible Classes</h6>
                <p className="feature-description">
                  It is a long established fact that a reader will be distracted
                  by this on readable content of when looking at its layout.
                </p>
              </div>
            </div>

            <div className="rbt-feature feature-style-2">
              <div className="icon bg-primary-opacity">
                <Book />
              </div>
              <div className="feature-content">
                <h6 className="feature-title">Learn From Anywhere</h6>
                <p className="feature-description">
                  Sed distinctio repudiandae eos recusandae laborum eaque non
                  eius iure suscipit laborum eaque non eius iure suscipit.
                </p>
              </div>
            </div>

            <div className="rbt-feature feature-style-2">
              <div className="icon bg-coral-opacity">
                <Monitor />
              </div>
              <div className="feature-content">
                <h6 className="feature-title">
                  Experienced Teachers service.
                </h6>
                <p className="feature-description">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Officia, aliquid mollitia Officia, aliquid mollitia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListStyle;
