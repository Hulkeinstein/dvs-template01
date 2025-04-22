import Image from "next/image";
import Link from "next/link";

import TestimonialData from "../../data/elements/testimonial.json";

const TestimonialFour = ({ isGradient, leftContent }) => {
  return (
    <>
      {TestimonialData &&
        TestimonialData.testimonialFour.map((data, index) => (
          <div className="container" key={index}>
            {leftContent === undefined ? (
              <div className="row">
                <div className="col-lg-12 mb--60 mb_sm--50">
                  {isGradient ? (
                    <div className="section-title text-center">
                      <h6 className="b2 mb--15">
                        <span className="theme-gradient">Testimonials</span>
                      </h6>
                      <h2 className="title w-600">
                        Student's{" "}
                        <span className="theme-gradient">Feedback</span>
                      </h2>
                    </div>
                  ) : (
                    <div className="section-title text-center">
                      <span className="subtitle bg-primary-opacity">
                        {data.tag}
                      </span>
                      <h2 className="title">{data.title}</h2>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="row g-5 mb--50 align-items-center">
                <div className="col-lg-8 col-md-8 col-12">
                  <div className="section-title">
                    <span className="subtitle bg-primary-opacity">
                      EDUCATION FOR EVERYONE
                    </span>
                    <h2 className="title w-600">
                      Student's <span className="theme-gradient">Feedback</span>
                    </h2>
                  </div>
                </div>
                <div className="col-lg-4 col-md-4 col-12">
                  <div className="load-more-btn text-start text-md-end">
                    <a
                      className="rbt-btn btn-gradient hover-icon-reverse"
                      href="#"
                    >
                      <span className="icon-reverse-wrapper">
                        <span className="btn-text">View All Reviews</span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="row g-5">
              {data.body.map((item, innerIndex) => (
                <div className="col-lg-4 col-md-6 col-12" key={innerIndex}>
                  <div className="rbt-testimonial-box">
                    <div className="inner">
                      <div className="clint-info-wrapper">
                        <div className="thumb">
                          <Image
                            src={item.img}
                            width={494}
                            height={494}
                            alt="Clint Images"
                          />
                        </div>
                        <div className="client-info">
                          <h5 className="title">{item.title}</h5>
                          <span>
                            {item.position} <i>{item.company}</i>
                          </span>
                        </div>
                      </div>
                      <div className="description">
                        <p className="subtitle-3">{item.desc}</p>
                        <div className="rating mt--20">
                          <Link href="#">
                            <i className="fa fa-star"></i>
                          </Link>
                          <Link href="#">
                            <i className="fa fa-star"></i>
                          </Link>
                          <Link href="#">
                            <i className="fa fa-star"></i>
                          </Link>
                          <Link href="#">
                            <i className="fa fa-star"></i>
                          </Link>
                          <Link href="#">
                            <i className="fa fa-star"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </>
  );
};

export default TestimonialFour;
