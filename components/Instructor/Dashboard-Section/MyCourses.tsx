'use client';

import React, { useState, useEffect, ReactElement } from 'react';
import Link from 'next/link';
import { getInstructorCourses } from '@/app/lib/actions/courseActions';

// Interface for course data returned from getInstructorCourses
interface InstructorCourse {
  id: string;
  title: string;
  average_rating?: number;
  enrollments?: {
    count: number;
  };
}

// Interface for the action result
interface GetInstructorCoursesResult {
  error?: string;
  courses?: InstructorCourse[];
}

const MyCourses = () => {
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const result: GetInstructorCoursesResult = await getInstructorCourses();
        if (!result.error) {
          setCourses(result.courses || []);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Render star rating
  const renderRating = (rating: number = 0): ReactElement[] => {
    const stars: ReactElement[] = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <i key={i} className={`fas fa-star${i >= fullStars ? ' off' : ''}`} />
      );
    }
    return stars;
  };

  return (
    <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mb--60">
      <div className="content">
        <div className="row">
          <div className="col-lg-12">
            <div className="section-title">
              <h4 className="rbt-title-style-3">My Courses</h4>
            </div>
          </div>
        </div>
        <div className="row gy-5">
          <div className="col-lg-12">
            <div className="rbt-dashboard-table table-responsive">
              <table className="rbt-table table table-borderless">
                <thead>
                  <tr>
                    <th className="text-start">Course Name</th>
                    <th className="text-center">Enrolled</th>
                    <th className="text-center">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : courses.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center">
                        No courses found
                      </td>
                    </tr>
                  ) : (
                    courses.slice(0, 5).map((course) => (
                      <tr key={course.id}>
                        <th>
                          <Link href={`/course-details/${course.id}`}>
                            {course.title}
                          </Link>
                        </th>
                        <td className="text-center">
                          {course.enrollments?.count || 0}
                        </td>
                        <td className="text-center">
                          <div className="rating">
                            {renderRating(course.average_rating || 0)}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="load-more-btn text-center">
              <Link
                className="rbt-btn-link"
                href="/instructor-personal-courses"
              >
                Browse All Course
                <i className="feather-arrow-right" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
