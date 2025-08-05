'use server'

import { supabase } from '@/app/lib/supabase/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { revalidatePath } from 'next/cache'
import { mapFormDataToDB, mapFormDataToSettings, logUnmappedFields } from '@/app/lib/utils/courseDataMapper'
import { saveCourseContent } from './courseContentActions'

// Create a new course
export async function createCourse(formData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return { error: 'You must be logged in to create a course' }
    }
    
    // 테이블 스키마 디버깅
    try {
      // 빈 쿼리로 테이블 구조 확인
      const { data: sampleData, error: sampleError } = await supabase
        .from('courses')
        .select('*')
        .limit(1)
      
      if (sampleData && sampleData.length >= 0) {
        const columns = sampleData.length > 0 ? Object.keys(sampleData[0]) : [];
        console.log('Courses table actual columns:', columns);
      }
      
      // 에러 정보에서도 힌트를 얻을 수 있음
      if (sampleError) {
        console.log('Sample query error:', sampleError);
      }
    } catch (debugError) {
      console.log('Debug error:', debugError);
    }

    // Get user ID from Supabase
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id, role')
      .eq('email', session.user.email)
      .single()

    if (userError || !userData) {
      return { error: 'User not found' }
    }

    if (userData.role !== 'instructor') {
      return { error: 'Only instructors can create courses' }
    }

    // slug 생성 (title에서 자동 생성)
    const createSlug = (title) => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100) + '-' + Date.now();
    };

    // Create course - mapper를 사용하여 데이터 변환
    const mappedData = mapFormDataToDB(formData);
    const courseData = {
      instructor_id: userData.id,
      slug: createSlug(formData.title),
      status: 'draft',
      is_public: false,
      enable_qa: false,
      ...mappedData
    };
    
    console.log('Course data to insert:', {
      ...courseData,
      thumbnail_url: courseData.thumbnail_url ? `[URL: ${courseData.thumbnail_url.substring(0, 50)}...]` : 'none'
    });

    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert(courseData)
      .select()
      .single()

    if (courseError) {
      console.error('Course creation error - Full details:', {
        error: courseError,
        message: courseError.message,
        details: courseError.details,
        hint: courseError.hint,
        code: courseError.code
      })
      return { error: `Failed to create course: ${courseError.message || 'Unknown error'}` }
    }

    // Create course settings - mapper를 사용하여 데이터 변환
    const settingsData = {
      course_id: course.id,
      ...mapFormDataToSettings(formData)
    };

    const { error: settingsError } = await supabase
      .from('course_settings')
      .insert(settingsData)

    if (settingsError) {
      console.error('Settings creation error:', settingsError)
      // Don't fail the whole operation if settings fail
    }

    // Create topics and lessons
    if (formData.topics && formData.topics.length > 0) {
      for (let topicIndex = 0; topicIndex < formData.topics.length; topicIndex++) {
        const topic = formData.topics[topicIndex];
        
        // Create topic
        const { data: topicData, error: topicError } = await supabase
          .from('course_topics')
          .insert({
            course_id: course.id,
            title: topic.name,
            description: topic.summary,
            sort_order: topicIndex + 1 + 1
          })
          .select()
          .single()
        
        if (topicError) {
          console.error('Topic creation error:', topicError)
          continue;
        }
        
        // Create lessons for this topic
        if (topic.lessons && topic.lessons.length > 0) {
          for (let lessonIndex = 0; lessonIndex < topic.lessons.length; lessonIndex++) {
            const lesson = topic.lessons[lessonIndex];
            
            const { error: lessonError } = await supabase
              .from('lessons')
              .insert({
                course_id: course.id,
                topic_id: topicData.id,
                title: lesson.title,
                description: lesson.description,
                video_url: lesson.videoUrl,
                video_source: lesson.videoSource || 'youtube',
                duration_minutes: Math.floor(lesson.duration / 60) || 0,
                sort_order: lessonIndex + 1,
                is_preview: lesson.enablePreview || false,
                content_type: 'video'
              })
            
            if (lessonError) {
              console.error('Lesson creation error:', lessonError)
            }
          }
        }
        
        // Create quizzes for this topic
        if (topic.quizzes && topic.quizzes.length > 0) {
          for (let quizIndex = 0; quizIndex < topic.quizzes.length; quizIndex++) {
            const quiz = topic.quizzes[quizIndex];
            
            // Extract questions and settings like createQuizLesson does
            const quizContent = {
              questions: quiz.questions || [],
              settings: quiz.settings || {
                passingScore: 70,
                feedbackMode: 'default',
                randomizeQuestions: false,
                showAnswersAfterSubmit: true,
                maxQuestions: 0,
                maxAttempts: 3,
                questionLayout: 'random',
                questionsOrder: 'single_question',
                hideQuestionNumber: false,
                shortAnswerLimit: 200,
                essayAnswerLimit: 500
              }
            };
            
            // Calculate metadata
            const totalPoints = quizContent.questions.reduce((sum, q) => sum + (q.points || 10), 0);
            const questionCount = quizContent.questions.length;
            
            quizContent.metadata = {
              totalPoints,
              questionCount
            };
            
            const { error: quizError } = await supabase
              .from('lessons')
              .insert({
                course_id: course.id,
                topic_id: topicData.id,
                title: quiz.title || 'Quiz',
                description: quiz.summary || '',
                content_data: quizContent,
                duration_minutes: Math.ceil(questionCount * 2), // Estimate 2 minutes per question
                sort_order: (topic.lessons?.length || 0) + quizIndex + 1,
                is_preview: false,
                content_type: 'quiz'
              })
            
            if (quizError) {
              console.error('Quiz creation error:', quizError)
              console.error('Failed quiz data:', { title: quiz.title, questionsCount: questionCount })
            }
          }
        }
      }
    }

    revalidatePath('/instructor/courses')
    revalidatePath('/courses')
    
    return { success: true, courseId: course.id }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Update course information
export async function updateCourse(courseId, formData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return { error: 'You must be logged in to update a course' }
    }

    // Get user ID and verify ownership
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (userError || !userData) {
      return { error: 'User not found' }
    }

    // Verify the user owns this course
    const { data: courseCheck, error: checkError } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single()

    if (checkError || !courseCheck || courseCheck.instructor_id !== userData.id) {
      return { error: 'You do not have permission to update this course' }
    }

    // Update course - mapper를 사용하여 데이터 변환
    const courseData = mapFormDataToDB(formData);
    
    // 디버깅: 매핑되지 않은 필드 확인
    if (process.env.NODE_ENV === 'development') {
      logUnmappedFields(formData, courseData);
    }

    console.log('Updating course with data:', {
      ...courseData,
      thumbnail_url: courseData.thumbnail_url ? `[URL: ${courseData.thumbnail_url.substring(0, 50)}...]` : 'none'
    });
    
    const { error: updateError } = await supabase
      .from('courses')
      .update(courseData)
      .eq('id', courseId)

    if (updateError) {
      console.error('Course update error - Full details:', {
        error: updateError,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code
      })
      return { error: `Failed to update course: ${updateError.message || 'Unknown error'}` }
    }

    // Update settings - mapper를 사용하여 데이터 변환
    const settingsData = mapFormDataToSettings(formData);

    await supabase
      .from('course_settings')
      .update(settingsData)
      .eq('course_id', courseId)

    // Update topics and lessons using the new saveCourseContent function
    if (formData.topics && formData.topics.length > 0) {
      console.log('Updating topics and lessons. Topics count:', formData.topics.length);
      
      // Use the saveCourseContent function to handle all topic/lesson/quiz updates
      const contentResult = await saveCourseContent(courseId, formData.topics);
      
      if (!contentResult.success) {
        console.error('Failed to save course content:', contentResult.error);
        return { error: `Failed to save course content: ${contentResult.error}` };
      }
      
      console.log('Course content saved successfully');
    } else {
      // If no topics, delete all existing topics (cascade will handle lessons)
      const { error: deleteError } = await supabase
        .from('course_topics')
        .delete()
        .eq('course_id', courseId);
        
      if (deleteError) {
        console.error('Error deleting topics:', deleteError);
      }
    }

    revalidatePath(`/courses/${courseId}`)
    revalidatePath('/instructor/courses')
    revalidatePath('/create-course')
    
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Add a lesson to a course
export async function addLesson(courseId, lessonData) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return { error: 'You must be logged in to add lessons' }
    }

    // Verify ownership
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (userError || !userData) {
      return { error: 'User not found' }
    }

    const { data: courseCheck, error: checkError } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single()

    if (checkError || !courseCheck || courseCheck.instructor_id !== userData.id) {
      return { error: 'You do not have permission to add lessons to this course' }
    }

    // Get the current max order index
    const { data: maxOrderData } = await supabase
      .from('lessons')
      .select('order_index')
      .eq('course_id', courseId)
      .order('order_index', { ascending: false })
      .limit(1)

    const nextOrder = maxOrderData && maxOrderData.length > 0 
      ? maxOrderData[0].order_index + 1 
      : 1

    // Add lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert({
        course_id: courseId,
        title: lessonData.title,
        description: lessonData.description,
        video_url: lessonData.videoUrl,
        duration_minutes: lessonData.duration ? parseInt(lessonData.duration) : null,
        order_index: nextOrder,
        is_preview: lessonData.isPreview || false
      })
      .select()
      .single()

    if (lessonError) {
      console.error('Lesson creation error:', lessonError)
      return { error: 'Failed to add lesson' }
    }

    revalidatePath(`/courses/${courseId}`)
    
    return { success: true, lessonId: lesson.id }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Delete a lesson
export async function deleteLesson(lessonId) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return { error: 'You must be logged in to delete lessons' }
    }

    // Get lesson details and verify ownership
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('course_id, courses!inner(instructor_id)')
      .eq('id', lessonId)
      .single()

    if (lessonError || !lesson) {
      return { error: 'Lesson not found' }
    }

    const { data: userData } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!userData || lesson.courses.instructor_id !== userData.id) {
      return { error: 'You do not have permission to delete this lesson' }
    }

    // Delete lesson
    const { error: deleteError } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId)

    if (deleteError) {
      console.error('Lesson deletion error:', deleteError)
      return { error: 'Failed to delete lesson' }
    }

    revalidatePath(`/courses/${lesson.course_id}`)
    
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Publish or unpublish a course
export async function updateCourseStatus(courseId, status) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return { error: 'You must be logged in to update course status' }
    }

    // Verify ownership
    const { data: userData } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!userData) {
      return { error: 'User not found' }
    }

    const { data: courseCheck } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single()

    if (!courseCheck || courseCheck.instructor_id !== userData.id) {
      return { error: 'You do not have permission to update this course' }
    }

    // Update status
    const { error: updateError } = await supabase
      .from('courses')
      .update({ status })
      .eq('id', courseId)

    if (updateError) {
      console.error('Status update error:', updateError)
      return { error: 'Failed to update course status' }
    }

    revalidatePath(`/courses/${courseId}`)
    revalidatePath('/instructor/courses')
    revalidatePath('/courses')
    
    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Get instructor's courses
export async function getInstructorCourses() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return { error: 'You must be logged in to view your courses' }
    }

    const { data: userData } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (!userData) {
      return { error: 'User not found' }
    }

    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_settings (*),
        lessons (count),
        enrollments (count)
      `)
      .eq('instructor_id', userData.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch courses error - Full details:', {
        error: error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return { error: `Failed to fetch courses: ${error.message || 'Unknown error'}` }
    }

    return { courses: courses || [] }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Delete a course
export async function deleteCourse(courseId) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return { error: 'You must be logged in to delete a course' }
    }

    // Get user ID and verify ownership
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single()

    if (userError || !userData) {
      return { error: 'User not found' }
    }

    // Verify the user owns this course
    const { data: courseCheck, error: checkError } = await supabase
      .from('courses')
      .select('instructor_id, title')
      .eq('id', courseId)
      .single()

    if (checkError || !courseCheck) {
      return { error: 'Course not found' }
    }

    if (courseCheck.instructor_id !== userData.id) {
      return { error: 'You do not have permission to delete this course' }
    }

    // Delete the course (CASCADE will handle related data)
    const { error: deleteError } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)

    if (deleteError) {
      console.error('Course deletion error:', deleteError)
      return { error: 'Failed to delete course' }
    }

    revalidatePath('/instructor/courses')
    revalidatePath('/courses')
    
    return { success: true, message: `"${courseCheck.title}" 코스가 성공적으로 삭제되었습니다.` }
  } catch (error) {
    console.error('Unexpected error in deleteCourse:', error)
    return { error: 'An unexpected error occurred' }
  }
}

// Get single course details
export async function getCourseById(courseId) {
  try {
    console.log('getCourseById called with ID:', courseId);
    
    // 1. 먼저 코스 기본 정보 로드
    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_settings (*)
      `)
      .eq('id', courseId)
      .single()
      
    if (error) {
      console.error('Fetch course error - Full details:', {
        error: error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        courseId: courseId
      })
      return { error: `Failed to fetch course: ${error.message || 'Unknown error'}` }
    }
    
    if (!course) {
      return { error: 'Course not found' }
    }
    
    // 2. instructor 정보를 user 테이블에서 로드
    if (course.instructor_id) {
      const { data: instructorData, error: instructorError } = await supabase
        .from('user')
        .select('id, email, name, role, avatar_url, bio')
        .eq('id', course.instructor_id)
        .single()
        
      if (!instructorError && instructorData) {
        course.instructor = instructorData
        console.log('Instructor loaded:', instructorData.name)
      } else {
        console.log('Could not load instructor data:', instructorError)
        // instructor 정보가 없어도 코스는 반환
        course.instructor = null
      }
    }

    console.log('Course found:', course.id, course.title);
    
    // 3. Topics 로드
    const { data: topics, error: topicsError } = await supabase
      .from('course_topics')
      .select('*')
      .eq('course_id', courseId)
      .order('sort_order', { ascending: true })
    
    if (topicsError) {
      console.error('Error loading topics:', topicsError)
      course.topics = []
    } else {
      course.topics = topics || []
    }
    
    // 4. 모든 레슨 한번에 로드 (성능 최적화) - thumbnail_url과 attachments 포함
    const { data: allLessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('sort_order', { ascending: true })
    
    if (lessonsError) {
      console.error('Error loading lessons:', lessonsError)
      course.lessons = []
    } else {
      course.lessons = allLessons || []
      
      // 5. Topics에 레슨 할당
      if (course.topics && course.topics.length > 0) {
        for (const topic of course.topics) {
          topic.lessons = allLessons?.filter(lesson => lesson.topic_id === topic.id) || []
        }
      }
      
      // 6. Topic에 속하지 않은 레슨들도 유지
      const orphanLessons = allLessons?.filter(lesson => !lesson.topic_id) || []
      if (orphanLessons.length > 0) {
        console.log('Found lessons without topics:', orphanLessons.length)
      }
    }
    
    console.log('Course loaded successfully with', course.topics?.length || 0, 'topics and', course.lessons?.length || 0, 'lessons')
    
    return { course }
  } catch (error) {
    console.error('Unexpected error in getCourseById:', error)
    return { error: 'An unexpected error occurred' }
  }
}