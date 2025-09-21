import Image from 'next/image';
import Link from 'next/link';

const CourseBreadcrumbTwo = ({ getMatchCourse, reviewStats }) => {
  // Extract review data with default values
  const averageRating = reviewStats?.averageRating || 0;
  const totalReviews = reviewStats?.totalReviews || 0;
  return (
    <>
      <div className="col-lg-8 offset-lg-2">
        <div className="content text-center">
          <div className="d-flex align-items-center flex-wrap justify-content-center mb--15 rbt-course-details-feature">
            <div className="feature-sin best-seller-badge">
              <span className="rbt-badge-2">
                <span className="image">
                  {getMatchCourse.awardImg && (
                    <Image
                      src={getMatchCourse.awardImg}
                      width={30}
                      height={30}
                      alt="Best Seller Icon"
                    />
                  )}
                </span>
                {getMatchCourse.sellsType}
              </span>
            </div>
            {/* Rating display with actual data */}
            <div className="feature-sin rating">
              <span className="rbt-badge-4 bg-color-yellow-opacity">
                <span className="rating-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="bi bi-star-fill"
                    viewBox="0 0 16 16"
                  >
                    <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                  </svg>
                </span>
                {averageRating.toFixed(1)} ({totalReviews} reviews)
              </span>
            </div>
            <div className="feature-sin total-student">
              <span>{getMatchCourse.studentNumber} students</span>
            </div>
          </div>
          <h2 className="title theme-gradient">{getMatchCourse.courseTitle}</h2>

          <div className="rbt-author-meta mb--20 justify-content-center">
            <div className="rbt-avater">
              <Link href={`/profile/${getMatchCourse.id}`}>
                {getMatchCourse.userImg && (
                  <Image
                    width={40}
                    height={40}
                    src={getMatchCourse.userImg}
                    alt={getMatchCourse.userName}
                  />
                )}
              </Link>
            </div>
            <div className="rbt-author-info">
              By
              <Link href={`/profile/${getMatchCourse.id}`}>
                {getMatchCourse.userName}
              </Link>
              In <Link href="#">{getMatchCourse.userCategory}</Link>
            </div>
          </div>

          <ul className="rbt-meta">
            <li>
              <i className="feather-calendar"></i>Last updated
              {getMatchCourse.date}
            </li>
            <li>
              <i className="feather-globe"></i>
              {getMatchCourse.language}
            </li>
            <li>
              <i className="feather-award"></i>
              {getMatchCourse.courseAward}
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default CourseBreadcrumbTwo;
