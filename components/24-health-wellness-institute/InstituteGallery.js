import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

import "venobox/dist/venobox.min.css";

import galleryData from "../../data/pages/healthInstitute.json";

const InstituteGallery = () => {
  useEffect(() => {
    import("venobox/dist/venobox.min.js").then((venobox) => {
      new venobox.default({
        selector: ".child-gallery-single",
      });
    });
  }, []);
  return (
    <div className="row g-3 g-sm-4 g-md-5 parent-gallery-container">
      {galleryData.galleryItems.map((item, index) => (
        <Link
          href={item.href}
          className={item.classes}
          key={index}
          data-vbtype="image"
          data-gall="gallery"
        >
          <div className="rbt-gallery">
            <Image
              className="w-100 radius-10"
              src={item.src}
              alt={item.alt}
              width={500}
              height={300}
              unoptimized={true}
            />
          </div>
        </Link>
      ))}
    </div>
  );
};

export default InstituteGallery;
