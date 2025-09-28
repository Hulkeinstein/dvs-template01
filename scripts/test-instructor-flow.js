const { createClient } = require('@supabase/supabase-js');

// Service Role Key 사용 (Server Action과 동일)
const supabaseUrl = 'https://datvqaemqzhgitxxfvar.supabase.co';
const serviceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdHZxYWVtcXpoZ2l0eHhmdmFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDc5OTg4MSwiZXhwIjoyMDYwMzc1ODgxfQ.o8LmzAqeLvodW1veKHgr5P0lizTwOHZdUhWq1YymHYU';

const supabase = createClient(supabaseUrl, serviceKey);

async function testInstructorFlow() {
  console.log('=== Instructor Enrolled Students Flow Test ===');
  console.log('');

  // 1. instructor 역할을 가진 사용자 찾기
  console.log('1. Finding instructor user:');
  const { data: instructor, error: instrError } = await supabase
    .from('user')
    .select('id, email, role')
    .eq('email', 'info@danielvisionschool.org')
    .single();

  if (instrError || !instructor) {
    console.log('   ❌ Error:', instrError?.message);
    return;
  }

  console.log('   ✅ Found:', instructor.email, 'Role:', instructor.role);
  console.log('   Instructor ID:', instructor.id);

  // 2. instructor의 코스 찾기
  console.log('');
  console.log('2. Finding courses for instructor:');
  const { data: courses, error: courseError } = await supabase
    .from('courses')
    .select('id, title')
    .eq('instructor_id', instructor.id);

  if (courseError) {
    console.log('   ❌ Error:', courseError.message);
    return;
  }

  console.log('   ✅ Found', courses?.length || 0, 'courses');
  if (courses && courses.length > 0) {
    const courseIds = courses.map((c) => c.id);
    console.log('   Course IDs:', courseIds);
    console.log(
      '   Course Titles:',
      courses.map((c) => c.title)
    );

    // 3. 해당 코스들의 enrollments 찾기
    console.log('');
    console.log('3. Finding enrollments for these courses:');
    const { data: enrollments, error: enrollError } = await supabase
      .from('enrollments')
      .select(
        `
        id,
        user_id,
        course_id,
        enrolled_at,
        status,
        user:user_id (
          id,
          email,
          name
        ),
        course:course_id (
          id,
          title
        )
      `
      )
      .in('course_id', courseIds);

    if (enrollError) {
      console.log('   ❌ Error:', enrollError.message);
      console.log('   Error code:', enrollError.code);
      console.log('   Error details:', JSON.stringify(enrollError, null, 2));
    } else {
      console.log('   ✅ Found', enrollments?.length || 0, 'enrollments');
      if (enrollments && enrollments.length > 0) {
        console.log(
          '   Sample enrollment:',
          JSON.stringify(enrollments[0], null, 2)
        );
      } else {
        console.log('   No students enrolled in your courses yet.');
      }
    }
  } else {
    console.log('   No courses found for this instructor.');
  }

  console.log('');
  console.log('=== Test Complete ===');
}

testInstructorFlow();
