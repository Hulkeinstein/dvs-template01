import React, { useState } from "react";
import Image from "next/image";

import fShadow from "../../public/images/shape/f-shadow-01.png";
import fShadow2 from "../../public/images/shape/f-shadow-02.png";
import titleCheck from "../../public/images/shape/title-check.png";
import Link from "next/link";

const CoachingForm = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Service Selection",
    "Date & Time",
    "Your Information",
    "Payments",
  ];
  const nextStep = () => {
    setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev));
  };

  return (
    <>
      <div className="rbt-book-area rbt-book-sec-01">
        <div className="container">
          <div className="multi-step-form">
            <div className="shapes">
              <div className="shape-1">
                <Image
                  src={fShadow}
                  width={254}
                  height={365}
                  alt="Shadow Shape"
                />
              </div>
              <div className="shape-2">
                <Image
                  src={fShadow2}
                  width={269}
                  height={232}
                  alt="Shadow Shape"
                />
              </div>
            </div>
            <div className="section-title text-center">
              <h2 className="title w-600">
                Book Your <span className="theme-gradient">Coaching</span>{" "}
                <br /> <span className="theme-gradient">Session</span> Now!{" "}
                <Image src={titleCheck} width={42} height={42} alt="Check" />
              </h2>
            </div>

            <div className="multi-step-form-row mt--40">
              <div className="multi-step-form-left">
                <div className="multisteps-form__progress">
                  {steps.map((step, index) => (
                    <button
                      key={index}
                      className={`multisteps-form__progress-btn ${
                        index <= currentStep ? "rbt-active" : ""
                      }`}
                      type="button"
                      onClick={nextStep}
                    >
                      <span className="title">{step}</span>
                      <span className="check-icon">
                        <i className="feather-check"></i>
                      </span>
                    </button>
                  ))}
                </div>

                <div className="contact mt--50">
                  <h6 className="title">Get In Touch</h6>
                  <ul>
                    <li>
                      <i className="feather-phone"></i>{" "}
                      <Link href="tel:+1-202-555-0174">+1-202-555-0174</Link>
                    </li>
                    <li>
                      <i className="feather-mail"></i>{" "}
                      <Link href="mailto:zara.info@gmail.com">
                        zara.info@gmail.com
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="multi-step-form-right">
                <form className="multisteps-form__form">
                  {steps.map((step, index) => (
                    <div
                      key={index}
                      className={`multisteps-form__panel ${
                        currentStep === index ? "rbt-active" : ""
                      }`}
                    >
                      <div className="content">
                        <h5 className="w-500 mt--20 pl--30 pr--30">{step}</h5>
                        <hr />

                        {index === 0 && (
                          <div className="pt--10 pl--30 pr--30">
                            <span className="select-label d-block">
                              Service Type:
                            </span>
                            <select className="w-100 service-select">
                              <option>Life Coaching</option>
                              <option>Education</option>
                              <option>Course</option>
                              <option>Art</option>
                              <option>Web Design</option>
                            </select>
                          </div>
                        )}
                        {index === 1 && (
                          <div className="pt--10 pl--30 pr--30">
                            <span className="select-label d-block">Date:</span>
                            <input type="date" />
                            <span className="select-label d-block mt--25">
                              Time:
                            </span>
                            <input type="time" />
                          </div>
                        )}
                        {index === 2 && (
                          <div className="pt--10 pl--30 pr--30">
                            <label className="select-label d-block">
                              Your Name:
                            </label>
                            <input placeholder="e.g. John Doe" type="text" />
                            <label className="select-label d-block mt--25">
                              Your Email:
                            </label>
                            <input
                              placeholder="e.g. example@mail.com"
                              type="email"
                            />
                          </div>
                        )}
                        {index === 3 && (
                          <div className="pt--10 pl--30 pr--30">
                            <label className="select-label d-block">
                              Payment Method:
                            </label>
                            <select className="w-100 service-select">
                              <option>Credit Card</option>
                              <option>PayPal</option>
                              <option>Apple Pay</option>
                            </select>
                            <label className="select-label d-block mt--25">
                              Transaction ID:
                            </label>
                            <input
                              placeholder="e.g. 3044539R353TW"
                              required
                              type="text"
                            />
                          </div>
                        )}
                      </div>

                      <div className="btn-wrap d-flex justify-content-between">
                        {index > 0 && (
                          <button
                            className="rbt-btn btn-md rbt-step-btn-prev"
                            type="button"
                            onClick={prevStep}
                          >
                            Prev
                          </button>
                        )}
                        {index < steps.length - 1 ? (
                          <button
                            className="btn btn-primary rbt-btn btn-gradient rbt-step-btn-next"
                            type="button"
                            onClick={nextStep}
                          >
                            Continue
                          </button>
                        ) : (
                          <button
                            className="btn btn-primary rbt-btn btn-gradient"
                            type="submit"
                          >
                            Submit
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CoachingForm;
