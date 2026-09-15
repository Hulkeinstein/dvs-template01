const path = require('path');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Service Role Key 사용 — 키는 .env.local에서 읽는다 (저장소에 키를 두지 않는다)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  console.error(
    'NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY를 .env.local에 설정하세요.'
  );
  process.exit(1);
}

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
