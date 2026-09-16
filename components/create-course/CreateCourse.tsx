'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Select, { SingleValue } from 'react-select';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import PhoneVerificationModal from '@/components/Common/PhoneVerificationModal';
import {
  isPhoneVerified,
  getVerificationPromptMessage,
} from '@/app/lib/utils/phoneVerification';
import {
  createCourse,
  updateCourse,
  getCourseById,
} from '@/app/lib/actions/courseActions';
import { createLesson, updateLesson } from '@/app/lib/actions/lessonActions';
import { createQuizLesson } from '@/app/lib/actions/quizActions';
import { uploadCourseThumbnail } from '@/app/lib/actions/uploadActions';
import { mapDBToFormData } from '@/app/lib/utils/courseDataMapper';
import { useAutoSave } from '@/app/hooks/useAutoSave';
import {
  CreateCourseProps,
  CourseFormData,
  ThumbnailData,
  TopicData,
  LessonData,
  VideoLesson,
  QuizLesson,
  AssignmentLesson,
} from '@/types/create-course';

// import CourseData from "../../data/course-details/courseData.json";
import CreateCourseData from '../../data/createCourse.json';

import svgImg from '../../public/images/icons/certificate-none.svg';
import svgImg2 from '../../public/images/icons/certificate-none-portrait.svg';

import InfoFormNew from './InfoFormNew';
import TopicModal from './QuizModals/TopicModal';
import AdditionalForm from './AdditionalForm';
import LessonModal from './QuizModals/LessonModal';
import QuizModal from './QuizModals/QuizModal';
import UpdateModal from './QuizModals/UpdateModal';
import Lesson from './lesson/Lesson';

interface SelectOption {
  value: string;
  label: string;
}

interface PreviewImage {
  type: string;
  img: string;
}

const CreateCourse = ({
  userProfile,
  editMode = false,
  courseId = null,
}: CreateCourseProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sortVideo, setSortByVideo] = useState<SelectOption>({
    value: 'Select Video Sources',
    label: 'Select Video Sources',
  });
  const [showPhoneVerificationModal, setShowPhoneVerificationModal] =
    useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailBase64, setThumbnailBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [draftTimestamp, setDraftTimestamp] = useState<number | null>(null);

  // tempId를 useRef로 고정 (새로고침 전까지 유지)
  const tempIdRef = useRef<string | null>(null);
  if (!tempIdRef.current) {
    tempIdRef.current = Math.random().toString(36).slice(2, 11);
  }

  // Form data state
  const [formData, setFormData] = useState<CourseFormData>({
    // Basic info
    title: '',
    slug: '', // URL slug 추가
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
    topics: [],
  });

  // 안정적인 userId 생성 (null 체크)
  const userId = useMemo(() => {
    if (userProfile?.id) return `uid_${userProfile.id}`;
    if (session?.user?.email)
      return `email_${session.user.email.replace('@', '_at_')}`;
    // userId가 없으면 null 반환 (guest 사용하지 않음)
    return null;
  }, [userProfile?.id, session?.user?.email]);

  // 자동 저장 키 생성 (userId가 준비된 후에만)
  const storageKey = useMemo(() => {
    if (!userId) {
      return null;
    }

    // 편집 모드일 때는 courseId 사용, 새 코스일 때는 tempId 사용
    const courseIdentifier =
      editMode && courseId ? courseId : tempIdRef.current;
    const key = `course_draft_${userId}_${courseIdentifier}`;

    return key;
  }, [userId, editMode, courseId]);

  // 자동 저장 훅 사용 (storageKey가 있을 때만 활성화)
  const autoSaveResult = useAutoSave(formData, setFormData, {
    storageKey: storageKey || '', // null일 때 빈 문자열
    debounceMs: 3000,
    // intervalMs는 기본값 15000ms 사용 (이전: 30000ms)
    schemaVersion: 'v2', // 버전 업데이트
    excludeFields: ['thumbnailPreview', 'thumbnailFile'], // 큰 데이터는 제외
    enabled: !!storageKey, // storageKey가 있을 때만 활성화
  });

  const saveStatus = (autoSaveResult as any).status;
  const saveNow = (autoSaveResult as any).saveNow;
  const recover = (autoSaveResult as any).recover;
  const getRecoverable = (autoSaveResult as any).getRecoverable;
  const clearDraft = (autoSaveResult as any).clearDraft;

  const loadCourseData = useCallback(async () => {
    try {
      setLoading(true);
      const result = (await getCourseById(courseId!)) as any;

      if (result.error) {
        console.error('Error from getCourseById:', result.error);
        setError(result.error);
        setLoading(false);
        return;
      }

      if (result.course) {
        const course = result.course as any;

        // Map database fields to form fields using centralized mapper
        const mappedData = mapDBToFormData(course);

        // Add additional fields that might not be in the mapper
        const formDataWithExtras: CourseFormData = {
          ...mappedData,
          thumbnailPreview: course.thumbnail_url || null, // 썸네일 미리보기 추가
          slug: course.slug || '', // slug 추가
          topics: [], // Will be loaded separately
        };

        setFormData(formDataWithExtras);

        if (course.thumbnail_url) {
          // 편집 모드에서는 기존 썸네일 URL을 base64로 설정
          // 새로운 썸네일을 업로드하지 않으면 이 URL이 그대로 사용됨
          setThumbnailBase64(course.thumbnail_url);
        }

        // Load topics from server response
        // 통합 lessons 배열 사용 - content_type으로 구분 (서버는 통합 배열만 제공)
        const topics: TopicData[] = [];

        if (course.topics && course.topics.length > 0) {
          // Convert server topics to UI format
          for (const topicData of course.topics) {
            const topic: TopicData = {
              id: topicData.id,
              name: topicData.title,
              summary: topicData.description || '',
              // 모든 콘텐츠를 통합 lessons 배열로 관리
              lessons: (topicData.lessons || []).map(
                (lesson: any): LessonData => {
                  // content_type에 따라 적절한 데이터 매핑
                  if (lesson.content_type === 'quiz') {
                    return {
                      id: lesson.id,
                      title: lesson.title,
                      content_type: 'quiz',
                      questions: lesson.content_data?.questions || [],
                      settings: lesson.content_data?.settings || {},
                      summary: lesson.description || '',
                    } as QuizLesson;
                  } else if (lesson.content_type === 'assignment') {
                    return {
                      id: lesson.id,
                      title: lesson.title,
                      content_type: 'assignment',
                      summary:
                        lesson.content_data?.instructions ||
                        lesson.description ||
                        '',
                      totalPoints: lesson.content_data?.totalPoints || 100,
                      passingPoints: lesson.content_data?.passingPoints || 70,
                      maxUploads: lesson.content_data?.maxUploads || 1,
                      maxFileSize: lesson.content_data?.maxFileSize || 10,
                      attachments: lesson.content_data?.attachments || [],
                      timeLimit: lesson.content_data?.timeLimit || {
                        value: 0,
                        unit: 'weeks',
                      },
                    } as AssignmentLesson;
                  } else {
                    // video or other content types
                    return {
                      id: lesson.id,
                      title: lesson.title,
                      content_type: lesson.content_type || 'video',
                      description: lesson.description || '',
                      videoUrl: lesson.video_url || '',
                      videoSource: lesson.video_source || 'youtube',
                      duration: lesson.duration_minutes || 0,
                      enablePreview: lesson.is_preview || false,
                      thumbnail: lesson.thumbnail_url || null,
                      attachments: lesson.attachments || [],
                      content_data: lesson.content_data || {},
                    } as VideoLesson;
                  }
                }
              ),
            };

            topics.push(topic);
          }
        }

        // Also check for lessons without topics (from course.lessons)
        if (course.lessons && course.lessons.length > 0) {
          const lessonsWithoutTopic = course.lessons.filter(
            (lesson: any) => !lesson.topic_id
          );

          if (lessonsWithoutTopic.length > 0) {
            // Create a "General" topic for lessons without topic_id
            const generalTopic: TopicData = {
              id: 'general-topic',
              name: 'Course Content',
              summary: 'Main course content',
              lessons: lessonsWithoutTopic.map((lesson: any): LessonData => {
                // content_type에 따라 적절한 데이터 매핑
                if (lesson.content_type === 'quiz') {
                  return {
                    id: lesson.id,
                    title: lesson.title,
                    content_type: 'quiz',
                    questions: lesson.content_data?.questions || [],
                    settings: lesson.content_data?.settings || {},
                    summary: lesson.description || '',
                  } as QuizLesson;
                } else if (lesson.content_type === 'assignment') {
                  return {
                    id: lesson.id,
                    title: lesson.title,
                    content_type: 'assignment',
                    summary:
                      lesson.content_data?.instructions ||
                      lesson.description ||
                      '',
                    totalPoints: lesson.content_data?.totalPoints || 100,
                    passingPoints: lesson.content_data?.passingPoints || 70,
                    maxUploads: lesson.content_data?.maxUploads || 1,
                    maxFileSize: lesson.content_data?.maxFileSize || 10,
                    attachments: lesson.content_data?.attachments || [],
                    timeLimit: lesson.content_data?.timeLimit || {
                      value: 0,
                      unit: 'weeks',
                    },
                  } as AssignmentLesson;
                } else {
                  return {
                    id: lesson.id,
                    title: lesson.title,
                    content_type: lesson.content_type || 'video',
                    description: lesson.description || '',
                    videoUrl: lesson.video_url || '',
                    videoSource: lesson.video_source || 'youtube',
                    duration: lesson.duration_minutes || 0,
                    enablePreview: lesson.is_preview || false,
                    thumbnail: lesson.thumbnail_url || null,
                    attachments: lesson.attachments || [],
                    content_data: lesson.content_data || {},
                  } as VideoLesson;
                }
              }),
            };

            topics.push(generalTopic);
          }
        }

        setFormData((prev) => ({
          ...prev,
          topics: topics,
        }));
      } else {
        setError('Course not found');
      }
    } catch (error) {
      console.error('Error loading course:', error);
      setError('Failed to load course data');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  // Load course data in edit mode
  useEffect(() => {
    if (editMode && courseId) {
      loadCourseData();
    }
  }, [editMode, courseId, loadCourseData]);

  // 페이지 로드 시 복구 가능한 draft 확인
  useEffect(() => {
    // storageKey가 준비되고 편집 모드가 아닐 때만 복구 확인
    if (!editMode && storageKey) {
      // 약간의 지연을 주어 컴포넌트가 완전히 마운트되도록 함
      setTimeout(() => {
        const { data, timestamp } = getRecoverable();
        if (data && timestamp) {
          setDraftTimestamp(timestamp);
          setShowRecoveryModal(true);
        }
      }, 100);
    }
  }, [editMode, storageKey, getRecoverable]);

  // Ctrl+S 단축키로 수동 저장
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveNow();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [saveNow]);

  const previewImages: PreviewImage[] =
    CreateCourseData.createCourse[0].landscape.filter(
      (item: any) => item.type === 'preview'
    );
  const portImages: PreviewImage[] =
    CreateCourseData.createCourse[0].landscape.filter(
      (item: any) => item.type === 'port'
    );

  const sortByVideoOptions: SelectOption[] = [
    { value: 'Youtube', label: 'Youtube' },
    { value: 'Vimeo', label: 'Vimeo' },
    { value: 'Local', label: 'Local' },
  ];

  const handleImportClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _file = event.target.files?.[0];
    // TODO: Implement file handling logic
  };

  const handleCreateCourse = async (
    e: React.MouseEvent<HTMLButtonElement> | Event,
    saveAsDraft = false
  ) => {
    if ('preventDefault' in e) {
      e.preventDefault();
    }

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

    if (formData.price === null || formData.price < 0) {
      setError('Please set a valid price (0 for free courses)');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Handle thumbnail
      let thumbnailUrl: string | null = null;

      // Case 1: Keep existing thumbnail (edit mode, no new file selected)
      if (!thumbnailFile && formData.thumbnailPreview) {
        thumbnailUrl = formData.thumbnailPreview;
      }
      // Case 2: Upload new thumbnail
      else if (thumbnailBase64 && thumbnailFile) {
        const uploadResult = await uploadCourseThumbnail(
          thumbnailBase64,
          thumbnailFile.name
        );

        if (uploadResult.success) {
          thumbnailUrl = uploadResult.url!;
        } else {
          console.error('Failed to upload thumbnail:', uploadResult.error);
          // If we have an existing thumbnail, keep it
          if (formData.thumbnailPreview) {
            thumbnailUrl = formData.thumbnailPreview;
          }
        }
      }

      // Include thumbnail URL and status in formData
      const courseData = {
        ...formData,
        thumbnail_url: thumbnailUrl || undefined,
        status: saveAsDraft ? 'draft' : formData.status || 'draft',
      };

      let result: any;
      if (editMode && courseId) {
        // Update existing course
        result = await updateCourse(courseId, formData);
      } else {
        // Create new course
        result = await createCourse(courseData as any);
      }

      if (result.success) {
        // 성공 시 임시 저장 데이터 삭제
        clearDraft();

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
      console.error('Error creating course:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormDataChange = (newData: CourseFormData) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📝 FormData updating:', {
        certificateEnabled: newData.certificateEnabled,
        lifetimeAccess: newData.lifetimeAccess,
      });
    }
    setFormData({ ...newData }); // 새 객체로 생성하여 React 리렌더링 보장
  };

  const handleThumbnailChange = (data: ThumbnailData | null) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('handleThumbnailChange called:', {
        hasData: !!data,
        hasFile: !!data?.file,
        hasBase64: !!data?.base64,
        fileName: data?.file?.name,
      });
    }

    if (data && data.file && data.base64) {
      setThumbnailFile(data.file);
      setThumbnailBase64(data.base64);
      if (process.env.NODE_ENV === 'development') {
        console.log('Thumbnail state updated');
      }
    }
  };

  const handleAddTopic = (topicData: { name: string; summary: string }) => {
    const newTopic: TopicData = {
      id: Date.now(), // Simple ID generation
      name: topicData.name,
      summary: topicData.summary,
      lessons: [],
    };

    setFormData({
      ...formData,
      topics: [...formData.topics, newTopic],
    });
  };

  const handleDeleteTopic = (topicId: string | number) => {
    setFormData({
      ...formData,
      topics: formData.topics.filter((topic) => topic.id !== topicId),
    });
  };

  const handleUpdateTopic = (
    topicId: string | number,
    updatedData: { name: string; summary: string }
  ) => {
    setFormData({
      ...formData,
      topics: formData.topics.map((topic) =>
        topic.id === topicId ? { ...topic, ...updatedData } : topic
      ),
    });
  };

  const handleAddLesson = async (
    topicId: string | number,
    lessonData: VideoLesson
  ) => {
    // Track if this is a new lesson (before any DB operations)
    const isNewLesson = !lessonData.id;
    let savedLessonData = lessonData;

    // Edit mode: Save to DB immediately
    if (editMode && courseId) {
      try {
        if (lessonData.id) {
          // Update existing lesson
          const result = await updateLesson(lessonData.id, {
            ...lessonData,
            courseId,
            topicId,
          });

          if (!result.success) {
            console.error('Error updating lesson:', result.error);
            // Optionally show error to user
          }
        } else {
          // Create new lesson
          const result = await createLesson({
            ...lessonData,
            courseId,
            topicId,
          });

          if (result.success && result.lessonId) {
            // Update lessonData with the real ID from DB
            savedLessonData = {
              ...lessonData,
              id: result.lessonId,
            };
          } else {
            console.error('Error creating lesson:', result.error);
            // Optionally show error
            return; // Don't update UI if DB save failed
          }
        }
      } catch (error) {
        console.error('Error saving lesson:', error);
        return; // Don't update UI if DB save failed
      }
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      topics: prevFormData.topics.map((topic) => {
        if (topic.id === topicId) {
          // Use the original isNewLesson flag, not the updated ID
          if (isNewLesson) {
            // 새 레슨 추가
            const newLesson: VideoLesson = {
              ...savedLessonData,
              id: savedLessonData.id || Date.now(),
            };
            return { ...topic, lessons: [...topic.lessons, newLesson] };
          } else {
            // 기존 레슨 편집
            return {
              ...topic,
              lessons: topic.lessons.map((lesson) =>
                lesson.id === savedLessonData.id ? savedLessonData : lesson
              ),
            };
          }
        }
        return topic;
      }),
    }));
  };

  const handleAddQuiz = async (
    topicId: string | number,
    quizData: QuizLesson
  ): Promise<{ success: boolean; data?: QuizLesson; error?: string }> => {
    // Edit mode: Save to DB immediately to get UUID
    if (editMode && courseId) {
      try {
        const result = await createQuizLesson(courseId, topicId, quizData);

        if (result.success && result.data) {
          const savedQuiz: QuizLesson = {
            ...result.data,
            content_type: 'quiz',
          };

          setFormData((prev) => ({
            ...prev,
            topics: prev.topics.map((topic) =>
              topic.id === topicId
                ? { ...topic, lessons: [...topic.lessons, savedQuiz] }
                : topic
            ),
          }));

          return { success: true, data: savedQuiz };
        } else {
          return { success: false, error: result.error || '퀴즈 저장 실패' };
        }
      } catch (error) {
        console.error('Error saving quiz:', error);
        return { success: false, error: '퀴즈 저장 중 오류 발생' };
      }
    }

    // Create mode: Use temporary ID (will be saved when course is created)
    const newQuiz: QuizLesson = {
      ...quizData,
      id: quizData.id || Date.now(),
      content_type: 'quiz',
    };

    setFormData((prev) => ({
      ...prev,
      topics: prev.topics.map((topic) =>
        topic.id === topicId
          ? { ...topic, lessons: [...topic.lessons, newQuiz] }
          : topic
      ),
    }));

    return { success: true, data: newQuiz };
  };

  const handleAddAssignment = (
    topicId: string | number,
    assignmentData: AssignmentLesson
  ): { success: boolean } => {
    setFormData((prevFormData) => {
      return {
        ...prevFormData,
        topics: prevFormData.topics.map((topic) => {
          if (topic.id === topicId) {
            const newAssignment: AssignmentLesson = {
              ...assignmentData,
              id: assignmentData.id || Date.now(),
              content_type: 'assignment',
            };

            // 통합 lessons 배열에서 관리
            const existingLessonIndex = topic.lessons.findIndex(
              (lesson) => lesson.id === assignmentData.id
            );

            if (existingLessonIndex !== -1) {
              // 기존 assignment 수정
              const updatedLessons = [...topic.lessons];
              updatedLessons[existingLessonIndex] = newAssignment;
              return {
                ...topic,
                lessons: updatedLessons,
              };
            } else {
              // 새 assignment 추가
              return {
                ...topic,
                lessons: [...topic.lessons, newAssignment],
              };
            }
          }
          return topic;
        }),
      };
    });

    return { success: true };
  };

  // 통합 lessons 배열에서 모든 content_type(video, quiz, assignment) 삭제 처리
  const handleDeleteContent = (
    topicId: string | number,
    contentId: string | number
  ) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('콘텐츠 삭제:', topicId, contentId);
    }
    setFormData({
      ...formData,
      topics: formData.topics.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              lessons: topic.lessons.filter(
                (lesson) => lesson.id !== contentId
              ),
            }
          : topic
      ),
    });
  };

  // 기존 함수명 유지 (하위 호환성)
  const handleDeleteLesson = handleDeleteContent;

  const handleEditLesson = (topicId: string | number, lesson: LessonData) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('레슨 편집:', topicId, lesson);
    }
    // 편집 모달 열기 로직 추가 필요
  };

  const handleUploadLesson = (
    topicId: string | number,
    lessonId: string | number
  ) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('레슨 업로드:', topicId, lessonId);
    }
    // 업로드 기능 구현 필요
  };
  return (
    <>
      {/* 자동 저장 상태 표시 */}
      {/* 자동저장 표시 - 미니멀 */}
      {(saveStatus === 'saved' || saveStatus === 'error') && (
        <div className="row mb-3">
          <div className="col-12 text-end">
            {saveStatus === 'saved' && (
              <span className="text-success">
                <i className="feather-check"></i>
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="badge bg-danger">
                <i className="feather-alert-circle me-1"></i>저장 실패
              </span>
            )}
          </div>
        </div>
      )}

      <div className="row g-5">
        <div className="col-lg-8">
          <div className="rbt-accordion-style rbt-accordion-01 rbt-accordion-06 accordion">
            <div className="accordion" id="tutionaccordionExamplea1">
              <div className="accordion-item card">
                <h2 className="accordion-header card-header" id="accOne">
                  <button
                    className="accordion-button"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#accCollapseOne"
                    aria-expanded="true"
                    aria-controls="accCollapseOne"
                  >
                    Course Info
                  </button>
                </h2>
                <div
                  id="accCollapseOne"
                  className="accordion-collapse collapse show"
                  aria-labelledby="accOne"
                  data-bs-parent="#tutionaccordionExamplea1"
                >
                  <div className="accordion-body card-body">
                    <InfoFormNew
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
                  data-bs-parent="#tutionaccordionExamplea1"
                >
                  <div className="accordion-body card-body rbt-course-field-wrapper rbt-default-form">
                    <div className="course-field mb--20">
                      <div className="rbt-modern-select bg-transparent height-45 mb--10">
                        <Select
                          instanceId="sortBySelect"
                          className="react-select"
                          classNamePrefix="react-select"
                          value={sortVideo}
                          onChange={(newValue: SingleValue<SelectOption>) =>
                            setSortByVideo(newValue!)
                          }
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
                        onChange={(e) =>
                          handleFormDataChange({
                            ...formData,
                            introVideoUrl: e.target.value,
                          })
                        }
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
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#accCollapseThree3"
                    aria-expanded="false"
                    aria-controls="accCollapseThree3"
                  >
                    Course Builder
                  </button>
                </h2>
                <div
                  id="accCollapseThree3"
                  className="accordion-collapse collapse"
                  aria-labelledby="accThree3"
                  data-bs-parent="#tutionaccordionExamplea12"
                >
                  <div className="accordion-body card-body">
                    {formData.topics.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-muted mb-3">
                          No topics added yet. Start by adding your first topic.
                        </p>
                      </div>
                    ) : (
                      formData.topics.map((topic) => (
                        <Lesson
                          key={topic.id}
                          handleFileChange={handleFileChange}
                          handleImportClick={handleImportClick}
                          fileInputRef={fileInputRef}
                          id={`accOne${topic.id}`}
                          target={`accCollapseOne${topic.id}`}
                          expanded={false}
                          text={topic.name}
                          topicData={topic}
                          onDeleteTopic={() => handleDeleteTopic(topic.id)}
                          onUpdateTopic={(data) =>
                            handleUpdateTopic(topic.id, data)
                          }
                          onAddLesson={(lessonData) =>
                            handleAddLesson(topic.id, lessonData)
                          }
                          onAddQuiz={(quizData) =>
                            handleAddQuiz(topic.id, quizData)
                          }
                          onAddAssignment={(assignmentData) =>
                            handleAddAssignment(topic.id, assignmentData)
                          }
                          onDeleteContent={handleDeleteContent}
                          onDeleteLesson={handleDeleteLesson}
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
                  data-bs-parent="#tutionaccordionExamplea1"
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
                                    checked={
                                      formData.certificateTemplate === 'none'
                                    }
                                    onChange={(e) =>
                                      handleFormDataChange({
                                        ...formData,
                                        certificateTemplate: e.target.value,
                                      })
                                    }
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
                                        checked={
                                          formData.certificateTemplate ===
                                          `template${index + 1}`
                                        }
                                        onChange={(e) =>
                                          handleFormDataChange({
                                            ...formData,
                                            certificateTemplate: e.target.value,
                                          })
                                        }
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
                                    checked={
                                      formData.certificateTemplate === 'none'
                                    }
                                    onChange={(e) =>
                                      handleFormDataChange({
                                        ...formData,
                                        certificateTemplate: e.target.value,
                                      })
                                    }
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
                                        checked={
                                          formData.certificateTemplate ===
                                          `template${index + 1}`
                                        }
                                        onChange={(e) =>
                                          handleFormDataChange({
                                            ...formData,
                                            certificateTemplate: e.target.value,
                                          })
                                        }
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
                        {isSubmitting
                          ? editMode
                            ? 'Updating Course...'
                            : 'Creating Course...'
                          : editMode
                            ? 'Update Course'
                            : 'Create Course'}
                      </span>
                      <span className="btn-icon">
                        <i
                          className={
                            isSubmitting
                              ? 'feather-loader'
                              : 'feather-arrow-right'
                          }
                        ></i>
                      </span>
                      <span className="btn-icon">
                        <i
                          className={
                            isSubmitting
                              ? 'feather-loader'
                              : 'feather-arrow-right'
                          }
                        ></i>
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
                  <div
                    className="accordion-item card"
                    style={{ boxShadow: 'none' }}
                  >
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
                      <div
                        className="accordion-body card-body"
                        style={{ borderTop: 'none' }}
                      >
                        <ul className="rbt-list-style-1">
                          <li>
                            <i className="feather-check"></i> Set the Course
                            Price option or make it free.
                          </li>
                          <li>
                            <i className="feather-check"></i> Standard size for
                            the course thumbnail is 700x430.
                          </li>
                          <li>
                            <i className="feather-check"></i> Video section
                            controls the course overview video.
                          </li>
                          <li>
                            <i className="feather-check"></i> Course Builder is
                            where you create & organize a course.
                          </li>
                          <li>
                            <i className="feather-check"></i> Add Topics in the
                            Course Builder section to create lessons, quizzes,
                            and assignments.
                          </li>
                          <li>
                            <i className="feather-check"></i> Prerequisites
                            refers to the fundamental courses to complete before
                            taking this particular course.
                          </li>
                          <li>
                            <i className="feather-check"></i> Information from
                            the Additional Data section shows up on the course
                            single page.
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
        <div
          className="position-fixed bottom-0 start-50 translate-middle-x mb-4"
          style={{ zIndex: 1000 }}
        >
          <div
            className="alert alert-warning alert-dismissible fade show"
            role="alert"
          >
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

      {/* 복구 모달 */}
      {showRecoveryModal && (
        <div className="rbt-modal-overlay" style={{ display: 'block' }}>
          <div className="rbt-modal-wrapper">
            <div className="rbt-modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="feather-clock me-2"></i>
                  임시 저장된 데이터 발견
                </h5>
              </div>
              <div className="modal-body">
                <p>이전에 작업하던 코스 데이터가 있습니다.</p>
                <p className="text-muted small">
                  마지막 저장:{' '}
                  {draftTimestamp
                    ? new Date(draftTimestamp).toLocaleString('ko-KR')
                    : '알 수 없음'}
                </p>
                <p>이전 작업을 복구하시겠습니까?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="rbt-btn btn-border btn-sm"
                  onClick={() => {
                    setShowRecoveryModal(false);
                    clearDraft(); // 무시하고 새로 시작
                  }}
                >
                  <span className="icon-reverse-wrapper">
                    <span className="btn-text">무시하고 새로 시작</span>
                  </span>
                </button>
                <button
                  type="button"
                  className="rbt-btn btn-gradient btn-sm"
                  onClick={() => {
                    recover(); // 데이터 복구
                    setShowRecoveryModal(false);
                  }}
                >
                  <span className="icon-reverse-wrapper">
                    <span className="btn-text">복구하기</span>
                    <span className="btn-icon">
                      <i className="feather-check"></i>
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .rbt-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rbt-modal-wrapper {
          max-width: 500px;
          width: 90%;
          margin: 0 auto;
        }

        .rbt-modal-content {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .modal-header {
          padding: 20px;
          border-bottom: 1px solid #e5e5e5;
        }

        .modal-body {
          padding: 20px;
        }

        .modal-footer {
          padding: 20px;
          border-top: 1px solid #e5e5e5;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        /* Dark mode - 프로젝트 테마 시스템 사용 */
        :global(html[data-theme='dark']) .rbt-modal-content {
          background: #1a1a1a;
          color: #e5e5e5;
        }

        :global(html[data-theme='dark']) .modal-header {
          border-color: #333;
          color: #ffffff;
        }

        :global(html[data-theme='dark']) .modal-body {
          color: #e5e5e5;
        }

        :global(html[data-theme='dark']) .modal-footer {
          border-color: #333;
        }
      `}</style>
    </>
  );
};

export default CreateCourse;
