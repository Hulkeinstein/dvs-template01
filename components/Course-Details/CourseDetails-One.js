'use client';

import React, { useState, useEffect } from 'react';
import Content from './Course-Sections/Content';
import CourseBanner from './Course-Sections/Course-Banner';
import CourseMenu from './Course-Sections/Course-Menu';
import Featured from './Course-Sections/Featured';
import Instructor from './Course-Sections/Instructor';
import Overview from './Course-Sections/Overview';
import RelatedCourse from './Course-Sections/RelatedCourse';
import Requirements from './Course-Sections/Requirements';
import Review from './Course-Sections/Review';
import Viedo from './Course-Sections/Viedo.tsx';
import { getCourseReviewStats } from '@/app/lib/actions/reviewActions';

// ID 정규화 함수 - ID 형식 불일치 해결
const normalizeId = (id) => {
  if (!id) return '';
  return String(id).trim().toLowerCase();
};

const CourseDetailsOne = ({ checkMatchCourses }) => {
  const [reviewStats, setReviewStats] = useState(null);
  const [instructor, setInstructor] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Get review stats if we have a course ID
      if (checkMatchCourses?.id) {
        try {
          // 디버그 로깅 추가
          const rawId = checkMatchCourses.id;
          const normalizedId = normalizeId(rawId);

          console.log('[Review Debug] Raw course ID:', rawId);
          console.log('[Review Debug] Normalized course ID:', normalizedId);
          console.log('[Review Debug] Course data:', checkMatchCourses);

          // 정규화된 ID로 리뷰 통계 가져오기
          const stats = await getCourseReviewStats(normalizedId);

          console.log('[Review Debug] Review stats response:', stats);

          // 응답이 없거나 비어있어도 기본값 설정
          const safeStats = stats || {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            percentages: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          };

          setReviewStats(safeStats);
          console.log('[Review Debug] Final review stats set:', safeStats);
        } catch (error) {
          console.error('[Review Debug] Failed to fetch review stats:', error);
          console.error('[Review Debug] Error details:', {
            message: error.message,
            stack: error.stack,
            courseId: checkMatchCourses.id,
          });

          // 에러 발생 시에도 기본값으로 설정 (리뷰 섹션이 표시되도록)
          const defaultStats = {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            percentages: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          };
          setReviewStats(defaultStats);
          console.log('[Review Debug] Using default stats due to error');
        }
      } else {
        console.log('[Review Debug] No course ID available');
        // ID가 없어도 기본값 설정
        const defaultStats = {
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          percentages: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        };
        setReviewStats(defaultStats);
      }

      // Extract instructor data from courseInstructor
      if (checkMatchCourses?.courseInstructor?.[0]) {
        setInstructor(checkMatchCourses.courseInstructor[0]);
        console.log(
          '[Review Debug] Instructor data set:',
          checkMatchCourses.courseInstructor[0]
        );
      }
    };

    fetchData();
  }, [checkMatchCourses]);
  return (
    <>
      <div className="col-lg-8">
        <div className="course-details-content">
          <div className="rbt-course-feature-box rbt-shadow-box thuumbnail">
            {checkMatchCourses.courseImg && (
              <CourseBanner bannerImg={checkMatchCourses.courseImg} />
            )}
          </div>
          <div className="rbt-inner-onepage-navigation sticky-top mt--30">
            <CourseMenu />
          </div>

          {checkMatchCourses &&
            checkMatchCourses.courseOverview.map((data, index) => (
              <Overview {...data} key={index} checkMatchCourses={data} />
            ))}

          <div
            className="course-content rbt-shadow-box coursecontent-wrapper mt--30"
            id="coursecontent"
          >
            {checkMatchCourses &&
              checkMatchCourses.courseContent.map((data, index) => (
                <Content {...data} key={index} checkMatchCourses={data} />
              ))}
          </div>

          <div
            className="rbt-course-feature-box rbt-shadow-box details-wrapper mt--30"
            id="details"
          >
            <div className="row g-5">
              {checkMatchCourses &&
                checkMatchCourses.courseRequirement.map((data, index) => (
                  <Requirements
                    {...data}
                    key={index}
                    checkMatchCourses={data}
                  />
                ))}
            </div>
          </div>
          <div
            className="rbt-instructor rbt-shadow-box intructor-wrapper mt--30"
            id="intructor"
          >
            {checkMatchCourses &&
              checkMatchCourses.courseInstructor.map((data, index) => (
                <Instructor {...data} key={index} checkMatchCourses={data} />
              ))}
          </div>
          <div
            className="rbt-review-wrapper rbt-shadow-box review-wrapper mt--30"
            id="review"
          >
            <Review reviewStats={reviewStats} />
          </div>

          {checkMatchCourses &&
            checkMatchCourses.featuredReview.map((data, index) => (
              <Featured {...data} key={index} coursesFeatured={data} />
            ))}
        </div>
        <div className="related-course mt--60">
          {checkMatchCourses &&
            checkMatchCourses.relatedCourse.map((data, index) => (
              <RelatedCourse {...data} key={index} checkMatchCourses={data} />
            ))}
        </div>
      </div>

      <div className="col-lg-4">
        <div className="course-sidebar sticky-top rbt-shadow-box course-sidebar-top rbt-gradient-border">
          <div className="inner">
            <Viedo
              checkMatchCourses={checkMatchCourses && checkMatchCourses}
              instructor={instructor}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseDetailsOne;
