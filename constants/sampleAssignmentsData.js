export const sampleAssignmentsData = [
  {
    id: 'assign-1',
    lesson_id: 'lesson-101',
    course_id: 'course-1',
    topic_id: 'topic-1',
    title: 'Build a Personal Portfolio Website',
    description:
      'Create a responsive portfolio website using HTML, CSS, and JavaScript to showcase your projects and skills.',
    total_points: 100,
    passing_points: 70,
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    submissions_count: 15,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    course: {
      id: 'course-1',
      title: 'Web Development Fundamentals',
    },
    topic: {
      id: 'topic-1',
      title: 'Chapter 3: Building Your First Website',
    },
  },
  {
    id: 'assign-2',
    lesson_id: 'lesson-102',
    course_id: 'course-1',
    topic_id: 'topic-2',
    title: 'React Component Development',
    description:
      'Build reusable React components with props, state, and hooks. Include unit tests for each component.',
    total_points: 150,
    passing_points: 105,
    due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
    submissions_count: 8,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    course: {
      id: 'course-1',
      title: 'Web Development Fundamentals',
    },
    topic: {
      id: 'topic-2',
      title: 'Chapter 5: React Essentials',
    },
  },
  {
    id: 'assign-3',
    lesson_id: 'lesson-103',
    course_id: 'course-2',
    topic_id: 'topic-3',
    title: 'Database Design Project',
    description:
      'Design and implement a database schema for an e-commerce platform with proper normalization and indexes.',
    total_points: 200,
    passing_points: 140,
    due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    submissions_count: 22,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    course: {
      id: 'course-2',
      title: 'Database Management Systems',
    },
    topic: {
      id: 'topic-3',
      title: 'Module 2: Database Design Principles',
    },
  },
  {
    id: 'assign-4',
    lesson_id: 'lesson-104',
    course_id: 'course-2',
    topic_id: 'topic-4',
    title: 'SQL Query Optimization',
    description:
      'Analyze and optimize complex SQL queries for better performance. Include execution plans and benchmarks.',
    total_points: 120,
    passing_points: 84,
    due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    submissions_count: 18,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    course: {
      id: 'course-2',
      title: 'Database Management Systems',
    },
    topic: {
      id: 'topic-4',
      title: 'Module 3: Query Optimization',
    },
  },
  {
    id: 'assign-5',
    lesson_id: 'lesson-105',
    course_id: 'course-3',
    topic_id: 'topic-5',
    title: 'RESTful API Development',
    description:
      'Create a RESTful API with Node.js and Express. Include authentication, validation, and error handling.',
    total_points: 180,
    passing_points: 126,
    due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 3 weeks from now
    submissions_count: 5,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    course: {
      id: 'course-3',
      title: 'Backend Development with Node.js',
    },
    topic: {
      id: 'topic-5',
      title: 'Unit 3: Building REST APIs',
    },
  },
  {
    id: 'assign-6',
    lesson_id: 'lesson-106',
    course_id: 'course-3',
    topic_id: 'topic-6',
    title: 'Authentication System Implementation',
    description:
      'Implement JWT-based authentication with refresh tokens and role-based access control.',
    total_points: 160,
    passing_points: 112,
    due_date: null, // No due date
    submissions_count: 12,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    course: {
      id: 'course-3',
      title: 'Backend Development with Node.js',
    },
    topic: {
      id: 'topic-6',
      title: 'Unit 4: Security & Authentication',
    },
  },
  {
    id: 'assign-7',
    lesson_id: 'lesson-107',
    course_id: 'course-4',
    topic_id: 'topic-7',
    title: 'Mobile App UI Design',
    description:
      'Design a mobile application interface using Figma. Create wireframes, mockups, and interactive prototypes.',
    total_points: 90,
    passing_points: 63,
    due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    submissions_count: 28,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    course: {
      id: 'course-4',
      title: 'UI/UX Design Principles',
    },
    topic: {
      id: 'topic-7',
      title: 'Chapter 2: Mobile Design Patterns',
    },
  },
  {
    id: 'assign-8',
    lesson_id: 'lesson-108',
    course_id: 'course-4',
    topic_id: 'topic-8',
    title: 'User Research Report',
    description:
      'Conduct user interviews and surveys. Analyze findings and present insights with personas and user journey maps.',
    total_points: 140,
    passing_points: 98,
    due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Past due
    submissions_count: 19,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    course: {
      id: 'course-4',
      title: 'UI/UX Design Principles',
    },
    topic: {
      id: 'topic-8',
      title: 'Chapter 1: Understanding Users',
    },
  },
  {
    id: 'assign-9',
    lesson_id: 'lesson-109',
    course_id: 'course-5',
    topic_id: 'topic-9',
    title: 'Machine Learning Model Training',
    description:
      'Train and evaluate a classification model using Python and scikit-learn. Include feature engineering and cross-validation.',
    total_points: 250,
    passing_points: 175,
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 1 month from now
    submissions_count: 3,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    course: {
      id: 'course-5',
      title: 'Introduction to Machine Learning',
    },
    topic: {
      id: 'topic-9',
      title: 'Week 4: Classification Algorithms',
    },
  },
  {
    id: 'assign-10',
    lesson_id: 'lesson-110',
    course_id: 'course-5',
    topic_id: 'topic-10',
    title: 'Data Preprocessing Pipeline',
    description:
      'Build a complete data preprocessing pipeline handling missing values, outliers, and feature scaling.',
    total_points: 110,
    passing_points: 77,
    due_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    submissions_count: 14,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    course: {
      id: 'course-5',
      title: 'Introduction to Machine Learning',
    },
    topic: {
      id: 'topic-10',
      title: 'Week 2: Data Preparation',
    },
  },
  {
    id: 'assign-11',
    lesson_id: 'lesson-111',
    course_id: 'course-6',
    topic_id: 'topic-11',
    title: 'Docker Container Setup',
    description:
      'Containerize a full-stack application using Docker and Docker Compose. Include multi-stage builds.',
    total_points: 130,
    passing_points: 91,
    due_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    submissions_count: 7,
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    course: {
      id: 'course-6',
      title: 'DevOps Fundamentals',
    },
    topic: {
      id: 'topic-11',
      title: 'Module 2: Containerization',
    },
  },
  {
    id: 'assign-12',
    lesson_id: 'lesson-112',
    course_id: 'course-6',
    topic_id: 'topic-12',
    title: 'CI/CD Pipeline Configuration',
    description:
      'Set up a complete CI/CD pipeline using GitHub Actions or Jenkins. Include automated testing and deployment.',
    total_points: 200,
    passing_points: 140,
    due_date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
    submissions_count: 9,
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    course: {
      id: 'course-6',
      title: 'DevOps Fundamentals',
    },
    topic: {
      id: 'topic-12',
      title: 'Module 3: Continuous Integration & Deployment',
    },
  },
];

// Helper function to get random assignments
export function getRandomAssignments(count = 5) {
  const shuffled = [...sampleAssignmentsData].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Helper function to get assignments by status
export function getAssignmentsByStatus(status) {
  const now = new Date();

  switch (status) {
    case 'past-due':
      return sampleAssignmentsData.filter(
        (a) => a.due_date && new Date(a.due_date) < now
      );
    case 'upcoming':
      return sampleAssignmentsData.filter(
        (a) => a.due_date && new Date(a.due_date) >= now
      );
    case 'no-due-date':
      return sampleAssignmentsData.filter((a) => !a.due_date);
    default:
      return sampleAssignmentsData;
  }
}

// Helper function to get assignments by course
export function getAssignmentsByCourse(courseId) {
  return sampleAssignmentsData.filter((a) => a.course_id === courseId);
}

// Helper function to calculate statistics
export function getAssignmentStatistics() {
  const total = sampleAssignmentsData.length;
  const totalSubmissions = sampleAssignmentsData.reduce(
    (sum, a) => sum + a.submissions_count,
    0
  );
  const avgSubmissions = Math.round(totalSubmissions / total);
  const pastDue = getAssignmentsByStatus('past-due').length;
  const upcoming = getAssignmentsByStatus('upcoming').length;

  return {
    total,
    totalSubmissions,
    avgSubmissions,
    pastDue,
    upcoming,
  };
}
