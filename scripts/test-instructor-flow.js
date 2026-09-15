const path = require('path');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Service Role Key 사용 (Server Action과 동일) — 키는 .env.local에서 읽는다 (저장소에 키를 두지 않는다)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  console.error(
    'NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY를 .env.local에 설정하세요.'
  );
  process.exit(1);
}

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
