'use client';

import Link from 'next/link';
import { useState } from 'react';
import MenuData from '../../data/MegaMenu.json';
import CourseLayout from './NavProps/CourseLayout';
import PageLayout from './NavProps/PageLayout';
import DashboardNav from './DashboardNav';

const Nav = () => {
  const [activeMenuItem, setActiveMenuItem] = useState(null);
  const toggleMenuItem = (item) => {
    setActiveMenuItem(activeMenuItem === item ? null : item);
  };

  return (
    <nav className="mainmenu-nav">
      <ul className="mainmenu">
        <li>
          <Link href="/">Home</Link>
        </li>

        <li className="with-megamenu has-menu-child-item">
          <Link
            className={`${activeMenuItem === 'courses' ? 'open' : ''}`}
            href="/all-courses"
            onClick={() => toggleMenuItem('courses')}
          >
            Courses
            <i className="feather-chevron-down"></i>
          </Link>

          <div
            className={`rbt-megamenu grid-item-2 ${
              activeMenuItem === 'courses' ? 'active d-block' : ''
            }`}
          >
            <div className="wrapper">
              {MenuData &&
                MenuData.menuData.map((data, index) => {
                  if (data.menuType === 'grid-item-2') {
                    const elements = data.submenuBanner?.map(
                      (value, innerIndex) => (
                        <div className="row" key={innerIndex}>
                          <div className="col-lg-12">
                            <div className="mega-top-banner">
                              <div className="content">
                                <h4 className="title">{value.title}</h4>
                                <p className="description">
                                  {value.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    );
                    return elements;
                  }
                })}
              <div className="row row--15">
                <CourseLayout
                  courseTitle="Course Layout"
                  MenuData={MenuData}
                  type="grid-item-2"
                  courseType={true}
                  num={10}
                />
              </div>
              <div className="row">
                <div className="col-lg-12">
                  <ul className="nav-quick-access">
                    {MenuData &&
                      MenuData.menuData.map((data, index) => {
                        if (data.menuType === 'grid-item-2') {
                          const coursElements = data.menuFooterItems?.map(
                            (value, innerIndex) => (
                              <li key={innerIndex}>
                                <Link href={value.link}>
                                  <i className="feather-folder-minus"></i>
                                  {value.title}
                                </Link>
                              </li>
                            )
                          );
                          return coursElements;
                        }
                      })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </li>
        <DashboardNav />
        <li className="with-megamenu has-menu-child-item position-static">
          <Link
            href="#"
            className={`${activeMenuItem === 'pages' ? 'open' : ''}`}
            onClick={() => toggleMenuItem('pages')}
          >
            Pages
            <i className="feather-chevron-down"></i>
          </Link>
          <div
            className={`rbt-megamenu grid-item-4 ${
              activeMenuItem === 'pages' ? 'active d-block' : ''
            }`}
          >
            <div className="wrapper">
              <div className="row row--15">
                <PageLayout
                  title="Get Started"
                  MenuData={MenuData}
                  menuGrid="grid-item-4"
                  gridNumber="1"
                />
                <PageLayout
                  title="Get Started"
                  MenuData={MenuData}
                  menuGrid="grid-item-4"
                  gridNumber="2"
                />
                <PageLayout
                  title="Shop Pages"
                  MenuData={MenuData}
                  menuGrid="grid-item-4"
                  gridNumber="3"
                />
              </div>
            </div>
          </div>
        </li>
      </ul>
    </nav>
  );
};
export default Nav;
