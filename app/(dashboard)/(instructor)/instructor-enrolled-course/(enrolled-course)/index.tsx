import { getInstructorEnrolledStudents } from '@/app/lib/actions/getInstructorEnrolledStudents';
import EnrolledStudentsClient from './EnrolledStudentsClient';
import type { GetEnrolledStudentsResponse, ErrorResponse } from '@/types/enrollment';

// Server Component - fetches data on the server
const EnrolledCoursePage = async () => {
  // Fetch enrolled students data on the server
  const result = await getInstructorEnrolledStudents();
  
  // Type guard to check if result is an error
  const isError = (result: GetEnrolledStudentsResponse | ErrorResponse): result is ErrorResponse => {
    return 'error' in result;
  };

  // Handle error case
  if (isError(result)) {
    return <EnrolledStudentsClient initialData={null} error={result.error} />;
  }

  // Pass the fetched data to the client component
  return <EnrolledStudentsClient initialData={result} error={null} />;
};

export default EnrolledCoursePage;