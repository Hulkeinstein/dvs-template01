import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { getUserProfile } from '@/app/lib/actions/getUserProfile';
import { getInstructorAssignments } from '@/app/lib/actions/assignmentActions';
import { redirect } from 'next/navigation';
import BackToTop from '@/app/backToTop';
import AssignmentsPage from './(assignments)';

export const metadata = {
  title:
    'Instructor Assignments - Online Courses & Education NEXTJS14 Template',
  description: 'Online Courses & Education NEXTJS14 Template',
};

const AssignmentsLayout = async () => {
  // Get the session from NextAuth
  const session = await getServerSession(authOptions);

  // Check if user is logged in
  if (!session?.user?.id) {
    redirect('/login');
  }

  // Get user profile to verify instructor role
  const userProfile = await getUserProfile(session.user.id);

  // Redirect non-instructors to student dashboard
  if (userProfile?.role !== 'instructor') {
    redirect('/student-dashboard');
  }

  // Get assignments for the instructor
  const { data: assignments, error } = await getInstructorAssignments(
    session.user.id
  );

  return (
    <>
      <AssignmentsPage assignments={assignments || []} error={error} />
      <BackToTop />
    </>
  );
};

export default AssignmentsLayout;
