import { deleteLesson } from '@/app/lib/actions/courseActions';
import { deleteQuizLesson } from '@/app/lib/actions/quizActions';
import { deleteAssignmentLesson } from '@/app/lib/actions/assignmentActions';
import type { Lesson, CourseTopic } from '@/types';

interface ValidationResult {
  success: boolean;
  error?: string;
}

interface AssignmentData {
  title?: string;
  totalPoints?: number;
  passingPoints?: number;
}

interface ContentItem extends Partial<Lesson> {
  type?: string;
  order?: number;
  sort_order?: number;
}

interface TopicWithLessons extends CourseTopic {
  lessons?: ContentItem[];
  quizzes?: ContentItem[];
  assignments?: ContentItem[];
}

// Assignment 데이터 검증 - 서버/클라이언트 동일 규칙 단일 소스
export function validateAssignmentData(data: AssignmentData | null | undefined): ValidationResult {
  if (!data) {
    return { success: false, error: '데이터가 없습니다' };
  }

  if (!data.title || !data.title.trim()) {
    return { success: false, error: '제목은 필수입니다' };
  }

  const totalPoints = data.totalPoints || 0;
  const passingPoints = data.passingPoints || 0;

  if (typeof totalPoints !== 'number' || totalPoints <= 0) {
    return { success: false, error: '총점이 올바르지 않습니다' };
  }

  if (typeof passingPoints !== 'number' || passingPoints < 0) {
    return { success: false, error: '통과 점수가 올바르지 않습니다' };
  }

  if (passingPoints > totalPoints) {
    return { success: false, error: '통과 점수가 총점을 초과할 수 없습니다' };
  }

  return { success: true };
}

// Topics 데이터를 저장용으로 변환 - UI 순서를 truth로 삼아 sort_order 갱신
export function transformTopicsForSave(topics: TopicWithLessons[]): TopicWithLessons[] {
  return topics.map((topic) => ({
    ...topic,
    lessons: (topic.lessons || []).map((lesson, idx) => ({
      ...lesson,
      sort_order: idx, // UI 순서를 그대로 sort_order로 사용
    })),
  }));
}

export const contentHelpers = {
  // 타입별 필터링
  filterByType: (contents: ContentItem[] | null | undefined, type: string): ContentItem[] => {
    if (!contents || !Array.isArray(contents)) return [];
    return contents.filter(
      (c) => c && (c.type === type || c.content_type === type)
    );
  },

  // 정렬
  sortByOrder: (contents: ContentItem[] | null | undefined): ContentItem[] => {
    if (!contents || !Array.isArray(contents)) return [];
    return [...contents].sort((a, b) => (a?.order || 0) - (b?.order || 0));
  },

  // 타입별 아이콘
  getIcon: (type: string): string => {
    const icons: Record<string, string> = {
      lesson: 'feather-play-circle',
      video: 'feather-play-circle',
      quiz: 'feather-help-circle',
      assignment: 'feather-file-text',
    };
    return icons[type] || 'feather-file';
  },

  // 타입별 배지 색상
  getBadgeClass: (type: string): string => {
    const badges: Record<string, string> = {
      quiz: 'bg-primary',
      assignment: 'bg-warning',
      lesson: 'bg-secondary',
      video: 'bg-secondary',
    };
    return badges[type] || 'bg-secondary';
  },

  // 타입별 API 호출
  deleteContent: async (content: ContentItem): Promise<any> => {
    const contentType = content.type || content.content_type;

    switch (contentType) {
      case 'quiz':
        return deleteQuizLesson(content.id!);
      case 'lesson':
      case 'video':
        return deleteLesson(content.id!);
      case 'assignment':
        return deleteAssignmentLesson(content.id!);
      default:
        throw new Error(`Unknown content type: ${contentType}`);
    }
  },

  // 콘텐츠 타입 정규화
  normalizeType: (content: ContentItem): string => {
    // content_type 또는 type 필드 사용
    return content.content_type || content.type || 'lesson';
  },

  // 다음 순서 번호 가져오기
  getNextOrder: (contents: ContentItem[] | null | undefined): number => {
    if (!contents || contents.length === 0) return 1;
    const maxOrder = Math.max(...contents.map((c) => c.order || 0));
    return maxOrder + 1;
  },

  // lessons와 quizzes 배열을 contents로 변환
  combineContents: (topic: TopicWithLessons | null | undefined): ContentItem[] => {
    // topic이 undefined이거나 null인 경우 빈 배열 반환
    if (!topic || typeof topic !== 'object') {
      return [];
    }

    const contents: ContentItem[] = [];

    // lessons 추가
    if (topic.lessons && Array.isArray(topic.lessons)) {
      topic.lessons.forEach((lesson, index) => {
        if (lesson && typeof lesson === 'object') {
          contents.push({
            ...lesson,
            type: lesson.content_type || 'lesson',
            order: lesson.order || lesson.sort_order || index + 1,
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
            order:
              quiz.order ||
              quiz.sort_order ||
              (topic.lessons?.length || 0) + index + 1,
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
            content_type: 'assignment',
            order:
              assignment.order ||
              assignment.sort_order ||
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
  splitContents: (contents: ContentItem[] | null | undefined): {
    lessons: ContentItem[];
    quizzes: ContentItem[];
    assignments: ContentItem[];
  } => {
    const lessons: ContentItem[] = [];
    const quizzes: ContentItem[] = [];
    const assignments: ContentItem[] = [];

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