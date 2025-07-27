"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import sal from "sal.js";
import { getCourseById } from "@/app/lib/actions/courseActions";
import { useSession } from "next-auth/react";
import { Provider } from "react-redux";
import Store from "@/redux/store";
import Context from "@/context/Context";

import MobileMenu from "@/components/Header/MobileMenu";
import HeaderStyleTen from "@/components/Header/HeaderStyle-Ten";
import Cart from "@/components/Header/Offcanvas/Cart";
import Separator from "@/components/Common/Separator";
import FooterOne from "@/components/Footer/Footer-One";
import CourseHead from "@/components/Course-Details/Course-Sections/course-head";
import CourseDetailsOne from "@/components/Course-Details/CourseDetails-One";
import CourseActionBottom from "@/components/Course-Details/Course-Sections/Course-Action-Bottom";
import SimilarCourses from "@/components/Course-Details/Course-Sections/SimilarCourses";

const SingleCourse = ({ getParams }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();
  const courseId = getParams.courseId;
  const isPreview = searchParams.get('preview') === 'true';
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        console.log('Fetching course:', { 
          courseId, 
          isPreview, 
          sessionStatus,
          userEmail: session?.user?.email 
        });
        
        const result = await getCourseById(courseId);
        
        if (result.error) {
          console.error('Course fetch error:', result.error);
          setError(result.error);
          router.push("/course-filter-one-toggle");
          return;
        }
        
        if (result.course) {
          console.log('Course fetched:', {
            courseId: result.course.id,
            status: result.course.status,
            instructorEmail: result.course.instructor?.email,
            currentUserEmail: session?.user?.email
          });
          
          // Check access permissions for draft/pending courses
          const status = result.course.status;
          const isOwner = session?.user?.email && result.course.instructor?.email === session.user.email;
          
          console.log('Access check:', { status, isOwner, isPreview });
          
          // For preview mode, only check ownership if it's draft/pending
          if ((status === 'draft' || status === 'pending')) {
            if (!isOwner) {
              console.log('Access denied: Not the owner');
              setError('Access denied');
              router.push("/course-filter-one-toggle");
              return;
            }
          }
          
          // Transform database data to match component structure
          const transformedCourse = {
            ...result.course,
            courseImg: result.course.thumbnail_url,
            price: result.course.regular_price || 0,
            offPrice: result.course.discounted_price || result.course.regular_price || 0,
            discount: result.course.discounted_price && result.course.regular_price > result.course.discounted_price
              ? Math.round(((result.course.regular_price - result.course.discounted_price) / result.course.regular_price) * 100)
              : 0,
            courseOverview: [{
              title: "What you'll learn",
              desc: result.course.about_course || result.course.description || "No overview available",
              descTwo: "This course provides comprehensive knowledge and practical skills to help you master the subject.",
              overviewList: [
                { listItem: "Understand core concepts and fundamentals" },
                { listItem: "Gain practical hands-on experience" },
                { listItem: "Build real-world projects" },
                { listItem: "Learn industry best practices" },
                { listItem: "Master advanced techniques" },
                { listItem: "Develop problem-solving skills" },
                { listItem: "Create professional-grade applications" },
                { listItem: "Prepare for career opportunities" }
              ]
            }],
            courseContent: [{
              title: "Course Content",
              contentList: result.course.lessons && result.course.lessons.length > 0 
                ? [{
                    title: "Course Lessons",
                    time: `${result.course.lessons.length} lessons`,
                    collapsed: false,
                    isShow: true,
                    expand: true,
                    listItem: result.course.lessons.map(lesson => ({
                      text: lesson.title,
                      time: lesson.duration_minutes ? `${lesson.duration_minutes}min` : "",
                      status: true,
                      playIcon: true
                    }))
                  }]
                : [{
                    title: "Course Content",
                    time: "Coming soon",
                    collapsed: false,
                    isShow: true,
                    expand: true,
                    listItem: [{ text: "Content will be available soon", time: "", status: false, playIcon: false }]
                  }]
            }],
            courseRequirement: [{
              title: "Requirements",
              detailsList: [
                { listItem: "Basic computer skills" },
                { listItem: "Internet connection" },
                { listItem: "Dedication to learn" },
                { listItem: "Willingness to practice and apply concepts" }
              ]
            }],
            courseInstructor: result.course.instructor ? [{
              title: "About the instructor",
              body: [{
                id: result.course.instructor.id,
                img: result.course.instructor.avatar_url || "/images/client/avatar-02.png",
                name: result.course.instructor.name,
                type: result.course.instructor.role || "Instructor",
                ratingNumber: "0",
                star: "0.0",
                studentNumber: "0",
                course: "1",
                desc: result.course.instructor.bio || "Experienced instructor passionate about teaching and helping students achieve their goals.",
                social: [
                  { icon: "facebook", link: "#" },
                  { icon: "twitter", link: "#" },
                  { icon: "linkedin", link: "#" }
                ]
              }]
            }] : [],
            featuredReview: [],
            relatedCourse: [],
            similarCourse: [],
            roadmap: [
              {
                text: "Start Date",
                desc: result.course.start_date ? new Date(result.course.start_date).toLocaleDateString() : "Flexible"
              },
              {
                text: "Enrolled",
                desc: "0" // TODO: Get actual enrollment count
              },
              {
                text: "Lectures",
                desc: result.course.lessons ? result.course.lessons.length.toString() : "0"
              },
              {
                text: "Skill Level",
                desc: result.course.difficulty_level === 'all_levels' ? 'All Levels' : 
                      result.course.difficulty_level === 'beginner' ? 'Beginner' :
                      result.course.difficulty_level === 'intermediate' ? 'Intermediate' :
                      result.course.difficulty_level === 'advanced' ? 'Advanced' : 'All Levels'
              },
              {
                text: "Language",
                desc: result.course.language || "English"
              },
              {
                text: "Certificate",
                desc: result.course.course_settings?.[0]?.certificate_enabled ? "Yes" : "No"
              },
              {
                text: "Pass Percentage",
                desc: result.course.course_settings?.[0]?.passing_grade ? 
                      `${result.course.course_settings[0].passing_grade}%` : "70%"
              }
            ]
          };
          
          setCourse(transformedCourse);
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    // Wait for session to load before fetching course for preview
    if (isPreview && sessionStatus === 'loading') {
      console.log('Waiting for session to load...');
      return;
    }
    
    if (courseId) {
      fetchCourse();
    }

    sal({
      threshold: 0.01,
      once: true,
    });
  }, [courseId, router, session, sessionStatus, isPreview]);

  return (
    <>
      <Provider store={Store}>
        <Context>
          <MobileMenu />
          <HeaderStyleTen headerSticky="" headerType={true} />
          <Cart />
          
          {/* Preview Mode Banner */}
          {isPreview && course && (
            <div className="rbt-preview-banner bg-gradient-1 text-white">
              <div className="container">
                <div className="row align-items-center py-3">
                  <div className="col-lg-8">
                    <h6 className="mb-0">
                      <i className="feather-eye me-2"></i>
                      Preview Mode - This is how your course will appear to students
                    </h6>
                  </div>
                  <div className="col-lg-4 text-lg-end">
                    <button 
                      className="rbt-btn btn-white btn-sm"
                      onClick={() => window.close()}
                    >
                      <i className="feather-x me-2"></i>
                      Close Preview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="container">
              <div className="row">
                <div className="col-lg-12">
                  <div className="text-center py-5">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading course details...</p>
                  </div>
                </div>
              </div>
            </div>
          ) : course ? (
            <>
              <div className="rbt-breadcrumb-default rbt-breadcrumb-style-3">
                <CourseHead
                  checkMatch={course}
                />
              </div>

              <div className="rbt-course-details-area ptb--60">
                <div className="container">
                  <div className="row g-5">
                    <CourseDetailsOne
                      checkMatchCourses={course}
                    />
                  </div>
                </div>
              </div>

              <CourseActionBottom
                checkMatchCourses={course}
              />

              <div className="rbt-related-course-area bg-color-white pt--60 rbt-section-gapBottom">
                <SimilarCourses
                  checkMatchCourses={course.similarCourse || []}
                />
              </div>
            </>
          ) : (
            <div className="container">
              <div className="row">
                <div className="col-lg-12">
                  <div className="text-center py-5">
                    <h3>Course not found</h3>
                    <p className="text-muted">{error || 'The course you are looking for does not exist.'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Separator />
          <FooterOne />
        </Context>
      </Provider>
    </>
  );
};

export default SingleCourse;
