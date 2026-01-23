'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  updateCourseStatus,
  deleteCourse,
  submitCourseForReview,
} from '@/app/lib/actions/courseActions';
// @ts-ignore - TODO: Migrate CourseBadges to TypeScript
import CourseBadges from '@/components/Common/CourseBadges';
import BookmarkButton from '@/components/Common/BookmarkButton';
import { ROUTES } from '@/app/lib/constants/routes';
import type { CourseStatus } from '@/types/course';

interface Badge {
  type: string;
  icon: string;
  tooltip?: string;
  priority?: number;
}

interface CourseData {
  id: string;
  title: string;
  slug?: string;
  courseThumbnail: string;
  shortDescription?: string;
  description?: string;
  coursePrice?: number;
  offerPrice?: number;
  regular_price?: number;
  discounted_price?: number;
  regularPrice?: number;
  discountedPrice?: number;
  difficulty_level?: string;
  language?: string;
  total_duration_hours?: number;
  total_duration_minutes?: number;
  instructor?: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
    photo_url?: string;
  };
  reviews?: number | any[];
  reviewCount?: number;
  averageRating?: number;
  badges?: Badge[];
  status?: CourseStatus;
  review_notes?: string;
  submitted_at?: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

interface CourseWidgetProps {
  data: CourseData;
  courseStyle?: string;
  showDescription?: boolean;
  showAuthor?: boolean;
  isProgress?: boolean;
  isCompleted?: boolean;
  isEdit?: boolean;
  userRole?: string;
  isBookmarked?: boolean;
  onStatusChange?: (courseId: string, newStatus: string) => Promise<void>;
  onDeleteCourse?: (courseId: string) => Promise<void>;
}

const CourseWidget: React.FC<CourseWidgetProps> = ({
  data,
  courseStyle,
  showDescription,
  showAuthor,
  isProgress,
  isCompleted,
  isEdit,
  userRole = 'student',
  isBookmarked = false,
  onStatusChange,
  onDeleteCourse,
}) => {
  // Calculate discount percentage
  const calculateDiscountPercentage = (): string => {
    const regularPrice =
      data.regular_price || data.regularPrice || data.coursePrice || 0;
    const discountedPrice =
      data.discounted_price || data.discountedPrice || data.offerPrice || 0;

    if (
      regularPrice > 0 &&
      discountedPrice > 0 &&
      discountedPrice < regularPrice
    ) {
      const discount = ((regularPrice - discountedPrice) / regularPrice) * 100;
      return discount.toFixed(0);
    }
    return '0';
  };

  const discountPercentage = calculateDiscountPercentage();

  const handleStatusChange = async (newStatus: string) => {
    if (!data.id) return;

    try {
      if (newStatus === 'submit_for_review') {
        // Use the new submitCourseForReview action
        if (
          confirm(
            '이 코스를 리뷰를 위해 제출하시겠습니까? 제출 후에는 관리자의 승인이 필요합니다.'
          )
        ) {
          const result = await submitCourseForReview(data.id);
          if ('error' in result && result.error) {
            alert(result.error);
          } else {
            alert(
              '코스가 리뷰를 위해 제출되었습니다. 관리자의 검토를 기다려주세요.'
            );
            if (onStatusChange) {
              await onStatusChange(data.id, 'pending');
            }
          }
        }
      } else if (newStatus === 'delete') {
        if (
          confirm(
            '정말로 이 코스를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
          )
        ) {
          const result = await deleteCourse(data.id);
          if (result.success) {
            alert('코스가 삭제되었습니다.');
            if (onDeleteCourse) {
              await onDeleteCourse(data.id);
            }
          } else {
            alert(result.error || '코스 삭제 중 오류가 발생했습니다.');
          }
        }
      } else {
        const result = await updateCourseStatus(
          data.id,
          newStatus as CourseStatus
        );
        if (result.success) {
          alert(`코스 상태가 ${newStatus}로 변경되었습니다.`);
          if (onStatusChange) {
            await onStatusChange(data.id, newStatus);
          }
        } else {
          alert(result.error || '상태 변경 중 오류가 발생했습니다.');
        }
      }
    } catch (error) {
      console.error('Error updating course status:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const renderStatusDropdown = () => {
    const status = data.status || 'draft';

    const getStatusActions = () => {
      switch (status) {
        case 'draft':
        case 'rejected':
          return [
            {
              action: 'submit_for_review',
              icon: 'feather-send',
              text: 'Submit for Review',
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
    if (status === 'draft' && userRole === 'instructor') {
      actions.push({
        action: 'delete',
        icon: 'feather-trash-2',
        text: 'Delete Course',
        className: 'text-danger',
      });
    }

    if (actions.length === 0) {
      return null;
    }

    return (
      <div className="dropdown flex-shrink-0">
        <button
          className="btn btn-link p-0 text-muted"
          type="button"
          id={`dropdownMenu-${data.id}`}
          data-bs-toggle="dropdown"
          aria-expanded="false"
          title="Course actions"
          aria-label="More options"
        >
          <span className="fs-1">⋮</span>
        </button>
        <ul
          className="dropdown-menu"
          aria-labelledby={`dropdownMenu-${data.id}`}
        >
          {actions.map((action, index) => (
            <li key={index}>
              <button
                className={`dropdown-item ${action.className}`}
                onClick={() => handleStatusChange(action.action)}
              >
                <i className={`${action.icon} me-2`}></i>
                {action.text}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Get status badge for display
  const getStatusBadgeClass = () => {
    const status = data.status || 'draft';
    const statusClasses: Record<CourseStatus, string> = {
      draft: 'bg-secondary',
      pending: 'bg-warning',
      published: 'bg-success',
      rejected: 'bg-danger',
      archived: 'bg-dark',
    };
    return statusClasses[status] || 'bg-secondary';
  };

  const getStatusText = () => {
    const status = data.status || 'draft';
    const statusText: Record<CourseStatus, string> = {
      draft: 'Draft',
      pending: 'Under Review',
      published: 'Published',
      rejected: 'Rejected',
      archived: 'Archived',
    };
    return statusText[status] || 'Draft';
  };

  return (
    <>
      <div className="rbt-card variation-05 rbt-hover">
        <div className="rbt-card-img">
          <Link href={ROUTES.COURSE.DETAILS(data.id)}>
            <div style={{ position: 'relative', aspectRatio: '330 / 227' }}>
              <Image
                fill
                src={data.courseThumbnail}
                alt={data.title}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
            {/* Status Badge for non-published courses */}
            {data.status &&
              data.status !== 'published' &&
              userRole === 'instructor' && (
                <div className="rbt-badge-4 position-absolute top-0 start-0 m-3">
                  <span className={`badge ${getStatusBadgeClass()} text-white`}>
                    {getStatusText()}
                  </span>
                </div>
              )}
            {/* Multiple badges display */}
            {data.badges && data.badges.length > 0 && (
              <>
                {React.createElement(CourseBadges as any, {
                  badges: data.badges,
                  maxDisplay: 4,
                  size: 'sm',
                  className: 'badges-card',
                  showTooltip: true,
                })}
              </>
            )}
            {Number(discountPercentage) > 0 &&
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
                  {data.averageRating && (
                    <>
                      <div className="rating">
                        {[...Array(5)].map((_, index) => (
                          <i
                            key={index}
                            className={
                              index < Math.floor(data.averageRating || 0)
                                ? 'fas fa-star'
                                : index < Math.ceil(data.averageRating || 0)
                                  ? 'fas fa-star-half-alt'
                                  : 'far fa-star'
                            }
                          ></i>
                        ))}
                      </div>
                      <span className="rating-count">
                        ({data.reviewCount || 0} Reviews)
                      </span>
                    </>
                  )}
                </div>
                <BookmarkButton
                  courseId={data.id}
                  initialBookmarked={isBookmarked}
                  variant="icon"
                />
              </div>
            </>
          )}

          {courseStyle === 'two' && (
            <>
              <h4 className="rbt-card-title">
                <Link href="#">{data.title}</Link>
              </h4>

              <ul className="rbt-meta">
                <li>
                  <i className="feather-book"></i>
                  {data.difficulty_level || 'All Levels'}
                </li>
                <li>
                  <i className="feather-clock"></i>
                  {data.total_duration_hours || 0}h{' '}
                  {data.total_duration_minutes || 0}m
                </li>
              </ul>
            </>
          )}

          {isProgress || isCompleted ? (
            <div className="rbt-progress-style-1 mt--30">
              <div className="single-progress">
                <h6 className="rbt-title-style-2 mb--10">Complete</h6>
                <div className="progress">
                  <div
                    className="progress-bar wow fadeInLeft bar-color-success"
                    data-wow-duration="0.5s"
                    data-wow-delay=".3s"
                    role="progressbar"
                    style={{ width: '90%' }}
                    aria-valuenow={90}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                  <span className="rbt-title-style-2 progress-number">90%</span>
                </div>
              </div>
            </div>
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

          {/* Show rejection notes if course is rejected */}
          {data.status === 'rejected' &&
            data.review_notes &&
            userRole === 'instructor' && (
              <div className="alert alert-danger p-2 mt-2" role="alert">
                <small>
                  <i className="feather-alert-circle me-1"></i>
                  <strong>Rejection Reason:</strong> {data.review_notes}
                </small>
              </div>
            )}

          {courseStyle === 'two' && showAuthor && (
            <div className="rbt-author-meta mb--20">
              <div className="rbt-avater">
                <Link href="#">
                  <div
                    style={{
                      position: 'relative',
                      width: '33px',
                      height: '33px',
                    }}
                  >
                    <Image
                      fill
                      src={
                        data.instructor?.avatar ||
                        data.instructor?.photo_url ||
                        '/images/client/avater-01.png'
                      }
                      alt={data.instructor?.name || 'Instructor'}
                      sizes="33px"
                      style={{ objectFit: 'cover', borderRadius: '50%' }}
                    />
                  </div>
                </Link>
              </div>
              <div className="rbt-author-info">
                By{' '}
                <Link href="#">
                  {data.instructor?.name ||
                    data.instructor?.email ||
                    'Instructor'}
                </Link>{' '}
                In <Link href="#">{data.language || 'English'}</Link>
              </div>
            </div>
          )}

          <div className="rbt-card-bottom">
            <div className="rbt-price">
              {data.discountedPrice || data.discounted_price ? (
                <>
                  <span className="current-price">
                    ${data.discountedPrice || data.discounted_price}
                  </span>
                  <span className="off-price">
                    ${data.regularPrice || data.regular_price}
                  </span>
                </>
              ) : (
                <span className="current-price">
                  ${data.regularPrice || data.regular_price || 0}
                </span>
              )}
            </div>
            {isEdit ? (
              <div className="card-actions d-flex gap-2 align-items-center">
                <Link
                  className="rbt-btn-link left-icon"
                  href={`/create-course?edit=${data.id}`}
                >
                  <i className="feather-edit"></i>
                  <span className="edit-text"> Edit</span>
                </Link>
                {userRole === 'instructor' && renderStatusDropdown()}
              </div>
            ) : userRole === 'instructor' ? (
              <div className="card-actions">{renderStatusDropdown()}</div>
            ) : (
              <Link
                className="rbt-btn-link"
                href={ROUTES.COURSE.DETAILS(data.id)}
              >
                Learn More
                <i className="feather-arrow-right" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseWidget;
