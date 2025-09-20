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
  const [courses, setCourse] = useState<CourseCardData[]>(initialCourses);
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
    setCourse(initialCourses);
    setTotalPages(Math.ceil(initialCourses.length / 6));
  }, [initialCourses]);

  return (
    <>
      <Provider store={Store}>
        <Context>
          <HeaderStyleTen headerSticky="rbt-sticky" headerType={true as any} />
          <MobileMenu />
          <Cart />

          <CategoryHead
            category={getAllCourse}
            filterItem={undefined as any}
            courseFilter={undefined as any}
            setCourseFilter={undefined as any}
          />
          <div className="rbt-section-overlayping-top rbt-section-gapBottom">
            <div className="inner">
              <div className="container">
                <CourseFilterOneToggle
                  course={getSelectedCourse}
                  start={undefined as any}
                  end={undefined as any}
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
            isBox={undefined as any}
            bgColor={undefined as any}
            newsletterBorder={undefined as any}
            islamic={undefined as any}
          />
        </Context>
      </Provider>
    </>
  );
};

export default AllCoursesPage;
