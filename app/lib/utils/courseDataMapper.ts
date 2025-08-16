/**
 * Course Data Mapper
 *
 * 중앙화된 데이터 매핑 유틸리티
 * DB 스키마와 UI 폼 데이터 간의 변환을 처리합니다.
 *
 * 이 파일을 수정하여 새로운 필드를 추가하거나 매핑 로직을 변경할 수 있습니다.
 */

const DEBUG_MODE = process.env.NODE_ENV === 'development';

interface FormData {
  title?: string;
  shortDescription?: string;
  description?: string;
  price?: number | string;
  discountPrice?: number | string | null;
  language?: string;
  level?: string;
  maxStudents?: number | string;
  introVideoUrl?: string;
  startDate?: string;
  requirements?: string;
  targetedAudience?: string;
  totalDurationHours?: number | string;
  totalDurationMinutes?: number | string;
  duration?: number | string;
  contentDripEnabled?: boolean;
  contentDripType?: string;
  courseTags?: string;
  slug?: string;
  category?: string;
  thumbnail_url?: string;
  status?: string;
  certificateEnabled?: boolean;
  certificateTitle?: string;
  passingGrade?: number | string;
  enrollmentDeadline?: string;
  endDate?: string;
  lifetimeAccess?: boolean;
  thumbnailPreview?: string | null;
  topics?: any[];
}

interface DBData {
  title?: string;
  description?: string;
  about_course?: string;
  regular_price?: number;
  discounted_price?: number | null;
  language?: string;
  difficulty_level?: string;
  max_students?: number;
  intro_video_url?: string | null;
  is_free?: boolean;
  start_date?: string | null;
  requirements?: string | null;
  targeted_audience?: string | null;
  total_duration_hours?: number;
  total_duration_minutes?: number;
  content_drip_enabled?: boolean;
  content_drip_type?: string | null;
  course_tags?: string[];
  slug?: string;
  category?: string;
  thumbnail_url?: string;
  status?: string;
  end_date?: string;
  course_settings?: Array<{
    certificate_enabled?: boolean;
    certificate_title?: string;
    passing_grade?: number;
    enrollment_deadline?: string;
    end_date?: string;
    allow_lifetime_access?: boolean;
  }>;
}

interface CourseSettings {
  certificate_enabled?: boolean;
  certificate_title?: string | null;
  passing_grade?: number;
  max_students?: number | null;
  enrollment_deadline?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  allow_lifetime_access?: boolean;
}

declare global {
  interface Window {
    testCourseDataMapping?: () => void;
  }
}

/**
 * UI FormData를 DB 스키마로 변환
 * @param {FormData} formData - UI에서 사용하는 폼 데이터
 * @returns {DBData} DB에 저장할 데이터
 */
export function mapFormDataToDB(formData: FormData): DBData {
  // 기본 필드들
  const dbData: DBData = {
    title: formData.title,
    description: formData.shortDescription, // UI: shortDescription → DB: description
    about_course: formData.description, // UI: description → DB: about_course
    regular_price: typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price || 0,
    discounted_price: formData.discountPrice
      ? typeof formData.discountPrice === 'string' 
        ? parseFloat(formData.discountPrice)
        : formData.discountPrice
      : null,
    language: formData.language || 'English',
    difficulty_level: formData.level || 'All Levels',
    max_students: typeof formData.maxStudents === 'string' 
      ? parseInt(formData.maxStudents) 
      : formData.maxStudents || 0,
    intro_video_url: formData.introVideoUrl || null,
    is_free: formData.price === 0 || formData.price === '0',

    // Additional Information 필드들
    start_date: formData.startDate || null,
    requirements: formData.requirements || null,
    targeted_audience: formData.targetedAudience || null,

    // Course Duration
    total_duration_hours:
      (typeof formData.totalDurationHours === 'string' ? parseInt(formData.totalDurationHours) : formData.totalDurationHours) ||
      (typeof formData.duration === 'string' ? parseInt(formData.duration) : formData.duration) || 
      0,
    total_duration_minutes: typeof formData.totalDurationMinutes === 'string' 
      ? parseInt(formData.totalDurationMinutes) 
      : formData.totalDurationMinutes || 0,

    // Content Drip
    content_drip_enabled: formData.contentDripEnabled || false,
    content_drip_type: formData.contentDripType || null,

    // Course Tags - 문자열을 배열로 변환
    course_tags: formData.courseTags
      ? formData.courseTags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag)
      : [],
  };

  // 선택적 필드들
  if (formData.slug !== undefined) {
    dbData.slug = formData.slug;
  }

  if (formData.category !== undefined) {
    dbData.category = formData.category;
  }

  if (formData.thumbnail_url !== undefined) {
    dbData.thumbnail_url = formData.thumbnail_url;
  }

  // status 필드 (draft/published)
  if (formData.status !== undefined) {
    dbData.status = formData.status;
  }

  return dbData;
}

/**
 * DB 데이터를 UI FormData로 변환
 * @param {DBData} courseData - DB에서 가져온 코스 데이터
 * @returns {FormData} UI 폼에서 사용할 데이터
 */
export function mapDBToFormData(courseData: DBData): FormData {
  if (DEBUG_MODE) {
    console.group('🔄 [CourseDataMapper] DB → FormData Conversion');
    // console.log('Input DB Data:', courseData);
  }

  const formData: FormData = {
    // 기본 정보
    title: courseData.title || '',
    shortDescription: courseData.description || '', // DB: description → UI: shortDescription
    description: courseData.about_course || '', // DB: about_course → UI: description
    category: courseData.category || '',
    level: courseData.difficulty_level || 'all_levels',
    maxStudents: courseData.max_students || 0,
    introVideoUrl: courseData.intro_video_url || '',
    price: courseData.regular_price || 0,
    discountPrice: courseData.discounted_price || null,
    language: courseData.language || 'English',
    slug: courseData.slug || '',
    status: courseData.status || 'draft',

    // Additional Information
    startDate: courseData.start_date || '',
    requirements: courseData.requirements || '',
    targetedAudience: courseData.targeted_audience || '',

    // Course Duration - 분리된 필드로
    duration: courseData.total_duration_hours || 0, // 기존 호환성
    totalDurationHours: courseData.total_duration_hours || 0,
    totalDurationMinutes: courseData.total_duration_minutes || 0,

    // Content Drip
    contentDripEnabled: courseData.content_drip_enabled || false,
    contentDripType: courseData.content_drip_type || '',

    // Course Tags - 배열을 문자열로 변환
    courseTags: Array.isArray(courseData.course_tags)
      ? courseData.course_tags.join(', ')
      : '',

    // Course Settings (course_settings 테이블에서 오는 데이터)
    certificateEnabled:
      courseData.course_settings?.[0]?.certificate_enabled || false,
    certificateTitle: courseData.course_settings?.[0]?.certificate_title || '',
    passingGrade: courseData.course_settings?.[0]?.passing_grade || 70,
    enrollmentDeadline:
      courseData.course_settings?.[0]?.enrollment_deadline || '',
    endDate:
      courseData.course_settings?.[0]?.end_date || courseData.end_date || '',
    lifetimeAccess:
      courseData.course_settings?.[0]?.allow_lifetime_access !== false,

    // 미디어
    thumbnailPreview: courseData.thumbnail_url || null,

    // Topics는 별도로 처리
    topics: [],
  };

  if (DEBUG_MODE) {
    // console.log('Output FormData:', formData);
    console.groupEnd();
  }

  return formData;
}

/**
 * Course Settings 데이터 매핑
 * @param {FormData} formData - UI 폼 데이터
 * @returns {CourseSettings} course_settings 테이블용 데이터
 */
export function mapFormDataToSettings(formData: FormData): CourseSettings {
  return {
    certificate_enabled: formData.certificateEnabled || false,
    certificate_title: formData.certificateTitle || null,
    passing_grade: formData.passingGrade 
      ? typeof formData.passingGrade === 'string' 
        ? parseInt(formData.passingGrade) 
        : formData.passingGrade
      : 70,
    max_students: formData.maxStudents 
      ? typeof formData.maxStudents === 'string'
        ? parseInt(formData.maxStudents)
        : formData.maxStudents
      : null,
    enrollment_deadline: formData.enrollmentDeadline || null,
    start_date: formData.startDate || null,
    end_date: formData.endDate || null,
    allow_lifetime_access: formData.lifetimeAccess !== false,
  };
}

/**
 * 디버깅용 - 매핑되지 않은 필드 확인
 * @param {FormData} formData - UI 폼 데이터
 * @param {DBData} dbData - 매핑된 DB 데이터
 */
export function logUnmappedFields(formData: FormData, dbData: DBData): void {
  const unmappedFields = Object.keys(formData).filter((key) => {
    // topics는 별도 처리하므로 제외
    if (key === 'topics' || key === 'thumbnailPreview') return false;

    // DB에 매핑된 필드가 있는지 확인
    const isMapped = Object.values(dbData).some((value) =>
      JSON.stringify(value)?.includes(String((formData as any)[key]))
    );

    return !isMapped && (formData as any)[key] !== undefined && (formData as any)[key] !== '';
  });

  if (unmappedFields.length > 0) {
    // console.warn('[CourseDataMapper] Unmapped fields:', unmappedFields);
  }
}

/**
 * 매핑 테스트 함수 - 브라우저 콘솔에서 실행 가능
 * window.testCourseDataMapping()으로 호출
 */
export function testCourseDataMapping(): void {
  const testData: FormData = {
    title: 'Test Course',
    shortDescription: 'Short desc',
    description: 'Long description',
    startDate: '2025-02-01',
    requirements: 'Basic knowledge',
    targetedAudience: 'Developers',
    totalDurationHours: 10,
    totalDurationMinutes: 30,
    courseTags: 'react, javascript, web',
    contentDripEnabled: true,
    contentDripType: 'after_enrollment',
  };

  console.group('🧪 Course Data Mapping Test');
  // console.log('1️⃣ Original FormData:', testData);

  const dbData = mapFormDataToDB(testData);
  // console.log('2️⃣ Converted to DB:', dbData);

  const backToForm = mapDBToFormData({
    ...dbData,
    course_settings: [
      {
        certificate_enabled: true,
        passing_grade: 80,
      },
    ],
  });
  // console.log('3️⃣ Converted back to Form:', backToForm);

  // console.log('✅ Test complete! Check if all fields mapped correctly.');
  console.groupEnd();
}

// 개발 모드에서 전역 함수로 제공
if (typeof window !== 'undefined' && DEBUG_MODE) {
  window.testCourseDataMapping = testCourseDataMapping;
  // console.log('💡 Course data mapping test available: window.testCourseDataMapping()');
}