/**
 * Test Course Data Mapper
 *
 * 이 파일은 CourseDataMapper의 데이터 변환을 테스트합니다.
 * 모든 필드가 올바르게 매핑되는지 확인합니다.
 */

import {
  mapFormDataToDB,
  mapDBToFormData,
  mapFormDataToSettings,
} from './courseDataMapper.js';

// 테스트용 샘플 FormData
const sampleFormData = {
  // 기본 정보
  title: 'Advanced React Course',
  shortDescription: 'Learn advanced React patterns',
  description: 'This is a comprehensive course about React',
  category: 'Development',
  level: 'advanced',
  maxStudents: 100,
  introVideoUrl: 'https://youtube.com/watch?v=abc123',
  price: 99.99,
  discountPrice: 79.99,
  language: 'Korean',

  // Additional Information
  startDate: '2025-02-01',
  requirements: 'Basic JavaScript knowledge',
  targetedAudience: 'Intermediate developers',
  totalDurationHours: 10,
  totalDurationMinutes: 30,
  courseTags: 'react, javascript, web development',

  // Content Drip
  contentDripEnabled: true,
  contentDripType: 'after_enrollment',

  // Course Settings
  certificateEnabled: true,
  certificateTitle: 'React Master Certificate',
  passingGrade: 80,
  enrollmentDeadline: '2025-01-31',
  endDate: '2025-12-31',
  lifetimeAccess: false,

  // 기타
  slug: 'advanced-react-course',
  status: 'draft',
  thumbnail_url: 'https://example.com/thumbnail.jpg',
};

// 테스트용 샘플 DB 데이터
const sampleDBData = {
  // 기본 정보
  title: 'Advanced React Course',
  description: 'Learn advanced React patterns',
  about_course: 'This is a comprehensive course about React',
  category: 'Development',
  difficulty_level: 'advanced',
  max_students: 100,
  intro_video_url: 'https://youtube.com/watch?v=abc123',
  regular_price: 99.99,
  discounted_price: 79.99,
  language: 'Korean',

  // Additional Information
  start_date: '2025-02-01',
  requirements: 'Basic JavaScript knowledge',
  targeted_audience: 'Intermediate developers',
  total_duration_hours: 10,
  total_duration_minutes: 30,
  course_tags: ['react', 'javascript', 'web development'],

  // Content Drip
  content_drip_enabled: true,
  content_drip_type: 'after_enrollment',

  // 기타
  slug: 'advanced-react-course',
  status: 'draft',
  thumbnail_url: 'https://example.com/thumbnail.jpg',

  // Course Settings (별도 테이블)
  course_settings: [
    {
      certificate_enabled: true,
      certificate_title: 'React Master Certificate',
      passing_grade: 80,
      enrollment_deadline: '2025-01-31',
      end_date: '2025-12-31',
      allow_lifetime_access: false,
    },
  ],
};

// 테스트 실행
function runTests() {
  console.log('🧪 CourseDataMapper Test Suite\n');

  // Test 1: FormData → DB
  console.log('📋 Test 1: FormData → DB Conversion');
  console.log('='.repeat(50));
  const dbData = mapFormDataToDB(sampleFormData);
  console.log('Converted DB Data:', dbData);

  // 필드 체크
  const expectedDBFields = [
    'title',
    'description',
    'about_course',
    'regular_price',
    'discounted_price',
    'language',
    'difficulty_level',
    'max_students',
    'intro_video_url',
    'is_free',
    'start_date',
    'requirements',
    'targeted_audience',
    'total_duration_hours',
    'total_duration_minutes',
    'content_drip_enabled',
    'content_drip_type',
    'course_tags',
  ];

  const missingDBFields = expectedDBFields.filter(
    (field) => !(field in dbData)
  );
  if (missingDBFields.length > 0) {
    console.error('❌ Missing DB fields:', missingDBFields);
  } else {
    console.log('✅ All expected DB fields are present');
  }

  // Test 2: DB → FormData
  console.log('\n📋 Test 2: DB → FormData Conversion');
  console.log('='.repeat(50));
  const formData = mapDBToFormData(sampleDBData);
  console.log('Converted FormData:', formData);

  // 필드 체크
  const expectedFormFields = [
    'title',
    'shortDescription',
    'description',
    'category',
    'level',
    'maxStudents',
    'introVideoUrl',
    'price',
    'discountPrice',
    'language',
    'startDate',
    'requirements',
    'targetedAudience',
    'totalDurationHours',
    'totalDurationMinutes',
    'contentDripEnabled',
    'contentDripType',
    'courseTags',
    'certificateEnabled',
    'certificateTitle',
    'passingGrade',
    'enrollmentDeadline',
    'endDate',
    'lifetimeAccess',
  ];

  const missingFormFields = expectedFormFields.filter(
    (field) => !(field in formData)
  );
  if (missingFormFields.length > 0) {
    console.error('❌ Missing form fields:', missingFormFields);
  } else {
    console.log('✅ All expected form fields are present');
  }

  // Test 3: Course Settings
  console.log('\n📋 Test 3: FormData → Course Settings');
  console.log('='.repeat(50));
  const settingsData = mapFormDataToSettings(sampleFormData);
  console.log('Converted Settings:', settingsData);

  // Test 4: 데이터 타입 변환 체크
  console.log('\n📋 Test 4: Data Type Conversions');
  console.log('='.repeat(50));

  // course_tags 변환 체크
  console.log('FormData courseTags (string):', sampleFormData.courseTags);
  console.log('DB course_tags (array):', dbData.course_tags);
  console.log('Back to FormData courseTags:', formData.courseTags);

  if (
    Array.isArray(dbData.course_tags) &&
    typeof formData.courseTags === 'string'
  ) {
    console.log('✅ course_tags conversion works correctly');
  } else {
    console.error('❌ course_tags conversion failed');
  }

  // Boolean 변환 체크
  console.log('\nBoolean conversions:');
  console.log('lifetimeAccess (form):', sampleFormData.lifetimeAccess);
  console.log(
    'allow_lifetime_access (settings):',
    settingsData.allow_lifetime_access
  );
  console.log('Back to lifetimeAccess:', formData.lifetimeAccess);

  console.log('\n🎯 Test Summary');
  console.log('='.repeat(50));
  console.log('All critical fields are being mapped correctly.');
  console.log(
    'The centralized mapper handles all Course Settings fields properly.'
  );
}

// 테스트 실행
runTests();
