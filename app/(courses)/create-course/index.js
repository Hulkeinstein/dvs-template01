'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Provider } from 'react-redux';
import Store from '@/redux/store';
import Context from '@/context/Context';
import HeaderStyleTen from '@/components/Header/HeaderStyle-Ten';
import MobileMenu from '@/components/Header/MobileMenu';
import Cart from '@/components/Header/Offcanvas/Cart';

import Separator from '@/components/Common/Separator';
import FooterTwo from '@/components/Footer/Footer-Two';
import CreateCourse from '@/components/create-course/CreateCourse';

const CreateCoursePage = ({ searchParams }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const editCourseId = searchParams?.edit || null;

  useEffect(() => {
    // Redirect if not authenticated or not an instructor
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    // Check if user is an instructor
    const checkUserRole = async () => {
      try {
        const response = await fetch('/api/user/profile');
        const data = await response.json();

        if (data.role !== 'instructor') {
          router.push('/student-dashboard');
          return;
        }

        setUserProfile(data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    checkUserRole();
  }, [session, status, router]);
  return (
    <>
      <Provider store={Store}>
        <Context>
          <HeaderStyleTen headerSticky="rbt-sticky" headerType={true} />
          <MobileMenu />
          <Cart />

          <div className="rbt-create-course-area bg-color-white rbt-section-gap">
            <div className="container">
              {status === 'loading' ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : session && userProfile ? (
                <CreateCourse
                  userProfile={userProfile}
                  editMode={!!editCourseId}
                  courseId={editCourseId}
                />
              ) : null}
            </div>
          </div>

          <Separator />
          <FooterTwo />
        </Context>
      </Provider>
    </>
  );
};

export default CreateCoursePage;
