'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { useAppContext } from '@/context/Context';

import Pagination from '@/components/Common/Pagination';
import BookmarkButton from '@/components/Common/BookmarkButton';
import { CourseCardData } from '@/types/course-ui';

interface CourseFilterOneToggleProps {
  course: CourseCardData[];
  bookmarks?: string[];
  start?: number;
  end?: number;
}

const CourseFilterOneToggle: React.FC<CourseFilterOneToggleProps> = ({
  course,
  bookmarks,
  start,
  end,
}) => {
  const { toggle } = useAppContext();
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);

  const handleClick = (num: number): void => {
    setPage(num);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    setTotalPages(Math.ceil(course.length / 6));
  }, [course]);

  return (
    <>
      <div
        className={`rbt-course-grid-column ${
          !toggle ? 'active-list-view' : ''
        }`}
      >
        {course.slice(start, end).map((data) => (
          <div className="course-grid-3" key={data.id || data.courseId}>
            <div
              className={`rbt-card variation-01 rbt-hover ${
                !toggle ? 'card-list-2' : ''
              }`}
            >
              <div className="rbt-card-img">
                <Link href={`/course-details/${data.id}`}>
                  <Image
                    src={data.courseImg}
                    width={355}
                    height={244}
                    alt="Card image"
                  />
                  <div className="rbt-badge-3 bg-white">
                    <span>-{data.offPrice}%</span>
                    <span>Off</span>
                  </div>
                </Link>
              </div>
              <div className="rbt-card-body">
                <div className="rbt-card-top">
                  <div className="rbt-review">
                    <div className="rating">
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                    </div>
                    <span className="rating-count">
                      ({data.review} Reviews)
                    </span>
                  </div>
                  <BookmarkButton
                    courseId={data.id}
                    initialBookmarked={bookmarks?.includes(data.id) || false}
                    variant="icon"
                  />
                </div>

                <h4 className="rbt-card-title">
                  <Link href={`/course-details/${data.id}`}>
                    {data.courseTitle}
                  </Link>
                </h4>

                <ul className="rbt-meta">
                  <li>
                    <i className="feather-book"></i>
                    {data.lesson} Lessons
                  </li>
                  <li>
                    <i className="feather-users"></i>
                    {data.student} Students
                  </li>
                </ul>

                <p className="rbt-card-text">{data.desc}</p>
                <div className="rbt-author-meta mb--10">
                  <div className="rbt-avater">
                    <Link href="#">
                      <Image
                        src={data.userImg}
                        width={33}
                        height={33}
                        alt="Sophia Jaymes"
                      />
                    </Link>
                  </div>
                  <div className="rbt-author-info">
                    By{' '}
                    <Link href={`/profile/${data.id}`}>
                      {data.name || data.instructor || 'Instructor'}
                    </Link>
                    In <Link href="#">{data.userCategory}</Link>
                  </div>
                </div>
                <div className="rbt-card-bottom">
                  <div className="rbt-price">
                    <span className="current-price">${data.price}</span>
                    <span className="off-price">${data.offPrice}</span>
                  </div>
                  <Link
                    className="rbt-btn-link"
                    href={`/course-details/${data.id}`}
                  >
                    Learn More<i className="feather-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {course.length > 6 ? (
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
    </>
  );
};

export default CourseFilterOneToggle;
