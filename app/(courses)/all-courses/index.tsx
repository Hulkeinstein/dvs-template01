'use client';

import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import Store from '@/redux/store';
import Context from '@/context/Context';
import HeaderStyleTen from '@/components/Header/HeaderStyle-Ten';
import MobileMenu from '@/components/Header/MobileMenu';
import Cart from '@/components/Header/Offcanvas/Cart';
import CategoryHead from '@/components/Category/CategoryHead';
import CourseFilterOneToggle from '@/components/Category/Filter/CourseFilterOneToggle';
import Pagination from '@/components/Common/Pagination';
import Separator from '@/components/Common/Separator';
import FooterOne from '@/components/Footer/Footer-One';
import { CourseCardData, AllCoursesPageProps } from '@/types/course-ui';

const AllCoursesPage: React.FC<AllCoursesPageProps> = ({
  initialCourses = [],
}) => {
  // Ensure initialCourses is always an array
  const coursesArray = Array.isArray(initialCourses) ? initialCourses : [];

  const [courses, setCourse] = useState<CourseCardData[]>(coursesArray);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Use initialCourses from props instead of JSON import
  const getAllCourse = courses;

  const startIndex = (page - 1) * 6;
  const getSelectedCourse = courses.slice(startIndex, startIndex + 6);

  const handleClick = (num: number): void => {
    setPage(num);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    setCourse(coursesArray);
    setTotalPages(Math.ceil(coursesArray.length / 6));
  }, [coursesArray]);

  return (
    <>
      <Provider store={Store}>
        <Context>
          <HeaderStyleTen headerSticky="rbt-sticky" />
          <MobileMenu />
          <Cart />

          <CategoryHead
            category={getAllCourse}
            filterItem={undefined}
            courseFilter={undefined}
            setCourseFilter={undefined}
          />
          <div className="rbt-section-overlayping-top rbt-section-gapBottom">
            <div className="inner">
              <div className="container">
                <CourseFilterOneToggle
                  course={getSelectedCourse}
                  start={undefined}
                  end={undefined}
                />

                {getAllCourse.length > 6 ? (
                  <div className="row">
                    <div className="col-lg-12 mt--60">
                      <Pagination
                        totalPages={totalPages}
                        pageNumber={page}
                        handleClick={handleClick}
                      />
                    </div>
                  </div>
                ) : (
                  ''
                )}
              </div>
            </div>
          </div>

          <Separator />
          <FooterOne
            isBox={undefined}
            bgColor={undefined}
            newsletterBorder={undefined}
            islamic={undefined}
          />
        </Context>
      </Provider>
    </>
  );
};

export default AllCoursesPage;
