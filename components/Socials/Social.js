import Link from "next/link";
import React from "react";
import { Facebook, Twitter, Instagram, Linkedin } from "react-feather";

const Social = ({ classOne, classList }) => {
  return (
    <div className={classOne}>
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <ul className={classList}>
              <li>
                <Link href="https://www.facebook.com/">
                  <Facebook />
                </Link>
              </li>
              <li>
                <Link href="https://www.twitter.com">
                  <Twitter />
                </Link>
              </li>
              <li>
                <Link href="https://www.instagram.com/">
                  <Instagram />
                </Link>
              </li>
              <li>
                <Link href="https://www.linkdin.com/">
                  <Linkedin />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Social;
