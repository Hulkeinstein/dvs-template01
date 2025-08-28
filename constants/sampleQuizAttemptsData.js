// Sample Quiz Attempts Data for Development/Testing
// 교사 대시보드 Quiz Attempts 페이지 개발/테스트용 샘플 데이터

export const sampleQuizAttemptsData = [
  {
    id: 'attempt-1',
    user_id: 'user-1',
    lesson_id: 'lesson-1',
    course_id: 'course-1',
    started_at: '2025-01-15T09:00:00',
    completed_at: '2025-01-15T09:30:00',
    score: 8,
    total_points: 10,
    passed: true,
    answers: {
      '1': 'A',
      '2': 'B',
      '3': ['option1', 'option2'],
      '4': true
    },
    user: {
      name: 'John Smith',
      email: 'john.smith@example.com'
    },
    lessons: {
      title: 'React Hooks Fundamentals Quiz'
    },
    courses: {
      title: 'Advanced React Development',
      instructor_id: 'instructor-1'
    }
  },
  {
    id: 'attempt-2',
    user_id: 'user-2',
    lesson_id: 'lesson-2',
    course_id: 'course-1',
    started_at: '2025-01-14T14:00:00',
    completed_at: '2025-01-14T14:45:00',
    score: 6,
    total_points: 10,
    passed: false,
    answers: {
      '1': 'B',
      '2': 'A',
      '3': ['option1'],
      '4': false
    },
    user: {
      name: 'Emily Johnson',
      email: 'emily.j@example.com'
    },
    lessons: {
      title: 'State Management Quiz'
    },
    courses: {
      title: 'Advanced React Development',
      instructor_id: 'instructor-1'
    }
  },
  {
    id: 'attempt-3',
    user_id: 'user-3',
    lesson_id: 'lesson-3',
    course_id: 'course-2',
    started_at: '2025-01-14T10:00:00',
    completed_at: '2025-01-14T10:20:00',
    score: 9,
    total_points: 10,
    passed: true,
    answers: {
      '1': 'Correct answer',
      '2': ['A', 'B', 'C'],
      '3': true,
      '4': 'Essay answer text here'
    },
    user: {
      name: 'Michael Chen',
      email: 'michael.chen@example.com'
    },
    lessons: {
      title: 'JavaScript ES6+ Features'
    },
    courses: {
      title: 'Modern JavaScript Mastery',
      instructor_id: 'instructor-1'
    }
  },
  {
    id: 'attempt-4',
    user_id: 'user-4',
    lesson_id: 'lesson-1',
    course_id: 'course-1',
    started_at: '2025-01-13T16:30:00',
    completed_at: '2025-01-13T17:00:00',
    score: 7,
    total_points: 10,
    passed: true,
    answers: {
      '1': 'A',
      '2': 'B',
      '3': ['option1', 'option3'],
      '4': true
    },
    user: {
      name: 'Sarah Williams',
      email: 'sarah.w@example.com'
    },
    lessons: {
      title: 'React Hooks Fundamentals Quiz'
    },
    courses: {
      title: 'Advanced React Development',
      instructor_id: 'instructor-1'
    }
  },
  {
    id: 'attempt-5',
    user_id: 'user-5',
    lesson_id: 'lesson-4',
    course_id: 'course-2',
    started_at: '2025-01-13T11:00:00',
    completed_at: '2025-01-13T11:30:00',
    score: 5,
    total_points: 10,
    passed: false,
    answers: {
      '1': 'Wrong answer',
      '2': ['B'],
      '3': false,
      '4': 'Incomplete answer'
    },
    user: {
      name: 'David Martinez',
      email: 'david.m@example.com'
    },
    lessons: {
      title: 'Async/Await Patterns'
    },
    courses: {
      title: 'Modern JavaScript Mastery',
      instructor_id: 'instructor-1'
    }
  },
  {
    id: 'attempt-6',
    user_id: 'user-1',
    lesson_id: 'lesson-2',
    course_id: 'course-1',
    started_at: '2025-01-12T09:00:00',
    completed_at: '2025-01-12T09:25:00',
    score: 10,
    total_points: 10,
    passed: true,
    answers: {
      '1': 'A',
      '2': 'B',
      '3': ['option1', 'option2'],
      '4': true
    },
    user: {
      name: 'John Smith',
      email: 'john.smith@example.com'
    },
    lessons: {
      title: 'State Management Quiz'
    },
    courses: {
      title: 'Advanced React Development',
      instructor_id: 'instructor-1'
    }
  },
  {
    id: 'attempt-7',
    user_id: 'user-6',
    lesson_id: 'lesson-5',
    course_id: 'course-3',
    started_at: '2025-01-11T15:00:00',
    completed_at: '2025-01-11T15:40:00',
    score: 8,
    total_points: 10,
    passed: true,
    answers: {
      '1': 'SELECT * FROM users',
      '2': 'JOIN',
      '3': ['CREATE', 'INSERT', 'UPDATE'],
      '4': true
    },
    user: {
      name: 'Lisa Anderson',
      email: 'lisa.a@example.com'
    },
    lessons: {
      title: 'SQL Fundamentals Quiz'
    },
    courses: {
      title: 'Database Design & SQL',
      instructor_id: 'instructor-1'
    }
  },
  {
    id: 'attempt-8',
    user_id: 'user-7',
    lesson_id: 'lesson-5',
    course_id: 'course-3',
    started_at: '2025-01-11T13:00:00',
    completed_at: '2025-01-11T13:35:00',
    score: 4,
    total_points: 10,
    passed: false,
    answers: {
      '1': 'Wrong SQL',
      '2': 'WHERE',
      '3': ['DELETE'],
      '4': false
    },
    user: {
      name: 'Robert Taylor',
      email: 'robert.t@example.com'
    },
    lessons: {
      title: 'SQL Fundamentals Quiz'
    },
    courses: {
      title: 'Database Design & SQL',
      instructor_id: 'instructor-1'
    }
  },
  {
    id: 'attempt-9',
    user_id: 'user-2',
    lesson_id: 'lesson-3',
    course_id: 'course-2',
    started_at: '2025-01-10T10:00:00',
    completed_at: '2025-01-10T10:30:00',
    score: 7,
    total_points: 10,
    passed: true,
    answers: {
      '1': 'let and const',
      '2': ['A', 'C'],
      '3': true,
      '4': 'Arrow functions maintain lexical this binding'
    },
    user: {
      name: 'Emily Johnson',
      email: 'emily.j@example.com'
    },
    lessons: {
      title: 'JavaScript ES6+ Features'
    },
    courses: {
      title: 'Modern JavaScript Mastery',
      instructor_id: 'instructor-1'
    }
  },
  {
    id: 'attempt-10',
    user_id: 'user-8',
    lesson_id: 'lesson-6',
    course_id: 'course-4',
    started_at: '2025-01-09T14:00:00',
    completed_at: '2025-01-09T14:50:00',
    score: 9,
    total_points: 10,
    passed: true,
    answers: {
      '1': 'Component lifecycle',
      '2': ['useState', 'useEffect', 'useContext'],
      '3': true,
      '4': 'Custom hooks allow reusable stateful logic'
    },
    user: {
      name: 'Jennifer Kim',
      email: 'jennifer.k@example.com'
    },
    lessons: {
      title: 'React Advanced Patterns'
    },
    courses: {
      title: 'React Performance Optimization',
      instructor_id: 'instructor-1'
    }
  }
];

// 다양한 시나리오를 위한 추가 헬퍼 함수
export const getPassedAttempts = () => 
  sampleQuizAttemptsData.filter(attempt => attempt.passed);

export const getFailedAttempts = () => 
  sampleQuizAttemptsData.filter(attempt => !attempt.passed);

export const getAttemptsByCourse = (courseId) => 
  sampleQuizAttemptsData.filter(attempt => attempt.course_id === courseId);

export const getRecentAttempts = (days = 7) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  return sampleQuizAttemptsData.filter(attempt => 
    new Date(attempt.completed_at) >= cutoffDate
  );
};

// 통계 데이터 생성 헬퍼
export const generateStatistics = () => ({
  totalAttempts: sampleQuizAttemptsData.length,
  passedCount: getPassedAttempts().length,
  failedCount: getFailedAttempts().length,
  averageScore: Math.round(
    sampleQuizAttemptsData.reduce((sum, a) => sum + a.score, 0) / 
    sampleQuizAttemptsData.length
  ),
  averagePercentage: Math.round(
    sampleQuizAttemptsData.reduce((sum, a) => 
      sum + (a.score / a.total_points) * 100, 0
    ) / sampleQuizAttemptsData.length
  ),
  uniqueStudents: new Set(sampleQuizAttemptsData.map(a => a.user_id)).size,
  uniqueCourses: new Set(sampleQuizAttemptsData.map(a => a.course_id)).size
});