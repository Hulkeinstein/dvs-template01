import { CourseProvider } from './CourseProvider';
import { getCourseById } from '../actions/courseActions';
import {
  DatabaseCourse,
  TransformedCourse,
  Course,
} from '@/types/course-provider';

interface Lesson {
  id?: string;
  title: string;
  is_preview?: boolean;
  video_url?: string;
  content_type?: string;
  duration_minutes?: number;
}

interface CourseSettings {
  certificate_enabled?: boolean;
}

interface RawCourseData extends DatabaseCourse {
  course_id?: string;
  courseTitle?: string;
  short_description?: string;
  what_you_will_learn?: Array<{ listItem: string }>;
  badges?: any[];
  course_badges?: any[];
  lessons?: Lesson[];
  course_settings?: CourseSettings[];
}

interface Session {
  user?: {
    email?: string;
  };
}

/**
 * Database Course Provider
 * Provides course data from Supabase database for real courses
 */
export class DatabaseCourseProvider extends CourseProvider {
  private session: Session | null;

  constructor(session: Session | null = null) {
    super();
    this.session = session;
  }

  /**
   * Get course by ID from database
   * @param courseId - The course ID (UUID format)
   * @returns Course data
   */
  async getCourseById(courseId: string): Promise<Course | null> {
    try {
      const result = await getCourseById(courseId);

      if (result.error) {
        throw new Error(result.error);
      }

      if (!result.course) {
        throw new Error(`Course with ID ${courseId} not found`);
      }

      const course = result.course as RawCourseData;

      // Check access permissions for draft/pending courses
      if (
        this.session &&
        (course.status === 'draft' || course.status === 'pending')
      ) {
        const isOwner =
          this.session.user?.email &&
          course.instructor?.email === this.session.user.email;

        if (!isOwner) {
          throw new Error(
            'Access denied: You do not have permission to view this course'
          );
        }
      }

      return this.transformCourse(course);
    } catch (error) {
      console.error('Error fetching course from database:', error);
      throw error;
    }
  }

  /**
   * Convert various YouTube URL formats to standard format
   */
  private convertYouTubeUrl(url: string | null | undefined): string | null {
    if (!url) return null;

    // Remove query parameters after video ID
    let videoId: string | null = null;

    // Handle youtu.be format
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    // Handle youtube.com/watch format
    else if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(url.split('?')[1]);
      videoId = urlParams.get('v');
    }
    // Handle youtube.com/embed format
    else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1].split('?')[0];
    }

    if (videoId) {
      return `https://www.youtube.com/watch?v=${videoId}`;
    }

    return url; // Return original if not YouTube
  }

  /**
   * Get preview video URL from course intro video or lessons
   */
  private getPreviewVideoUrl(rawData: RawCourseData): string | null {
    // 1. First priority: Course Intro Video
    if (rawData.intro_video_url) {
      const convertedUrl = this.convertYouTubeUrl(rawData.intro_video_url);
      return convertedUrl;
    }

    // 2. Second priority: Lesson marked as preview
    if (rawData.lessons && rawData.lessons.length > 0) {
      const previewLesson = rawData.lessons.find((lesson) => lesson.is_preview);
      if (previewLesson && previewLesson.video_url) {
        const convertedUrl = this.convertYouTubeUrl(previewLesson.video_url);
        return convertedUrl;
      }

      // 3. Third priority: First video lesson
      const firstVideoLesson = rawData.lessons.find(
        (lesson) =>
          lesson.video_url &&
          (lesson.content_type === 'video' ||
            lesson.content_type === 'lesson' ||
            !lesson.content_type)
      );
      if (firstVideoLesson) {
        const convertedUrl = this.convertYouTubeUrl(firstVideoLesson.video_url);
        return convertedUrl;
      }
    }

    // 4. No video found - will use default YouTube video in Viedo.js
    return null;
  }

  /**
   * Transform database data to match component structure
   */
  transformCourse(rawData: RawCourseData): TransformedCourse {
    const previewUrl = this.getPreviewVideoUrl(rawData);

    return {
      ...rawData,
      // 명확한 타입 구분
      kind: 'course' as const,

      // 식별자 정규화
      courseId: rawData.id || rawData.course_id || rawData.slug || '',
      productKey: `course:${rawData.id || rawData.slug || (rawData.title || '').toLowerCase()}`,

      // Map database fields to component expected fields
      // 표시용 필드 (둘 다 제공)
      courseTitle: rawData.title || rawData.courseTitle || '',
      title: rawData.title || rawData.courseTitle || '',

      // 기타 필드들
      courseImg: rawData.thumbnail_url,
      price: rawData.regular_price || 0,
      offPrice: rawData.discounted_price || rawData.regular_price || 0,
      discount:
        rawData.discounted_price &&
        rawData.regular_price &&
        rawData.regular_price > rawData.discounted_price
          ? Math.round(
              ((rawData.regular_price - rawData.discounted_price) /
                rawData.regular_price) *
                100
            )
          : 0,
      desc: rawData.short_description,
      sellsType: rawData.is_bestseller ? 'Bestseller' : '',
      star: '4.8', // TODO(ANY-TODO): Calculate from actual reviews
      ratingNumber: '0', // TODO(ANY-TODO): Get actual review count
      studentNumber: '0', // TODO(ANY-TODO): Get actual enrollment count
      userImg: rawData.instructor?.avatar_url || '/images/client/avatar-02.png',
      userName: rawData.instructor?.name,
      userCategory: rawData.instructor?.expertise || 'Instructor',
      date: rawData.updated_at
        ? new Date(rawData.updated_at).toLocaleDateString()
        : '',
      language: rawData.language || 'English',
      days: '3', // TODO(ANY-TODO): Calculate from course duration

      // Include badges data for course details page
      badges: rawData.badges || rawData.course_badges || [],

      // Preview video URL - use first preview lesson or first video lesson
      previewVideoUrl: previewUrl,

      // Course sections
      courseOverview: [
        {
          title: "What you'll learn",
          desc:
            rawData.about_course ||
            rawData.description ||
            'No overview available',
          descTwo: rawData.targeted_audience
            ? `Target Audience: ${rawData.targeted_audience}`
            : 'This course provides comprehensive knowledge and practical skills to help you master the subject.',
          overviewList: rawData.what_you_will_learn || [
            { listItem: 'Understand core concepts and fundamentals' },
            { listItem: 'Gain practical hands-on experience' },
            { listItem: 'Build real-world projects' },
            { listItem: 'Learn industry best practices' },
          ],
        },
      ],

      courseContent: [
        {
          title: 'Course Content',
          contentList:
            rawData.lessons && rawData.lessons.length > 0
              ? [
                  {
                    title: 'Course Lessons',
                    time: `${rawData.lessons.length} lessons`,
                    collapsed: false,
                    isShow: true,
                    expand: true,
                    listItem: rawData.lessons.map((lesson) => ({
                      text: lesson.title,
                      time:
                        lesson.content_type === 'quiz'
                          ? 'Quiz'
                          : lesson.content_type === 'assignment'
                            ? 'Assignment'
                            : lesson.duration_minutes
                              ? `${lesson.duration_minutes}min`
                              : '',
                      status: true,
                      playIcon:
                        lesson.content_type === 'video' ||
                        lesson.content_type === 'lesson' ||
                        !lesson.content_type,
                      contentType: lesson.content_type || 'video',
                      isQuiz: lesson.content_type === 'quiz',
                      isAssignment: lesson.content_type === 'assignment',
                    })),
                  },
                ]
              : [
                  {
                    title: 'Course Content',
                    time: 'Coming soon',
                    collapsed: false,
                    isShow: true,
                    expand: true,
                    listItem: [
                      {
                        text: 'Content will be available soon',
                        time: '',
                        status: false,
                        playIcon: false,
                      },
                    ],
                  },
                ],
        },
      ],

      courseRequirement: [
        {
          title: 'Requirements',
          detailsList: this.parseRequirements(rawData.requirements),
        },
      ],

      courseInstructor: rawData.instructor
        ? [
            {
              title: 'About the instructor',
              body: [
                {
                  id: rawData.instructor.id,
                  img:
                    rawData.instructor.avatar_url ||
                    '/images/client/avatar-02.png',
                  name: rawData.instructor.name,
                  type: rawData.instructor.role || 'Instructor',
                  ratingNumber: '0',
                  star: '0.0',
                  studentNumber: '0',
                  course: '1',
                  desc:
                    rawData.instructor.bio ||
                    'Experienced instructor passionate about teaching.',
                  social: [
                    { icon: 'facebook', link: '#' },
                    { icon: 'twitter', link: '#' },
                    { icon: 'linkedin', link: '#' },
                  ],
                },
              ],
            },
          ]
        : [],

      roadmap: [
        {
          text: 'Start Date',
          desc: rawData.start_date
            ? new Date(rawData.start_date).toLocaleDateString()
            : 'Flexible',
        },
        {
          text: 'Enrolled',
          desc: '0', // TODO(ANY-TODO): Get actual enrollment count
        },
        {
          text: 'Lectures',
          desc: rawData.lessons ? rawData.lessons.length.toString() : '0',
        },
        {
          text: 'Skill Level',
          desc: this.formatDifficultyLevel(rawData.difficulty_level),
        },
        {
          text: 'Language',
          desc: rawData.language || 'English',
        },
        {
          text: 'Certificate',
          desc: rawData.course_settings?.[0]?.certificate_enabled
            ? 'Yes'
            : 'No',
        },
      ],

      featuredReview: [],
      relatedCourse: [],
      similarCourse: [],

      // Additional fields for TransformedCourse that don't have defaults
      lectureCount: rawData.lessons?.length,
      totalDuration: rawData.total_duration_hours
        ? `${rawData.total_duration_hours}h ${rawData.total_duration_minutes || 0}m`
        : undefined,
    };
  }

  /**
   * Parse requirements string into array format
   */
  private parseRequirements(
    requirements?: string | Array<{ listItem: string }>
  ): Array<{ listItem: string }> {
    // If requirements is already an array, return it
    if (Array.isArray(requirements)) {
      return requirements;
    }

    // If requirements is a string, split by newlines and create array
    if (typeof requirements === 'string' && requirements.trim()) {
      return requirements
        .split('\n')
        .map((req) => req.trim())
        .filter((req) => req.length > 0)
        .map((req) => ({ listItem: req }));
    }

    // Default requirements if none provided
    return [
      { listItem: 'Basic computer skills' },
      { listItem: 'Internet connection' },
      { listItem: 'Dedication to learn' },
    ];
  }

  /**
   * Format difficulty level for display
   */
  private formatDifficultyLevel(level?: string): string {
    const levelMap: Record<string, string> = {
      all_levels: 'All Levels',
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    };
    return levelMap[level || ''] || 'All Levels';
  }

  /**
   * Check if this provider can handle the given course ID
   * Database provider handles UUID format IDs
   */
  canHandle(courseId: string): boolean {
    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(courseId);
  }
}
