import { CourseProvider } from './CourseProvider';
import { getCourseById } from '../actions/courseActions';

/**
 * Database Course Provider
 * Provides course data from Supabase database for real courses
 */
export class DatabaseCourseProvider extends CourseProvider {
  constructor(session = null) {
    super();
    this.session = session;
  }

  /**
   * Get course by ID from database
   * @param {string} courseId - The course ID (UUID format)
   * @returns {Promise<Object>} Course data
   */
  async getCourseById(courseId) {
    try {
      const result = await getCourseById(courseId);

      if (result.error) {
        throw new Error(result.error);
      }

      if (!result.course) {
        throw new Error(`Course with ID ${courseId} not found`);
      }

      // Check access permissions for draft/pending courses
      if (
        this.session &&
        (result.course.status === 'draft' || result.course.status === 'pending')
      ) {
        const isOwner =
          this.session.user?.email &&
          result.course.instructor?.email === this.session.user.email;

        if (!isOwner) {
          throw new Error(
            'Access denied: You do not have permission to view this course'
          );
        }
      }

      return this.transformCourse(result.course);
    } catch (error) {
      console.error('Error fetching course from database:', error);
      throw error;
    }
  }

  /**
   * Convert various YouTube URL formats to standard format
   */
  convertYouTubeUrl(url) {
    if (!url) return null;

    // Remove query parameters after video ID
    let videoId = null;

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
  getPreviewVideoUrl(rawData) {
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
  transformCourse(rawData) {
    const previewUrl = this.getPreviewVideoUrl(rawData);

    return {
      ...rawData,
      // Map database fields to component expected fields
      courseTitle: rawData.title,
      courseImg: rawData.thumbnail_url,
      price: rawData.regular_price || 0,
      offPrice: rawData.discounted_price || rawData.regular_price || 0,
      discount:
        rawData.discounted_price &&
        rawData.regular_price > rawData.discounted_price
          ? Math.round(
              ((rawData.regular_price - rawData.discounted_price) /
                rawData.regular_price) *
                100
            )
          : 0,
      desc: rawData.short_description,
      sellsType: rawData.is_bestseller ? 'Bestseller' : '',
      star: '4.8', // TODO: Calculate from actual reviews
      ratingNumber: '0', // TODO: Get actual review count
      studentNumber: '0', // TODO: Get actual enrollment count
      userImg: rawData.instructor?.avatar_url || '/images/client/avatar-02.png',
      userName: rawData.instructor?.name,
      userCategory: rawData.instructor?.expertise || 'Instructor',
      date: rawData.updated_at
        ? new Date(rawData.updated_at).toLocaleDateString()
        : '',
      language: rawData.language || 'English',
      days: '3', // TODO: Calculate from course duration

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
          desc: '0', // TODO: Get actual enrollment count
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
    };
  }

  /**
   * Parse requirements string into array format
   */
  parseRequirements(requirements) {
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
  formatDifficultyLevel(level) {
    const levelMap = {
      all_levels: 'All Levels',
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    };
    return levelMap[level] || 'All Levels';
  }

  /**
   * Check if this provider can handle the given course ID
   * Database provider handles UUID format IDs
   */
  canHandle(courseId) {
    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(courseId);
  }
}
