import { Metadata } from 'next';
import {
  getAllCoursesWithDetails,
  getUserBookmarks,
} from '@/app/lib/actions/courseActions';
import AllCoursesPage from './index';
import BackToTop from '@/app/backToTop';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';

export const metadata: Metadata = {
  title: 'All Courses - DVS Education Platform',
  description: 'Browse all available courses',
};

const AllCoursesLayout = async (): Promise<JSX.Element> => {
  // SSR: Fetch data on server
  const courses = await getAllCoursesWithDetails();

  // Get user bookmarks if logged in
  const session = await getServerSession(authOptions);
  const bookmarks = session?.user?.id
    ? await getUserBookmarks(session.user.id)
    : [];

  return (
    <>
      <AllCoursesPage initialCourses={courses} initialBookmarks={bookmarks} />
      <BackToTop />
    </>
  );
};

export default AllCoursesLayout;
