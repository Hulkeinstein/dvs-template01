/**
 * Lesson 데이터 매핑 유틸리티
 * DB 필드와 UI 필드 간의 변환을 담당
 */

/**
 * DB 데이터를 UI 형식으로 매핑
 * @param {Object} dbLesson - 데이터베이스에서 가져온 레슨 데이터
 * @returns {Object} UI용으로 변환된 레슨 데이터
 */
export function mapLessonDbToUi(dbLesson) {
  if (!dbLesson) return null;

  console.log('📊 Mapping DB to UI:', {
    id: dbLesson.id,
    is_preview: dbLesson.is_preview,
    thumbnail_url: dbLesson.thumbnail_url,
  });

  return {
    ...dbLesson,
    // DB의 is_preview를 UI의 enablePreview로 매핑
    enablePreview: Boolean(dbLesson.is_preview),
    // DB의 thumbnail_url을 UI의 featureImage로 매핑
    featureImage: dbLesson.thumbnail_url || '',
    // video_url이 있으면 videoUrl로도 매핑 (일관성)
    videoUrl: dbLesson.video_url || dbLesson.videoUrl || '',
    // 기타 필요한 매핑 추가
  };
}

/**
 * UI 데이터를 DB 형식으로 매핑
 * @param {Object} uiLesson - UI에서 입력된 레슨 데이터
 * @returns {Object} DB 저장용으로 변환된 레슨 데이터
 */
export function mapLessonUiToDb(uiLesson) {
  if (!uiLesson) return null;

  console.log('📊 Mapping UI to DB:', {
    id: uiLesson.id,
    enablePreview: uiLesson.enablePreview,
    featureImage: uiLesson.featureImage,
  });

  // 기본 데이터 복사
  const dbLesson = { ...uiLesson };

  // UI 필드를 DB 필드로 매핑
  dbLesson.is_preview = Boolean(uiLesson.enablePreview);
  dbLesson.thumbnail_url = uiLesson.featureImage || null;

  // video_url 정규화
  if (uiLesson.videoUrl) {
    dbLesson.video_url = uiLesson.videoUrl;
  }

  // UI 전용 필드 제거
  delete dbLesson.enablePreview;
  delete dbLesson.featureImage;
  delete dbLesson.videoUrl; // video_url로 이미 매핑됨

  console.log('📊 Mapped DB lesson:', {
    id: dbLesson.id,
    is_preview: dbLesson.is_preview,
    thumbnail_url: dbLesson.thumbnail_url,
  });

  return dbLesson;
}

/**
 * 레슨 배열을 UI 형식으로 매핑
 * @param {Array} dbLessons - DB에서 가져온 레슨 배열
 * @returns {Array} UI용으로 변환된 레슨 배열
 */
export function mapLessonsDbToUi(dbLessons) {
  if (!Array.isArray(dbLessons)) return [];
  return dbLessons.map((lesson) => mapLessonDbToUi(lesson));
}
