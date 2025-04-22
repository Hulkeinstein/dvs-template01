"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Link as ScrollLink } from "react-scroll";

const CourseMenu = () => {
  const pathname = usePathname();
  const [currentSection, setCurrentSection] = useState("overview");

  const menuClass = ["/course-detail-8"].some((path) =>
    pathname.startsWith(path)
  );

  const sections = [
    { id: "overview", label: "Overview" },
    { id: "coursecontent", label: "Course Content" },
    { id: "details", label: "Details" },
    { id: "intructor", label: "Intructor" },
    { id: "review", label: "Review" },
  ];

  useEffect(() => {
    const sectionIds = [
      "overview",
      "coursecontent",
      "details",
      "intructor",
      "review",
    ];

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (const sectionId of sectionIds) {
        const element = document.getElementById(sectionId);

        if (element && scrollPosition >= element.offsetTop) {
          setCurrentSection(sectionId);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [currentSection]);

  return (
    <>
      <nav className="mainmenu-nav onepagenav">
        <ul
          className={`mainmenu ${
            menuClass ? "pt--10 pb--10 px-4 justify-content-center" : ""
          }`}
        >
          {sections.map((sec, i) => (
            <li className={currentSection === sec.id ? "current" : ""} key={i}>
              <ScrollLink
                to={sec.id}
                spy={true}
                smooth={true}
                duration={500}
                offset={-70}
                style={{ cursor: "pointer" }}
              >
                {sec.label}
              </ScrollLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default CourseMenu;
