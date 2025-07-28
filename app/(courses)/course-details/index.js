"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import sal from "sal.js";
import { useSession } from "next-auth/react";
import { Provider } from "react-redux";
import Store from "@/redux/store";
import Context from "@/context/Context";
import { CourseProviderFactory } from "@/app/lib/course-providers/CourseProviderFactory";

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

        // Use factory to get appropriate provider and fetch course
        const courseData = await CourseProviderFactory.getCourse(courseId, { 
          session,
          isPreview 
        });

        if (courseData) {
          setCourse(courseData);
        } else {
          setError('Course not found');
          router.push("/course-filter-one-toggle");
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err.message || 'Failed to load course');
        
        // Only redirect if it's not an access denied error
        if (!err.message?.includes('Access denied')) {
          router.push("/course-filter-one-toggle");
        }
      } finally {
        setLoading(false);
      }
    };

    // For preview mode with database courses, wait for session
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
          ) : error && error.includes('Access denied') ? (
            <div className="container">
              <div className="row">
                <div className="col-lg-12">
                  <div className="text-center py-5">
                    <h3>Access Denied</h3>
                    <p className="text-muted">{error}</p>
                    <Link href="/dashboard" className="rbt-btn btn-gradient">
                      Go to Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : course ? (
            <>
              <div className="rbt-breadcrumb-default rbt-breadcrumb-style-3">
                <CourseHead checkMatch={course} />
              </div>

              <div className="rbt-course-details-area ptb--60">
                <div className="container">
                  <div className="row g-5">
                    <CourseDetailsOne checkMatchCourses={course} />
                  </div>
                </div>
              </div>

              <CourseActionBottom checkMatchCourses={course} />

              <div className="rbt-related-course-area bg-color-white pt--60 rbt-section-gapBottom">
                <SimilarCourses checkMatchCourses={course.similarCourse || []} />
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