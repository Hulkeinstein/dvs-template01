import Image from "next/image";
import Link from "next/link";

import logo from "../../public/images/logo/logo.png";
import logoLight from "../../public/images/dark/logo/logo-light.png";
import footerBg from "../../public/images/shape/islamic-footer-bg.png";
import footerMoon from "../../public/images/shape/i-moon.png";
import footerStar from "../../public/images/shape/i-star.png";

import CopyRight from "./CopyRight";

import FooterData from "../../data/footer.json";
import SingleFooter from "./FooterProps/SingleFooter";
import { useAppContext } from "@/context/Context";

const FooterOne = ({ isBox, bgColor, newsletterBorder, islamic }) => {
  const { isLightTheme } = useAppContext();
  
  return (
    <>
      <footer
        className={`rbt-footer ${
          newsletterBorder === undefined ? "" : "rbt-footer-shadow-1"
        } footer-style-1 ${bgColor ? bgColor : "bg-color-white"} ${
          isBox ? isBox : ""
        } ${islamic === undefined ? "" : "footer-islamic"} overflow-hidden`}
      >
        {newsletterBorder === undefined ? (
          ""
        ) : (
          <div className="gradient-shadow-top"></div>
        )}
        {newsletterBorder === undefined ? (
          ""
        ) : (
          <div className="gradient-shadow-bottom"></div>
        )}

        {islamic === undefined ? (
          ""
        ) : (
          <div className="shape-bg">
            <Image
              src={footerBg}
              width={1425}
              height={326}
              alt="Background Image"
            />
          </div>
        )}
        {islamic === undefined ? (
          ""
        ) : (
          <div className="moon">
            <Image src={footerMoon} width={45} height={48} alt="Moon" />
          </div>
        )}

        {islamic === undefined ? (
          ""
        ) : (
          <div className="star">
            <Image src={footerStar} width={33} height={39} alt="Star" />
          </div>
        )}
        <div className="footer-top">
          <div className="container">
            {FooterData &&
              FooterData.footerTwo.map((footer, index) => (
                <div className="row g-5" key={index}>
                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="footer-widget">
                      <div className="logo">
                        <Link href="/">
                          {isLightTheme ? (
                            <Image
                              src={logo}
                              width={152}
                              height={50}
                              priority={true}
                              alt="Education Logo Images"
                            />
                          ) : (
                            <Image
                              src={logoLight}
                              width={152}
                              height={50}
                              priority={true}
                              alt="Education Logo Images"
                            />
                          )}
                        </Link>
                      </div>

                      <p className="description mt--20">{footer.description}</p>

                      <ul className="social-icon social-default justify-content-start">
                        {footer.socialLink.map((value, innerIndex) => (
                          <li key={innerIndex}>
                            <Link href={value.link}>
                              <i className={value.icon}></i>
                            </Link>
                          </li>
                        ))}
                      </ul>

                      <div className="contact-btn mt--30">
                        <Link
                          className="rbt-btn hover-icon-reverse btn-border-gradient radius-round"
                          href="#"
                        >
                          <div className="icon-reverse-wrapper">
                            <span className="btn-text">Contact With Us</span>
                            <span className="btn-icon">
                              <i className="feather-arrow-right"></i>
                            </span>
                            <span className="btn-icon">
                              <i className="feather-arrow-right"></i>
                            </span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <SingleFooter
                    classOne="col-lg-2 col-md-6 col-sm-6 col-12 mt--30"
                    title="Useful Links"
                    footerType={footer.usefulLinks}
                  />
                  <SingleFooter
                    classOne="col-lg-2 col-md-6 col-sm-6 col-12"
                    title="Our Company"
                    footerType={footer.ourCompany}
                  />

                  <div className="col-lg-4 col-md-6 col-sm-6 col-12">
                    <div className="footer-widget">
                      <h5 className="ft-title">Get Contact</h5>
                      <ul className="ft-link">
                        <li>
                          <span>Phone: </span>
                          <Link href="#">{footer.phone}</Link>
                        </li>
                        <li>
                          <span>E-mail:</span>
                          <Link href="mailto:hr@example.com">
                            {footer.mail}
                          </Link>
                        </li>
                      </ul>

                      {newsletterBorder === undefined ? (
                        ""
                      ) : (
                        <h6 className="w-600 mt--25">Newsletter</h6>
                      )}

                      {newsletterBorder === undefined ? (
                        <form className="newsletter-form mt--20" action="#">
                          <h6 className="w-600">Newsletter</h6>
                          <p className="description">{footer.descriptionTwo}</p>

                          <div className="form-group right-icon icon-email mb--20">
                            <input
                              id="email"
                              type="email"
                              placeholder="Enter Your Email Here"
                            />
                          </div>

                          <div className="form-group mb--0">
                            <button
                              className="rbt-btn rbt-switch-btn btn-gradient radius-round btn-sm"
                              type="submit"
                            >
                              <span data-text="Submit Now">Submit Now</span>
                            </button>
                          </div>
                        </form>
                      ) : (
                        <form
                          action="#"
                          className="newsletter-form-1 version-02 mt--15 radius-round"
                        >
                          <input
                            className="rbt-border"
                            type="email"
                            placeholder="Enter Your E-Email"
                          />
                          <button
                            className="rbt-btn rbt-switch-btn btn-gradient radius-round btn-md"
                            type="submit"
                          >
                            <span data-text="Subscribe">Subscribe</span>
                          </button>
                        </form>
                      )}

                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <CopyRight />
      </footer>
    </>
  );
};

export default FooterOne;
