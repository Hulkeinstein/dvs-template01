const { createClient } = require('@supabase/supabase-js');

// Service Role Key 사용
const supabaseUrl = 'https://datvqaemqzhgitxxfvar.supabase.co';
const serviceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdHZxYWVtcXpoZ2l0eHhmdmFyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDc5OTg4MSwiZXhwIjoyMDYwMzc1ODgxfQ.o8LmzAqeLvodW1veKHgr5P0lizTwOHZdUhWq1YymHYU';

const supabase = createClient(supabaseUrl, serviceKey);

async function testGetInstructorCourses() {
  console.log('=== getInstructorCourses 함수 테스트 ===');
  console.log('');

  const email = 'info@danielvisionschool.org';

  // 1. 사용자 찾기
  console.log('1. 사용자 찾기 - 이메일:', email);
  const { data: userData, error: userError } = await supabase
    .from('user')
    .select('id, email, role')
    .eq('email', email)
    .single();

  if (userError || !userData) {
    console.log('   ❌ 사용자를 찾을 수 없음');
    console.log('   Error:', userError);
    return;
  }

  console.log('   ✅ 사용자 찾음');
  console.log('   User ID:', userData.id);
  console.log('   Role:', userData.role);
  console.log('');

  // 2. 해당 사용자의 코스 찾기
  console.log('2. 코스 조회 - instructor_id:', userData.id);
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select(
      `
      *,
      course_settings (*),
      course_badges (*),
      lessons (count),
      enrollments (count)
    `
    )
    .eq('instructor_id', userData.id)
    .order('created_at', { ascending: false });

  if (coursesError) {
    console.log('   ❌ 코스 조회 실패');
    console.log('   Error:', coursesError);
    return;
  }

  console.log('   ✅ 코스 조회 성공');
  console.log('   총 코스 수:', courses?.length || 0);
  console.log('');

  if (courses && courses.length > 0) {
    console.log('3. 코스 목록:');
    courses.forEach((course, index) => {
      console.log(`   ${index + 1}. ${course.title}`);
      console.log(`      - ID: ${course.id}`);
      console.log(`      - Status: ${course.status}`);
      console.log(`      - Lessons: ${course.lessons?.[0]?.count || 0}`);
      console.log(
        `      - Enrollments: ${course.enrollments?.[0]?.count || 0}`
      );
      console.log(`      - Badges: ${course.course_badges?.length || 0}`);
    });
  }

  console.log('');
  console.log('=== 테스트 완료 ===');
}

testGetInstructorCourses();
