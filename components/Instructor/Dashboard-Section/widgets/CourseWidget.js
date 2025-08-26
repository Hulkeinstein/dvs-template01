'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  updateCourseStatus,
  deleteCourse,
} from '@/app/lib/actions/courseActions';
import CourseBadges from '@/components/Common/CourseBadges';

const CourseWidget = ({
  data,
  courseStyle,
  showDescription,
  showAuthor,
  isProgress,
  isCompleted,
  isEdit,
  userRole = 'student', // 기본값은 student
  onStatusChange, // 상태 변경 핸들러
  onDeleteCourse, // 코스 삭제 핸들러
}) => {
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [totalReviews, setTotalReviews] = useState('');
  const [rating, setRating] = useState('');

  const getDiscountPercentage = () => {
    let discount = data.coursePrice * ((100 - data.offerPrice) / 100);
    setDiscountPercentage(discount.toFixed(0));
  };

  const getTotalReviews = () => {
    if (!data?.reviews) {
      setTotalReviews(0);
      return;
    }

    // Handle different review data formats
    if (typeof data.reviews === 'number') {
      setTotalReviews(data.reviews);
      return;
    }

    if (Array.isArray(data.reviews)) {
      setTotalReviews(data.reviews.length);
      return;
    }

    if (data.reviews?.total !== undefined) {
      setTotalReviews(data.reviews.total);
      return;
    }

    if (data.reviews?.count !== undefined) {
      setTotalReviews(data.reviews.count);
      return;
    }

    // Legacy format with star ratings
    if (data.reviews?.oneStar !== undefined) {
      let reviews =
        (data.reviews.oneStar || 0) +
        (data.reviews.twoStar || 0) +
        (data.reviews.threeStar || 0) +
        (data.reviews.fourStar || 0) +
        (data.reviews.fiveStar || 0);
      setTotalReviews(reviews);
      return;
    }

    setTotalReviews(0);
  };

  const getTotalRating = () => {
    if (!data?.rating?.average) {
      setRating(0);
      return;
    }
    let ratingStar = data.rating.average;
    setRating(ratingStar.toFixed(0));
  };

  useEffect(() => {
    getDiscountPercentage();
    getTotalReviews();
    getTotalRating();
  });

  const handleStatusChange = async (newStatus) => {
    if (newStatus === 'delete') {
      if (
        confirm(
          '정말 이 코스를 삭제하시겠습니까?\n모든 레슨과 퀴즈가 함께 삭제됩니다.'
        )
      ) {
        if (onDeleteCourse) {
          await onDeleteCourse(data.id);
        }
      }
      return;
    }

    const result = await updateCourseStatus(data.id, newStatus);
    if (result.success && onStatusChange) {
      onStatusChange();
    }
  };

  const renderStatusDropdown = () => {
    const status = data.status || 'draft';

    const getStatusActions = () => {
      switch (status) {
        case 'draft':
          return [
            {
              action: 'pending',
              icon: 'feather-send',
              text: 'Submit',
              className: 'text-primary',
            },
          ];
        case 'pending':
          return [
            {
              action: 'draft',
              icon: 'feather-edit-3',
              text: 'Move to Draft',
              className: 'text-warning',
            },
          ];
        case 'published':
          return [
            {
              action: 'archived',
              icon: 'feather-archive',
              text: 'Archive Course',
              className: 'text-secondary',
            },
          ];
        case 'archived':
          return [
            {
              action: 'draft',
              icon: 'feather-refresh-cw',
              text: 'Restore to Draft',
              className: 'text-info',
            },
          ];
        default:
          return [];
      }
    };

    const actions = getStatusActions();

    // Draft 상태일 때만 Delete 추가
    if (status === 'draft') {
      if (actions.length > 0) {
        actions.push({ divider: true }); // 구분선
      }
      actions.push({
        action: 'delete',
        icon: 'feather-trash-2',
        text: 'Delete Course',
        className: 'text-danger',
      });
    }

    if (actions.length === 0) return null;

    return (
      <div className="dropdown flex-shrink-0">
        <button
          className="btn btn-link p-0 text-muted"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          title="Course actions"
          aria-label="More options"
        >
          <span className="fs-1">⋮</span>
        </button>
        <ul className="dropdown-menu dropdown-menu-end">
          {actions.map((action, index) =>
            action.divider ? (
              <li key={index}>
                <hr className="dropdown-divider" />
              </li>
            ) : (
              <li key={index}>
                <a
                  className={`dropdown-item ${action.className} fs-5`}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleStatusChange(action.action);
                  }}
                >
                  <i className={`${action.icon} me-2 fs-5`}></i>
                  {action.text}
                </a>
              </li>
            )
          )}
        </ul>
      </div>
    );
  };

  return (
    <>
      <div className="rbt-card variation-05 rbt-hover">
        <div className="rbt-card-img">
          <Link href={`/course-details/${data.id}`}>
            <Image
              width={330}
              height={227}
              src={data.courseThumbnail}
              alt={data.title}
            />
            {/* Multiple badges display */}
            {data.badges && data.badges.length > 0 && (
              <CourseBadges
                badges={data.badges}
                maxDisplay={4}
                size="sm"
                className="badges-card"
                showTooltip={true}
              />
            )}
            {discountPercentage > 0 &&
              !data.badges?.some((b) => b.type === 'sale') && (
                <div className="rbt-badge-3 bg-white">
                  <span>{`-${discountPercentage}%`}</span>
                  <span>Off</span>
                </div>
              )}
          </Link>
        </div>
        <div className="rbt-card-body">
          {courseStyle === 'two' && (
            <>
              <div className="rbt-card-top">
                <div className="rbt-review">
                  <div className="rating">
                    {Array.from({ length: rating }, (_, i) => (
                      <i className="fas fa-star" key={i} />
                    ))}
                  </div>
                  <span className="rating-count">({totalReviews} Reviews)</span>
                </div>

                {/* 오른쪽 버튼 영역 */}
                <div
                  style={{ display: 'flex', gap: '0', alignItems: 'center' }}
                >
                  {/* 북마크 버튼 - 학생만 표시 */}
                  {userRole === 'student' && (
                    <div className="rbt-bookmark-btn">
                      <Link className="rbt-round-btn" title="Bookmark" href="#">
                        <i className="feather-bookmark" />
                      </Link>
                    </div>
                  )}

                  {/* Hot 배지 - 모든 사용자에게 표시 (북마크와 동일한 스타일) */}
                  {/* TODO: data.isHot은 나중에 데이터베이스에서 가져오도록 수정 */}
                  {data.isHot !== false && (
                    <div className="rbt-bookmark-btn">
                      <span
                        className="rbt-round-btn"
                        title="Hot Course"
                        style={{ cursor: 'default' }}
                      >
                        🔥
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <h4 className="rbt-card-title">
                <Link href={`/course-details/${data.id}`}>{data.title}</Link>
              </h4>
            </>
          )}
          <ul className="rbt-meta">
            <li>
              <i className="feather-book" />
              {data.lectures} Lessons
            </li>
            <li>
              <i className="feather-users" />
              {data.enrolledStudent} Students
            </li>
          </ul>

          {isProgress ? (
            <>
              <div className="rbt-progress-style-1 mb--20 mt--10">
                <div className="single-progress">
                  <h6 className="rbt-title-style-2 mb--10">Complete</h6>
                  {isCompleted ? (
                    <div className="progress">
                      <div
                        className="progress-bar wow fadeInLeft bar-color-success"
                        data-wow-duration="0.5s"
                        data-wow-delay=".3s"
                        role="progressbar"
                        style={{ width: `100%` }}
                        aria-valuenow={100}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></div>
                      <span className="rbt-title-style-2 progress-number">
                        100%
                      </span>
                    </div>
                  ) : (
                    <div className="progress">
                      <div
                        className="progress-bar wow fadeInLeft bar-color-success"
                        data-wow-duration="0.5s"
                        data-wow-delay=".3s"
                        role="progressbar"
                        style={{ width: `${data.progressValue}%` }}
                        aria-valuenow={data.progressValue}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      ></div>
                      <span className="rbt-title-style-2 progress-number">
                        {data.progressValue}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rbt-card-bottom">
                <Link
                  className="rbt-btn btn-sm bg-primary-opacity w-100 text-center"
                  href="#"
                >
                  Download Certificate
                </Link>
              </div>
            </>
          ) : (
            ''
          )}

          {courseStyle === 'one' && (
            <h4 className="rbt-card-title">
              <Link href="#">{data.title}</Link>
            </h4>
          )}

          {showDescription ? (
            <p className="rbt-card-text">{data.shortDescription}</p>
          ) : (
            ''
          )}

          {courseStyle === 'two' && showAuthor && (
            <div className="rbt-author-meta mb--20">
              <div className="rbt-avater">
                <Link href="components/widgets#">
                  <Image
                    width={40}
                    height={40}
                    src="/images/client/avater-01.png"
                    alt="Sophia Jaymes"
                  />
                </Link>
              </div>
              <div className="rbt-author-info">
                By <Link href="#">Patrick</Link> In
                <Link href="#">Languages</Link>
              </div>
            </div>
          )}

          {courseStyle === 'one' && (
            <div className="rbt-review">
              <div className="rating">
                {Array.from({ length: rating }, (_, i) => (
                  <i className="fas fa-star" key={i} />
                ))}
              </div>
              <span className="rating-count"> ({totalReviews} Reviews)</span>
            </div>
          )}

          {!isProgress ? (
            <div className="rbt-card-bottom">
              <div className="rbt-price">
                <span className="current-price">${data.offerPrice}</span>
                <span className="off-price">${data.coursePrice}</span>
              </div>

              {isEdit ? (
                <div className="d-flex gap-2 align-items-center">
                  <Link
                    className="rbt-btn-link left-icon fs-4"
                    href={`/create-course?edit=${data.id}`}
                  >
                    <i className="feather-edit fs-4"></i> Edit
                  </Link>
                  {userRole === 'instructor' && renderStatusDropdown()}
                </div>
              ) : userRole === 'instructor' ? (
                renderStatusDropdown()
              ) : (
                <Link
                  className="rbt-btn-link"
                  href={`/course-details/${data.id}`}
                >
                  Learn More
                  <i className="feather-arrow-right" />
                </Link>
              )}
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
    </>
  );
};

export default CourseWidget;
