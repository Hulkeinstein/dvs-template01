import { deleteLesson } from '@/app/lib/actions/courseActions';
import { deleteQuizLesson } from '@/app/lib/actions/quizActions';

export const contentHelpers = {
  // 타입별 필터링
  filterByType: (contents, type) => {
    if (!contents || !Array.isArray(contents)) return [];
    return contents.filter(
      (c) => c && (c.type === type || c.content_type === type)
    );
  },

  // 정렬
  sortByOrder: (contents) => {
    if (!contents || !Array.isArray(contents)) return [];
    return [...contents].sort((a, b) => (a?.order || 0) - (b?.order || 0));
  },

  // 타입별 아이콘
  getIcon: (type) =>
    ({
      lesson: 'feather-play-circle',
      video: 'feather-play-circle',
      quiz: 'feather-help-circle',
      assignment: 'feather-file-text',
    })[type] || 'feather-file',

  // 타입별 배지 색상
  getBadgeClass: (type) =>
    ({
      quiz: 'bg-primary',
      assignment: 'bg-warning',
      lesson: 'bg-secondary',
      video: 'bg-secondary',
    })[type] || 'bg-secondary',

  // 타입별 API 호출
  deleteContent: async (content) => {
    const contentType = content.type || content.content_type;

    switch (contentType) {
      case 'quiz':
        return deleteQuizLesson(content.id);
      case 'lesson':
      case 'video':
        return deleteLesson(content.id);
      case 'assignment':
        // TODO: assignment 삭제 API 추가 시 구현
        return deleteLesson(content.id);
      default:
        throw new Error(`Unknown content type: ${contentType}`);
    }
  },

  // 콘텐츠 타입 정규화
  normalizeType: (content) => {
    // content_type 또는 type 필드 사용
    return content.content_type || content.type || 'lesson';
  },

  // 다음 순서 번호 가져오기
  getNextOrder: (contents) => {
    if (!contents || contents.length === 0) return 1;
    const maxOrder = Math.max(...contents.map((c) => c.order || 0));
    return maxOrder + 1;
  },

  // lessons와 quizzes 배열을 contents로 변환
  combineContents: (topic) => {
    // topic이 undefined이거나 null인 경우 빈 배열 반환
    if (!topic || typeof topic !== 'object') {
      return [];
    }

    const contents = [];

    // lessons 추가
    if (topic.lessons && Array.isArray(topic.lessons)) {
      topic.lessons.forEach((lesson, index) => {
        if (lesson && typeof lesson === 'object') {
          contents.push({
            ...lesson,
            type: lesson.content_type || 'lesson',
            order: lesson.order || index + 1,
          });
        }
      });
    }

    // quizzes 추가
    if (topic.quizzes && Array.isArray(topic.quizzes)) {
      topic.quizzes.forEach((quiz, index) => {
        if (quiz && typeof quiz === 'object') {
          contents.push({
            ...quiz,
            type: 'quiz',
            content_type: 'quiz',
            order: quiz.order || (topic.lessons?.length || 0) + index + 1,
          });
        }
      });
    }

    // assignments 추가
    if (topic.assignments && Array.isArray(topic.assignments)) {
      topic.assignments.forEach((assignment, index) => {
        if (assignment && typeof assignment === 'object') {
          contents.push({
            ...assignment,
            type: 'assignment',
            order:
              assignment.order ||
              (topic.lessons?.length || 0) +
                (topic.quizzes?.length || 0) +
                index +
                1,
          });
        }
      });
    }

    return contentHelpers.sortByOrder(contents);
  },

  // contents를 타입별 배열로 분리
  splitContents: (contents) => {
    const lessons = [];
    const quizzes = [];
    const assignments = [];

    // contents가 유효한 배열이 아닌 경우 빈 객체 반환
    if (!contents || !Array.isArray(contents)) {
      return { lessons, quizzes, assignments };
    }

    contents.forEach((content) => {
      if (content && typeof content === 'object') {
        const type = contentHelpers.normalizeType(content);

        switch (type) {
          case 'quiz':
            quizzes.push(content);
            break;
          case 'assignment':
            assignments.push(content);
            break;
          case 'lesson':
          case 'video':
          default:
            lessons.push(content);
            break;
        }
      }
    });

    return { lessons, quizzes, assignments };
  },
};
