"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Select from "react-select";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PhoneVerificationModal from "@/components/Common/PhoneVerificationModal";
import { isPhoneVerified, getVerificationPromptMessage } from "@/app/lib/utils/phoneVerification";
import { createCourse, updateCourse, getCourseById, deleteLesson } from "@/app/lib/actions/courseActions";
import { getLessonsByCourse } from "@/app/lib/actions/lessonActions";
import { createQuizLesson, deleteQuizLesson } from "@/app/lib/actions/quizActions";
import { uploadCourseThumbnail } from "@/app/lib/actions/uploadActions";
import { mapDBToFormData } from "@/app/lib/utils/courseDataMapper";
import { contentHelpers } from "@/app/lib/utils/contentHelpers";
import { logger } from "@/app/lib/utils/logger";

// import CourseData from "../../data/course-details/courseData.json";
import CreateCourseData from "../../data/createCourse.json";

import svgImg from "../../public/images/icons/certificate-none.svg";
import svgImg2 from "../../public/images/icons/certificate-none-portrait.svg";

import InfoForm from "./InfoForm";
import TopicModal from "./QuizModals/TopicModal";
import AdditionalForm from "./AdditionalForm";
import LessonModal from "./QuizModals/LessonModal";
import QuizModal from "./QuizModals/QuizModal";
import AssignmentModal from "./QuizModals/AssignmentModal";
import UpdateModal from "./QuizModals/UpdateModal";
import Lesson from "./lesson/Lesson";

const CreateCourse = ({ userProfile, editMode = false, courseId = null }) => {
  logger.log('CreateCourse component rendered:', { editMode, courseId });
  const { data: session } = useSession();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [sortVideo, setSortByVideo] = useState({
    value: "Select Video Sources",
    label: "Select Video Sources",
  });
  const [showPhoneVerificationModal, setShowPhoneVerificationModal] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailBase64, setThumbnailBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Accordion states - Course Info and Course Builder are open by default
  const [accordionStates, setAccordionStates] = useState(() => {
    // 편집 모드일 때는 Course Info만 열기
    if (editMode) {
      return {
        courseInfo: true,
        courseIntro: false,
        courseBuilder: false,
        additionalInfo: false
      };
    }
    
    // Load from localStorage if available (생성 모드에서만)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('courseAccordionStates');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing accordion states:', e);
        }
      }
    }
    return {
      courseInfo: true,
      courseIntro: false,
      courseBuilder: true,
      additionalInfo: false
    };
  });

  // Save accordion states to localStorage (생성 모드에서만)
  useEffect(() => {
    if (!editMode && typeof window !== 'undefined') {
      localStorage.setItem('courseAccordionStates', JSON.stringify(accordionStates));
    }
  }, [accordionStates, editMode]);

  // 편집 모드일 때 아코디언 상태 강제 설정
  useEffect(() => {
    if (editMode) {
      setAccordionStates({
        courseInfo: true,
        courseIntro: false,
        courseBuilder: false,
        additionalInfo: false
      });
    }
  }, [editMode]);
  
  // Form data state
  const [formData, setFormData] = useState({
    // Basic info
    title: '',
    shortDescription: '',
    description: '',
    category: '',
    level: 'all_levels',
    maxStudents: 0,
    
    // Video
    introVideoUrl: '',
    
    // Pricing
    price: 0,
    discountPrice: null,
    
    // Additional info
    startDate: '',
    endDate: '',
    enrollmentDeadline: '',
    language: 'English',
    duration: 0,
    
    // Certificate
    certificateEnabled: false,
    certificateTitle: '',
    passingGrade: 70,
    lifetimeAccess: true,
    
    // Course content
    topics: []
  });

  // Load course data in edit mode
  useEffect(() => {
    logger.log('useEffect triggered:', { editMode, courseId, isDataLoaded });
    if (editMode && courseId && !isDataLoaded) {
      loadCourseData();
    }
  }, [editMode, courseId, isDataLoaded]);

  // Warn user about unsaved changes
  useEffect(() => {
    const hasUnsavedChanges = () => {
      // 생성 모드에서 topics가 있거나, formData가 기본값과 다르면 true
      if (!editMode) {
        return formData.topics.length > 0 || 
               formData.title !== '' || 
               formData.shortDescription !== '';
      }
      return false;
    };

    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = '저장하지 않은 변경사항이 있습니다. 정말로 페이지를 나가시겠습니까?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [formData, editMode]);

  const loadCourseData = async () => {
    try {
      logger.log('Loading course with ID:', courseId);
      setLoading(true);
      const result = await getCourseById(courseId);
      logger.log('getCourseById result:', result);
      
      if (result.error) {
        logger.error('Error from getCourseById:', result.error);
        setError(result.error);
        setLoading(false);
        return;
      }
      
      if (result.course) {
        const course = result.course;
        logger.log('Course data loaded:', {
          id: course.id,
          title: course.title,
          thumbnail_url: course.thumbnail_url,
          hasThumbnail: !!course.thumbnail_url
        });
        logger.log('Full thumbnail URL:', course.thumbnail_url);
        
        // Map database fields to form fields using centralized mapper
        const mappedData = mapDBToFormData(course);
        
        // Add additional fields that might not be in the mapper
        const formDataWithExtras = {
          ...mappedData,
          thumbnailPreview: course.thumbnail_url || null, // 썸네일 미리보기 추가
          slug: course.slug || '', // slug 추가
          topics: [] // Will be loaded separately
        };
        
        setFormData(formDataWithExtras);
        
        if (course.thumbnail_url) {
          // 편집 모드에서는 기존 썸네일 URL을 base64로 설정
          // 새로운 썸네일을 업로드하지 않으면 이 URL이 그대로 사용됨
          setThumbnailBase64(course.thumbnail_url);
        }
        
        // Load topics from server response
        const topics = [];
        
        if (course.topics && course.topics.length > 0) {
          // Convert server topics to UI format
          for (const topicData of course.topics) {
            const topic = {
              id: topicData.id,
              name: topicData.title,
              summary: topicData.description || '',
              lessons: (topicData.lessons || [])
                .filter(lesson => lesson.content_type !== 'quiz')
                .map(lesson => ({
                  id: lesson.id,
                  title: lesson.title,
                  description: lesson.description || '',
                  videoUrl: lesson.video_url || '',
                  videoSource: lesson.video_source || 'youtube',
                  duration: lesson.duration_minutes || 0,
                  enablePreview: lesson.is_preview || false,
                  thumbnail: lesson.thumbnail_url || null,
                  attachments: lesson.attachments || []
                })),
              quizzes: topicData.quizzes ? 
                // 새로운 방식: topicData.quizzes가 있으면 직접 사용
                (topicData.quizzes || []).map(quiz => ({
                  id: quiz.id,
                  title: quiz.title,
                  summary: quiz.description,
                  content_data: quiz.content_data || {},
                  course_id: course.id, // 코스 ID 추가
                  _pending: false,
                  content_type: 'quiz'
                })) :
                // 기존 방식: lessons에서 필터링 (호환성)
                (topicData.lessons || [])
                  .filter(lesson => lesson.content_type === 'quiz')
                  .map(quiz => ({
                    id: quiz.id,
                    title: quiz.title,
                    summary: quiz.description,
                    content_data: quiz.content_data || {},
                    course_id: course.id, // 코스 ID 추가
                    _pending: false,
                    content_type: 'quiz'
                  })),
              assignments: []
            };
            
            topics.push(topic);
          }
        }
        
        // Also check for lessons without topics (from course.lessons)
        if (course.lessons && course.lessons.length > 0) {
          const lessonsWithoutTopic = course.lessons.filter(lesson => !lesson.topic_id);
          
          if (lessonsWithoutTopic.length > 0) {
            logger.log('Found lessons without topics:', lessonsWithoutTopic.length);
            // Create a "General" topic for lessons without topic_id
            const generalTopic = {
              id: 'general-topic',
              name: 'Course Content',
              summary: 'Main course content',
              lessons: lessonsWithoutTopic
                .filter(lesson => lesson.content_type !== 'quiz')
                .map(lesson => ({
                  id: lesson.id,
                  title: lesson.title,
                  description: lesson.description || '',
                  videoUrl: lesson.video_url || '',
                  videoSource: lesson.video_source || 'youtube',
                  duration: lesson.duration_minutes || 0,
                  enablePreview: lesson.is_preview || false,
                  thumbnail: lesson.thumbnail_url || null,
                  attachments: lesson.attachments || []
                })),
              quizzes: lessonsWithoutTopic
                .filter(lesson => lesson.content_type === 'quiz')
                .map(quiz => ({
                  id: quiz.id,
                  title: quiz.title,
                  summary: quiz.description,
                  content_data: quiz.content_data || {},
                  course_id: course.id, // 코스 ID 추가
                  _pending: false,
                  content_type: 'quiz'
                })),
              assignments: []
            };
            
            topics.push(generalTopic);
          }
        }
        
        setFormData(prev => ({
          ...prev,
          topics: topics
        }));
        
        // 데이터 로드 완료 표시
        setIsDataLoaded(true);
      } else {
        setError('Course not found');
      }
    } catch (error) {
      logger.error('Error loading course:', error);
      setError('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const previewImages = CreateCourseData.createCourse[0].landscape.filter(
    (item) => item.type === "preview"
  );
  const portImages = CreateCourseData.createCourse[0].landscape.filter(
    (item) => item.type === "port"
  );

  const sortByVideoOptions = [
    { value: "Youtube", label: "Youtube" },
    { value: "Vimeo", label: "Vimeo" },
    { value: "Local", label: "Local" },
  ];

  const handleImportClick = (e) => {
    e.preventDefault();
    fileInputRef.current.click();
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
  };

  const handleCreateCourse = async (e, saveAsDraft = false) => {
    e.preventDefault();
    
    // Check if phone is verified
    if (!isPhoneVerified(userProfile)) {
      setShowVerificationAlert(true);
      setShowPhoneVerificationModal(true);
      return;
    }
    
    // Validate required fields
    if (!formData.title || !formData.category || !formData.shortDescription) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (formData.price === '' || formData.price < 0) {
      setError('Please set a valid price (0 for free courses)');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Handle thumbnail
      let thumbnailUrl = null;
      
      // Case 1: Keep existing thumbnail (edit mode, no new file selected)
      if (!thumbnailFile && formData.thumbnailPreview) {
        thumbnailUrl = formData.thumbnailPreview;
        logger.log('Keeping existing thumbnail:', thumbnailUrl);
      }
      // Case 2: Upload new thumbnail
      else if (thumbnailBase64 && thumbnailFile) {
        logger.log('Uploading new thumbnail:', { 
          hasBase64: !!thumbnailBase64, 
          fileName: thumbnailFile.name,
          base64Length: thumbnailBase64?.length 
        });
        
        const uploadResult = await uploadCourseThumbnail(thumbnailBase64, thumbnailFile.name);
        logger.log('Thumbnail upload result:', uploadResult);
        
        if (uploadResult.success) {
          thumbnailUrl = uploadResult.url;
          logger.log('New thumbnail uploaded successfully:', thumbnailUrl);
        } else {
          logger.error('Failed to upload thumbnail:', uploadResult.error);
          // If we have an existing thumbnail, keep it
          if (formData.thumbnailPreview) {
            thumbnailUrl = formData.thumbnailPreview;
            logger.log('Upload failed, keeping existing thumbnail');
          }
        }
      }
      
      logger.log('Final thumbnail URL:', thumbnailUrl);
      
      // Include thumbnail URL and status in formData
      const courseData = {
        ...formData,
        thumbnail_url: thumbnailUrl,
        status: saveAsDraft ? 'draft' : formData.status || 'draft'
      };
      
      let result;
      if (editMode && courseId) {
        // Update existing course
        result = await updateCourse(courseId, courseData);
      } else {
        // Create new course
        result = await createCourse(courseData);
      }
      
      if (result.success) {
        if (saveAsDraft && !editMode) {
          // If saving as draft for new course, redirect to edit mode with new ID
          router.push(`/create-course?edit=${result.courseId}`);
        } else {
          // Success - redirect to instructor courses page
          router.push('/instructor-personal-courses');
        }
      } else {
        setError(result.error || 'Failed to create course');
      }
    } catch (error) {
      logger.error('Error creating course:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFormDataChange = useCallback((newData) => {
    setFormData(newData);
  }, []);
  
  const handleThumbnailChange = useCallback((data) => {
    logger.log('handleThumbnailChange called:', {
      hasData: !!data,
      hasFile: !!data?.file,
      hasBase64: !!data?.base64,
      fileName: data?.file?.name
    });
    
    if (data && data.file && data.base64) {
      setThumbnailFile(data.file);
      setThumbnailBase64(data.base64);
      logger.log('Thumbnail state updated');
    }
  }, []);
  
  const handleAddTopic = useCallback((topicData) => {
    const newTopic = {
      id: Date.now(), // Simple ID generation
      name: topicData.name,
      summary: topicData.summary,
      lessons: [],
      quizzes: [],
      assignments: []
    };
    
    setFormData(prev => ({
      ...prev,
      topics: [...prev.topics, newTopic]
    }));
  }, []);
  
  const handleDeleteTopic = useCallback((topicId) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter(topic => topic.id !== topicId)
    }));
  }, []);
  
  const handleUpdateTopic = useCallback((topicId, updatedData) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.map(topic =>
        topic.id === topicId ? { ...topic, ...updatedData } : topic
      )
    }));
  }, []);
  
  const handleAddLesson = (topicId, lessonData) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      topics: prevFormData.topics.map(topic => {
        if (topic.id === topicId) {
          // 편집 모드인지 확인 (lessonData에 id가 있으면 편집)
          if (lessonData.id) {
            return {
              ...topic,
              lessons: topic.lessons.map(lesson =>
                lesson.id === lessonData.id ? lessonData : lesson
              )
            };
          } else {
            // 새 레슨 추가
            const newLesson = {
              id: Date.now(),
              ...lessonData
            };
            return { ...topic, lessons: [...topic.lessons, newLesson] };
          }
        }
        return topic;
      })
    }));
  };
  
  const handleAddQuiz = async (topicId, quizData) => {
    // 데이터 유효성 검증
    if (!quizData || !quizData.questions || !Array.isArray(quizData.questions)) {
      logger.error('Invalid quiz data structure:', quizData);
      return { success: false, error: '퀴즈 데이터가 올바르지 않습니다. 다시 시도해주세요.' };
    }
    
    // 생성 모드에서 퀴즈 추가 시 경고
    if (!editMode) {
      const confirmSaveDraft = window.confirm(
        '퀴즈를 추가하려면 먼저 코스를 저장해야 합니다.\n' +
        '"Save as Draft"를 클릭하여 코스를 저장하시겠습니까?'
      );
      
      if (confirmSaveDraft) {
        // Save as Draft 버튼 클릭 시뮬레이션
        const event = { preventDefault: () => {} };
        await handleCreateCourse(event, true);
        return { success: false, error: '코스가 저장되었습니다. 다시 퀴즈를 추가해주세요.' };
      }
      
      return { success: false, error: '먼저 코스를 저장해주세요.' };
    }
    
    // Step 1: Optimistic UI - 즉시 UI에 추가
    const tempQuizId = `temp_${Date.now()}`;
    const optimisticQuiz = {
      id: tempQuizId,
      ...quizData,
      _pending: true, // 저장 중 상태 표시
      content_type: 'quiz'
    };
    
    // 즉시 로컬 state 업데이트
    setFormData(prevFormData => ({
      ...prevFormData,
      topics: prevFormData.topics.map(topic =>
        topic.id === topicId 
          ? { ...topic, quizzes: [...topic.quizzes, optimisticQuiz] }
          : topic
      )
    }));

    // Step 2: 편집 모드일 때만 서버에 저장
    if (editMode && courseId) {
      try {
        logger.log('Creating quiz with:', { courseId, topicId, quizData });
        const result = await createQuizLesson(courseId, topicId, quizData);
        logger.log('Quiz creation result:', result);
        
        if (result.success) {
          // Step 3: 성공 - 임시 ID를 실제 ID로 교체하고 pending 상태 제거
          setFormData(prevFormData => ({
            ...prevFormData,
            topics: prevFormData.topics.map(topic =>
              topic.id === topicId 
                ? {
                    ...topic,
                    quizzes: topic.quizzes.map(quiz =>
                      quiz.id === tempQuizId
                        ? { 
                            ...quiz, 
                            id: result.data?.id || quiz.id, 
                            _pending: false,
                            // 서버에서 반환된 데이터로 업데이트
                            ...(result.data?.content_data || {})
                          }
                        : quiz
                    )
                  }
                : topic
            )
          }));
          
          // 전체 데이터 새로고침 - 퀴즈가 lessons 대 quizzes로 올바르게 분리되도록
          setTimeout(() => loadCourseData(), 1000);
          return { success: true };
        } else {
          throw new Error(result.error || 'Failed to save quiz');
        }
      } catch (error) {
        logger.error('Error adding quiz:', error);
        
        // Step 4: 실패 - UI에서 제거
        setFormData(prevFormData => ({
          ...prevFormData,
          topics: prevFormData.topics.map(topic =>
            topic.id === topicId 
              ? {
                  ...topic,
                  quizzes: topic.quizzes.filter(quiz => quiz.id !== tempQuizId)
                }
              : topic
          )
        }));
        
        // Step 5: 에러 메시지 표시
        let errorMessage = 'Quiz 저장에 실패했습니다.';
        if (error.message) {
          logger.error('Quiz save error details:', error.message);
          // Zod validation 에러인 경우
          if (error.message.includes('Required') || error.message.includes('Invalid')) {
            errorMessage += '\n\n문제: ' + error.message;
            errorMessage += '\n\nQuiz 설정을 확인해주세요.';
          } else {
            errorMessage += '\n\n' + error.message;
          }
        }
        
        return { success: false, error: errorMessage };
      }
    } else {
      // 생성 모드에서는 pending 상태 제거 (로컬만 저장)
      setTimeout(() => {
        setFormData(prevFormData => ({
          ...prevFormData,
          topics: prevFormData.topics.map(topic =>
            topic.id === topicId 
              ? {
                  ...topic,
                  quizzes: topic.quizzes.map(quiz =>
                    quiz.id === tempQuizId
                      ? { ...quiz, _pending: false }
                      : quiz
                  )
                }
              : topic
          )
        }));
      }, 500); // 짧은 지연으로 저장 효과 표현
      return { success: true };
    }
  };
  
  const handleUpdateQuiz = (topicId, quizId, updatedData) => {
    logger.log('handleUpdateQuiz called:', { topicId, quizId, updatedData });
    
    setFormData(prevFormData => ({
      ...prevFormData,
      topics: prevFormData.topics.map(topic =>
        topic.id === topicId 
          ? {
              ...topic,
              quizzes: topic.quizzes.map(quiz =>
                quiz.id === quizId
                  ? { ...quiz, ...updatedData }
                  : quiz
              )
            }
          : topic
      )
    }));
  };
  
  const handleAddAssignment = (topicId, assignmentData) => {
    const newAssignment = {
      id: Date.now(),
      ...assignmentData
    };
    
    setFormData({
      ...formData,
      topics: formData.topics.map(topic =>
        topic.id === topicId 
          ? { ...topic, assignments: [...topic.assignments, newAssignment] }
          : topic
      )
    });
  };
  
  const handleContentDelete = async (topicId, content) => {
    logger.log('콘텐츠 삭제:', { topicId, contentId: content.id, type: content.type || content.content_type });
    
    // 1. UI 즉시 업데이트 - content type에 따라 적절한 배열에서 삭제
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.map(topic => {
        if (topic.id !== topicId) return topic;
        
        const contentType = contentHelpers.normalizeType(content);
        const updatedTopic = { ...topic };
        
        // 타입에 따라 해당 배열에서 삭제
        switch(contentType) {
          case 'quiz':
            updatedTopic.quizzes = (topic.quizzes || []).filter(q => q.id !== content.id);
            break;
          case 'assignment':
            updatedTopic.assignments = (topic.assignments || []).filter(a => a.id !== content.id);
            break;
          case 'lesson':
          case 'video':
          default:
            updatedTopic.lessons = (topic.lessons || []).filter(l => l.id !== content.id);
            break;
        }
        
        return updatedTopic;
      })
    }));
    
    // 2. 편집 모드에서는 서버에서도 삭제
    if (editMode && courseId && content.id && !content.id.toString().startsWith('temp_')) {
      try {
        const result = await contentHelpers.deleteContent(content);
        if (!result.success) {
          logger.error('콘텐츠 삭제 실패:', result.error);
          // 실패 시 데이터 다시 로드
          loadCourseData();
          alert('삭제에 실패했습니다. 다시 시도해주세요.');
        }
      } catch (error) {
        logger.error('삭제 중 오류:', error);
        // 실패 시 데이터 다시 로드
        loadCourseData();
        alert('삭제 중 오류가 발생했습니다.');
      }
    }
  };
  
  const handleEditLesson = (topicId, lesson) => {
    logger.log('레슨 편집:', topicId, lesson);
    // 편집 모달 열기 로직 추가 필요
  };
  
  const handleUploadLesson = (topicId, lessonId) => {
    logger.log('레슨 업로드:', topicId, lessonId);
    // 업로드 기능 구현 필요
  };
  return (
    <>
      <div className="row g-5">
        <div className="col-lg-8">
          <div className="rbt-accordion-style rbt-accordion-01 rbt-accordion-06 accordion">
            <div className="accordion" id="tutionaccordionExamplea1">
              <div className="accordion-item card">
                <h2 className="accordion-header card-header" id="accOne">
                  <button
                    className={`accordion-button ${!accordionStates.courseInfo ? 'collapsed' : ''}`}
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#accCollapseOne"
                    aria-expanded={accordionStates.courseInfo}
                    aria-controls="accCollapseOne"
                    onClick={() => setAccordionStates(prev => ({ ...prev, courseInfo: !prev.courseInfo }))}
                  >
                    Course Info
                  </button>
                </h2>
                <div
                  id="accCollapseOne"
                  className={`accordion-collapse collapse ${accordionStates.courseInfo ? 'show' : ''}`}
                  aria-labelledby="accOne"
                >
                  <div className="accordion-body card-body">
                    <InfoForm 
                      formData={formData}
                      onFormDataChange={handleFormDataChange}
                      onThumbnailChange={handleThumbnailChange}
                    />
                  </div>
                </div>
              </div>

              <div className="accordion-item card">
                <h2 className="accordion-header card-header" id="accTwo">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#accCollapseTwo"
                    aria-expanded="false"
                    aria-controls="accCollapseTwo"
                  >
                    Course Intro Video
                  </button>
                </h2>
                <div
                  id="accCollapseTwo"
                  className="accordion-collapse collapse"
                  aria-labelledby="accTwo"
                >
                  <div className="accordion-body card-body rbt-course-field-wrapper rbt-default-form">
                    <div className="course-field mb--20">
                      <div className="rbt-modern-select bg-transparent height-45 mb--10">
                        <Select
                          instanceId="sortBySelect"
                          className="react-select"
                          classNamePrefix="react-select"
                          value={sortVideo}
                          onChange={setSortByVideo}
                          options={sortByVideoOptions}
                        />
                      </div>
                    </div>

                    <div className="course-field mb--15">
                      <label htmlFor="videoUrl">Add Your Video URL</label>
                      <input
                        id="videoUrl"
                        name="introVideoUrl"
                        type="text"
                        placeholder="Add Your Video URL here."
                        value={formData.introVideoUrl || ''}
                        onChange={(e) => handleFormDataChange({ ...formData, introVideoUrl: e.target.value })}
                      />
                      <small className="d-block mt_dec--5">
                        Example:
                        <Link href="https://www.youtube.com/watch?v=yourvideoid">
                          https://www.youtube.com/watch?v=yourvideoid
                        </Link>
                      </small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="accordion-item card">
                <h2 className="accordion-header card-header" id="accThree3">
                  <button
                    className={`accordion-button ${!accordionStates.courseBuilder ? 'collapsed' : ''}`}
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#accCollapseThree3"
                    aria-expanded={accordionStates.courseBuilder}
                    aria-controls="accCollapseThree3"
                    onClick={() => setAccordionStates(prev => ({ ...prev, courseBuilder: !prev.courseBuilder }))}
                  >
                    Course Builder
                  </button>
                </h2>
                <div
                  id="accCollapseThree3"
                  className={`accordion-collapse collapse ${accordionStates.courseBuilder ? 'show' : ''}`}
                  aria-labelledby="accThree3"
                >
                  <div className="accordion-body card-body">
                    {formData.topics.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-muted mb-3">No topics added yet. Start by adding your first topic.</p>
                      </div>
                    ) : (
                      formData.topics.map((topic, index) => (
                        <Lesson
                          key={topic.id}
                          handleFileChange={handleFileChange}
                          handleImportClick={handleImportClick}
                          fileInputRef={fileInputRef}
                          id={`accOne${topic.id}`}
                          topicId={topic.id}
                          target={`accCollapseOne${topic.id}`}
                          expanded={false}
                          text={topic.name}
                          topicData={topic}
                          onDeleteTopic={() => handleDeleteTopic(topic.id)}
                          onUpdateTopic={(data) => handleUpdateTopic(topic.id, data)}
                          onAddLesson={(lessonData) => handleAddLesson(topic.id, lessonData)}
                          onAddQuiz={(quizData) => handleAddQuiz(topic.id, quizData)}
                          onUpdateQuiz={(quizId, updatedData) => handleUpdateQuiz(topic.id, quizId, updatedData)}
                          onAddAssignment={(assignmentData) => handleAddAssignment(topic.id, assignmentData)}
                          onDeleteContent={handleContentDelete}
                          onEditLesson={handleEditLesson}
                          onUploadLesson={handleUploadLesson}
                          start={0}
                          end={4}
                        />
                      ))
                    )}

                    <button
                      className="rbt-btn btn-md btn-gradient hover-icon-reverse"
                      type="button"
                      data-bs-toggle="modal"
                      data-bs-target="#topicModal"
                    >
                      <span className="icon-reverse-wrapper">
                        <span className="btn-text">Add New Topic</span>
                        <span className="btn-icon">
                          <i className="feather-plus-circle"></i>
                        </span>
                        <span className="btn-icon">
                          <i className="feather-plus-circle"></i>
                        </span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="accordion-item card rbt-course-field-wrapper">
                <h2 className="accordion-header card-header" id="accSix">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#accCollapseSix"
                    aria-expanded="false"
                    aria-controls="accCollapseSix"
                  >
                    Additional Information
                  </button>
                </h2>
                <AdditionalForm 
                  formData={formData}
                  onFormDataChange={handleFormDataChange}
                />
              </div>

              <div className="accordion-item card">
                <h2 className="accordion-header card-header" id="accSeven">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#accCollapseEight"
                    aria-expanded="false"
                    aria-controls="accCollapseEight"
                  >
                    Certificate Template
                  </button>
                </h2>
                <div
                  id="accCollapseEight"
                  className="accordion-collapse collapse"
                  aria-labelledby="accSeven"
                >
                  <div className="accordion-body card-body">
                    <div className="advance-tab-button advance-tab-button-1">
                      <ul
                        className="rbt-default-tab-button nav nav-tabs"
                        id="myTab"
                        role="tablist"
                      >
                        <li className="nav-item" role="presentation">
                          <a
                            href="#"
                            className="active"
                            id="landscape-tab"
                            data-bs-toggle="tab"
                            data-bs-target="#landscape"
                            role="tab"
                            aria-controls="landscape"
                            aria-selected="true"
                          >
                            <span>Landscape</span>
                          </a>
                        </li>
                        <li className="nav-item" role="presentation">
                          <a
                            href="#"
                            id="portrait-tab"
                            data-bs-toggle="tab"
                            data-bs-target="#portrait"
                            role="tab"
                            aria-controls="portrait"
                            aria-selected="false"
                          >
                            <span>Portrait</span>
                          </a>
                        </li>
                      </ul>
                    </div>

                    <div className="row">
                      <div className="col-lg-12">
                        <div className="tab-content">
                          <div
                            className="tab-pane fade advance-tab-content-1 active show"
                            id="landscape"
                            role="tabpanel"
                            aria-labelledby="landscape-tab"
                          >
                            <div className="row g-5 mt--10">
                              <div className="col-lg-4">
                                <div className="certificate-inner rbt-image-checkbox">
                                  <input
                                    type="radio"
                                    id="option1"
                                    name="certificateTemplate"
                                    value="none"
                                    checked={formData.certificateTemplate === 'none'}
                                    onChange={(e) => handleFormDataChange({ ...formData, certificateTemplate: e.target.value })}
                                  />
                                  <label htmlFor="option1">
                                    <Image
                                      src={svgImg}
                                      alt="Certificate Image"
                                    />
                                  </label>
                                </div>
                              </div>
                              {CreateCourseData &&
                                previewImages.map((data, index) => (
                                  <div className="col-lg-4" key={index}>
                                    <div className="certificate-inner rbt-image-checkbox">
                                      <input
                                        type="radio"
                                        id={`option${index + 2}`}
                                        name="certificateTemplate"
                                        value={`template${index + 1}`}
                                        checked={formData.certificateTemplate === `template${index + 1}`}
                                        onChange={(e) => handleFormDataChange({ ...formData, certificateTemplate: e.target.value })}
                                      />
                                      <label htmlFor={`option${index + 2}`}>
                                        <Image
                                          src={data.img}
                                          width={242}
                                          height={188}
                                          alt="Certificate Image"
                                        />
                                      </label>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>

                          <div
                            className="tab-pane fade advance-tab-content-1"
                            id="portrait"
                            role="tabpanel"
                            aria-labelledby="portrait-tab"
                          >
                            <div className="row g-5 mt--10">
                              <div className="col-lg-4">
                                <div className="certificate-inner rbt-image-checkbox">
                                  <input
                                    type="radio"
                                    id="optionport1"
                                    name="certificateTemplate"
                                    value="none"
                                    checked={formData.certificateTemplate === 'none'}
                                    onChange={(e) => handleFormDataChange({ ...formData, certificateTemplate: e.target.value })}
                                  />
                                  <label htmlFor="optionport1">
                                    <Image
                                      src={svgImg2}
                                      alt="Certificate Image"
                                    />
                                  </label>
                                </div>
                              </div>
                              {CreateCourseData &&
                                portImages.map((data, index) => (
                                  <div className="col-lg-4" key={index}>
                                    <div className="certificate-inner rbt-image-checkbox">
                                      <input
                                        type="radio"
                                        id={`optionport${index + 3}`}
                                        name="certificateTemplate"
                                        value={`template${index + 1}`}
                                        checked={formData.certificateTemplate === `template${index + 1}`}
                                        onChange={(e) => handleFormDataChange({ ...formData, certificateTemplate: e.target.value })}
                                      />
                                      <label htmlFor={`optionport${index + 3}`}>
                                        <Image
                                          src={data.img}
                                          width={242}
                                          height={340}
                                          alt="Certificate Image"
                                        />
                                      </label>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading course data...</p>
            </div>
          )}
          
          {!loading && (
          <>
          <div className="mt--10 row g-5">
            <div className="col-lg-4">
              {editMode && courseId ? (
                <Link
                  className="rbt-btn hover-icon-reverse bg-primary-opacity w-100 text-center"
                  href={`/course-details/${courseId}?preview=true`}
                  target="_blank"
                >
                  <span className="icon-reverse-wrapper">
                    <span className="btn-text">Preview</span>
                    <span className="btn-icon">
                      <i className="feather-eye"></i>
                    </span>
                    <span className="btn-icon">
                      <i className="feather-eye"></i>
                    </span>
                  </span>
                </Link>
              ) : (
                <button
                  className="rbt-btn hover-icon-reverse bg-secondary-opacity w-100 text-center"
                  onClick={(e) => handleCreateCourse(e, true)}
                  disabled={isSubmitting}
                >
                  <span className="icon-reverse-wrapper">
                    <span className="btn-text">
                      {isSubmitting ? 'Saving...' : 'Save as Draft'}
                    </span>
                    <span className="btn-icon">
                      <i className="feather-save"></i>
                    </span>
                    <span className="btn-icon">
                      <i className="feather-save"></i>
                    </span>
                  </span>
                </button>
              )}
            </div>
            <div className="col-lg-8">
              <button
                className="rbt-btn btn-gradient hover-icon-reverse w-100 text-center"
                onClick={handleCreateCourse}
                disabled={isSubmitting}
              >
                <span className="icon-reverse-wrapper">
                  <span className="btn-text">
                    {isSubmitting ? (editMode ? 'Updating Course...' : 'Creating Course...') : (editMode ? 'Update Course' : 'Create Course')}
                  </span>
                  <span className="btn-icon">
                    <i className={isSubmitting ? "feather-loader" : "feather-arrow-right"}></i>
                  </span>
                  <span className="btn-icon">
                    <i className={isSubmitting ? "feather-loader" : "feather-arrow-right"}></i>
                  </span>
                </span>
              </button>
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="alert alert-danger mt-3" role="alert">
              <i className="feather-alert-circle me-2"></i>
              {error}
            </div>
          )}
          </>
          )}
        </div>

        <div className="col-lg-4">
          <div className="rbt-create-course-sidebar course-sidebar sticky-top rbt-shadow-box rbt-gradient-border">
            <div className="inner">
              <div className="rbt-accordion-style rbt-accordion-01 rbt-accordion-06 accordion">
                <div className="accordion" id="courseUploadTipsAccordion">
                  <div className="accordion-item card" style={{boxShadow: 'none'}}>
                    <h2 className="accordion-header card-header" id="accTips">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#accCollapseTips"
                        aria-expanded="false"
                        aria-controls="accCollapseTips"
                      >
                        Course Upload Tips
                      </button>
                    </h2>
                    <div
                      id="accCollapseTips"
                      className="accordion-collapse collapse"
                      aria-labelledby="accTips"
                      data-bs-parent="#courseUploadTipsAccordion"
                    >
                      <div className="accordion-body card-body" style={{borderTop: 'none'}}>
                        <ul className="rbt-list-style-1">
                          <li>
                            <i className="feather-check"></i> Set the Course Price
                            option or make it free.
                          </li>
                          <li>
                            <i className="feather-check"></i> Standard size for the
                            course thumbnail is 700x430.
                          </li>
                          <li>
                            <i className="feather-check"></i> Video section controls the
                            course overview video.
                          </li>
                          <li>
                            <i className="feather-check"></i> Course Builder is where
                            you create & organize a course.
                          </li>
                          <li>
                            <i className="feather-check"></i> Add Topics in the Course
                            Builder section to create lessons, quizzes, and assignments.
                          </li>
                          <li>
                            <i className="feather-check"></i> Prerequisites refers to
                            the fundamental courses to complete before taking this
                            particular course.
                          </li>
                          <li>
                            <i className="feather-check"></i> Information from the
                            Additional Data section shows up on the course single page.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TopicModal onAddTopic={handleAddTopic} />
      <UpdateModal />
      <LessonModal />
      <QuizModal />
      <AssignmentModal />
      
      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        isOpen={showPhoneVerificationModal}
        onClose={() => {
          setShowPhoneVerificationModal(false);
          setShowVerificationAlert(false);
        }}
        onSuccess={() => {
          setShowPhoneVerificationModal(false);
          setShowVerificationAlert(false);
          // Retry course creation after successful verification
          handleCreateCourse(new Event('click'));
        }}
        userProfile={userProfile}
      />
      
      {/* Verification Alert */}
      {showVerificationAlert && !showPhoneVerificationModal && (
        <div className="position-fixed bottom-0 start-50 translate-middle-x mb-4" style={{ zIndex: 1000 }}>
          <div className="alert alert-warning alert-dismissible fade show" role="alert">
            <i className="feather-alert-circle me-2"></i>
            {getVerificationPromptMessage('create_course')}
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowVerificationAlert(false)}
              aria-label="Close"
            ></button>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateCourse;
