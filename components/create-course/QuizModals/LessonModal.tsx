'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import QuillWrapper from '../QuillWrapper';
import { debugLog, trackError } from '@/app/lib/utils/debugHelper';
import { uploadLessonAttachmentDirect } from '@/app/lib/actions/uploadActions';
import type {
  LessonModalProps,
  VideoLesson,
  AttachmentData,
} from '@/types/create-course';

import img from '../../../public/images/others/thumbnail-placeholder.svg';
import { useDebouncedCallback } from 'use-debounce';
import { fetchYouTubeMetadata, checkYoutubeDuplicate } from '@/app/lib/actions/youtubeActions';
import { YouTubeContentData } from '@/types/youtube';
import { isValidYouTubeUrl } from '@/app/lib/utils/youtube';

// Internal state type for the lesson form
interface LessonFormData {
  title: string;
  description: string;
  videoUrl: string;
  videoSource: 'youtube' | 'vimeo' | 'external' | 'facebook' | 'twitter';
  hours: number;
  minutes: number;
  seconds: number;
  enablePreview: boolean;
  thumbnail: string | null;
  content_data?: any;
}

// Error info for attachment uploads
interface AttachmentError {
  fileName: string;
  error: string;
  timestamp: string;
}

// Upload result type
interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

// Extended VideoLesson for submission (includes is_preview)
interface LessonSubmitData extends Omit<VideoLesson, 'content_type' | 'id'> {
  is_preview: boolean;
  enablePreview?: boolean;
  id?: string | number;
}

const LessonModal = ({
  modalId = 'Lesson',
  onAddLesson,
  editingLesson,
  onEditComplete,
  courseId,
}: LessonModalProps & { courseId?: string }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const lastPickIdRef = useRef<number>(0); // Race condition 방지용 추가
  const [featureImagePreview, setFeatureImagePreview] = useState<string | null>(
    null
  );
  const [featureImageUrl, setFeatureImageUrl] = useState<string | null>(null);
  const [uploadingFeatureImage, setUploadingFeatureImage] =
    useState<boolean>(false);
  const [featureImageError, setFeatureImageError] = useState<string | null>(
    null
  );
  const [attachments, setAttachments] = useState<AttachmentData[]>([]);
  const [uploadingAttachment, setUploadingAttachment] =
    useState<boolean>(false);
  const [attachmentErrors, setAttachmentErrors] = useState<AttachmentError[]>(
    []
  );

  // YouTube specific states
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [youtubeMetadata, setYoutubeMetadata] = useState<YouTubeContentData | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const [lessonData, setLessonData] = useState<LessonFormData>({
    title: '',
    description: '',
    videoUrl: '',
    videoSource: 'youtube',
    hours: 0,
    minutes: 0,
    seconds: 0,
    enablePreview: false,
    thumbnail: null,
  });



  // Debounced metadata fetcher
  const handleYoutubeUrlChange = useDebouncedCallback(async (url: string) => {
    if (!isValidYouTubeUrl(url)) {
      setYoutubeMetadata(null);
      setMetadataError(null);
      setIsDuplicate(false);
      return;
    }

    setIsLoadingMetadata(true);
    setMetadataError(null);
    setIsDuplicate(false);

    try {
      // 1. Fetch Metadata
      const result = await fetchYouTubeMetadata(url);
      
      if (!result.success || !result.data) {
        setMetadataError(result.error || '메타데이터를 가져올 수 없습니다.');
        setYoutubeMetadata(null);
      } else {
        const data = result.data;
        setYoutubeMetadata(data);
        
        // Auto-fill fields if empty
        setLessonData(prev => ({
          ...prev,
          title: prev.title ? prev.title : data.original_title,
          // Thumbnail: if we have a valid URL, set it
          thumbnail: !prev.thumbnail && data.thumbnail_url ? data.thumbnail_url : prev.thumbnail,
        }));

        if (!featureImagePreview && data.thumbnail_url) {
           setFeatureImageUrl(data.thumbnail_url); // Set as implicit feature image
           setFeatureImagePreview(data.thumbnail_url);
        }

        // Auto-fill Duration if available (API Key present)
        if (data.duration_seconds && lessonData.hours === 0 && lessonData.minutes === 0 && lessonData.seconds === 0) {
           const h = Math.floor(data.duration_seconds / 3600);
           const m = Math.floor((data.duration_seconds % 3600) / 60);
           const s = data.duration_seconds % 60;
           setLessonData(prev => ({ ...prev, hours: h, minutes: m, seconds: s }));
        }

        // 2. Check Duplicate (if courseId is available)
        if (courseId) {
            const isDup = await checkYoutubeDuplicate(courseId, data.youtube_id);
            if (isDup) {
                setIsDuplicate(true);
            }
        }
      }
    } catch (error) {
      console.error(error);
      setMetadataError('오류가 발생했습니다.');
    } finally {
      setIsLoadingMetadata(false);
    }
  }, 600);

  // Wrapper for input change
  const onVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setLessonData(prev => ({ ...prev, videoUrl: url }));
    
    if (lessonData.videoSource === 'youtube') {
        handleYoutubeUrlChange(url);
    }
  };

  // 편집 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (editingLesson) {
      // 이미 CreateCourse.js에서 매핑된 데이터를 받음
      // is_preview → enablePreview 매핑이 이미 완료됨
      const duration = editingLesson.duration || 0;
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = duration % 60;

      setLessonData({
        title: editingLesson.title || '',
        description: editingLesson.description || '',
        videoUrl: editingLesson.videoUrl || '',
        videoSource: editingLesson.videoSource || 'youtube',
        hours: hours,
        minutes: minutes,
        seconds: seconds,
        enablePreview: Boolean(editingLesson.enablePreview),
        thumbnail: editingLesson.thumbnail || null,
        content_data: editingLesson.content_data,
      });

      // Load existing youtube metadata if present
      if (editingLesson.videoSource === 'youtube' && editingLesson.content_data?.youtube) {
          setYoutubeMetadata(editingLesson.content_data.youtube);
      }

      if (editingLesson.thumbnail) {
        // URL인 경우 그대로 사용, base64인 경우도 처리
        if (editingLesson.thumbnail.startsWith('http')) {
          setFeatureImageUrl(editingLesson.thumbnail);
          setFeatureImagePreview(editingLesson.thumbnail);
        } else {
          setFeatureImagePreview(editingLesson.thumbnail);
        }
      }

      // 기존 attachments 로드
      if (
        editingLesson.attachments &&
        Array.isArray(editingLesson.attachments)
      ) {
        setAttachments(editingLesson.attachments);
      }
    }
  }, [editingLesson]);

  const handleSubmit = () => {
    if (lessonData.title.trim() && onAddLesson) {
      // Calculate total duration in seconds
      const totalDuration =
        lessonData.hours * 3600 + lessonData.minutes * 60 + lessonData.seconds;

      // Prepare lesson data with calculated duration
      const lessonToSubmit: LessonSubmitData = {
        ...lessonData,
        duration: totalDuration,
        thumbnail: featureImageUrl || null,
        attachments: attachments,
        // enablePreview는 이미 lessonData에 있음
        // DB 저장 시 is_preview로 변환 필요
        is_preview: Boolean(lessonData.enablePreview),
        content_data: youtubeMetadata ? { youtube: youtubeMetadata } : lessonData.content_data,
      };

      // enablePreview 필드는 제거 (is_preview로 이미 변환됨)
      delete lessonToSubmit.enablePreview;

      debugLog('LessonModal', 'handleSubmit', {
        isEditing: !!editingLesson,
        lessonTitle: lessonData.title,
        enablePreview: lessonData.enablePreview,
        is_preview: lessonToSubmit.is_preview,
        hasThumbnail: !!featureImagePreview,
        thumbnailUrl: featureImageUrl,
        hasAttachments: attachments.length > 0,
        attachmentCount: attachments.length,
        totalDuration: totalDuration,
        modalId: modalId,
      });

      if (editingLesson) {
        // 편집 모드: 기존 레슨 업데이트
        onAddLesson({ ...lessonToSubmit, id: editingLesson.id } as VideoLesson);
      } else {
        // 추가 모드: 새 레슨 추가
        onAddLesson(lessonToSubmit as VideoLesson);
      }

      // Reset form
      setLessonData({
        title: '',
        description: '',
        videoUrl: '',
        videoSource: 'youtube',
        hours: 0,
        minutes: 0,
        seconds: 0,
        enablePreview: false,
        thumbnail: null,
      });
    setFeatureImagePreview(null);
    setFeatureImageUrl(null);
    setFeatureImageError(null);
    setAttachments([]);
    setAttachmentErrors([]);
    setYoutubeMetadata(null); // Reset metadata
    setMetadataError(null);
    setIsDuplicate(false);

      // 편집 완료 콜백
      if (onEditComplete) {
        onEditComplete();
      }

      // Close modal
      const modal = document.getElementById(modalId);
      const modalInstance = (window as any).bootstrap?.Modal?.getInstance(
        modal
      );
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  };

  const handleFeatureImageClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    e.preventDefault();
    debugLog('LessonModal', 'handleFeatureImageClick', {
      action: 'Feature image button clicked',
      modalId: modalId,
    });
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAttachmentClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    debugLog('LessonModal', 'handleAttachmentClick', {
      action: 'Opening file picker for attachments',
      modalId: modalId,
    });
    if (attachmentInputRef.current) {
      attachmentInputRef.current.click();
    }
  };

  const handleAttachmentChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);

    debugLog('LessonModal', 'handleAttachmentChange:start', {
      fileCount: files.length,
      files: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    });

    setAttachmentErrors([]); // 이전 에러 초기화
    setUploadingAttachment(true);

    const maxSize = 3 * 1024 * 1024; // 3MB

    for (const file of files) {
      try {
        // 파일 크기 체크
        if (file.size > maxSize) {
          throw new Error(
            `파일 크기가 너무 큽니다. 최대 ${maxSize / 1024 / 1024}MB까지 가능합니다.`
          );
        }

        debugLog('LessonModal', 'handleAttachmentChange:uploading', {
          fileName: file.name,
          fileSize: file.size,
        });

        // FormData로 업로드
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', file.name);

        const result = (await uploadLessonAttachmentDirect(
          formData
        )) as UploadResult;

        if (result.success && result.url) {
          const newAttachment: AttachmentData = {
            id: Date.now() + Math.random(),
            name: file.name,
            url: result.url,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
          };

          setAttachments((prev) => [...prev, newAttachment]);

          debugLog('LessonModal', 'handleAttachmentChange:success', {
            fileName: file.name,
            attachment: newAttachment,
          });
        } else {
          throw new Error(result.error || '업로드에 실패했습니다.');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '알 수 없는 오류';
        const errorInfo: AttachmentError = {
          fileName: file.name,
          error: errorMessage,
          timestamp: new Date().toISOString(),
        };

        setAttachmentErrors((prev) => [...prev, errorInfo]);
        trackError(
          'LessonModal',
          error instanceof Error ? error : new Error(errorMessage),
          { fileName: file.name }
        );
      }
    }

    setUploadingAttachment(false);
    // 입력 초기화
    event.target.value = '';
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Race condition 방지: 각 선택에 고유 ID 부여
    const pickId = ++lastPickIdRef.current;

    debugLog('LessonModal', 'handleFileChange', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      pickId: pickId,
    });

    // Validate file type with strict MIME checking
    const ALLOWED_TYPES = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    if (!ALLOWED_TYPES.includes(file.type)) {
      setFeatureImageError('JPG, PNG, GIF, WEBP 파일만 가능합니다.');
      event.target.value = ''; // 입력 초기화
      return;
    }

    // Validate file size (8MB limit)
    const MAX_SIZE = 8 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setFeatureImageError(`파일 크기는 최대 8MB까지 가능합니다.`);
      event.target.value = ''; // 입력 초기화
      return;
    }

    setUploadingFeatureImage(true);
    setFeatureImageError(null);

    // FileReader로 data URL 생성 (CSP 호환)
    const reader = new FileReader();

    reader.onloadend = async () => {
      // 다른 파일이 더 늦게 선택되었으면 중단
      if (pickId !== lastPickIdRef.current) {
        debugLog('LessonModal', 'handleFileChange:aborted', {
          pickId,
          currentPickId: lastPickIdRef.current,
        });
        return;
      }

      const dataUrl = reader.result as string; // data:image/... 형식
      setFeatureImagePreview(dataUrl);

      debugLog('LessonModal', 'featureImagePreview:set', {
        fileName: file.name,
        previewType: 'dataURL',
        previewLength: dataUrl ? dataUrl.length : 0,
        pickId: pickId,
      });

      // 서버에 업로드
      try {
        debugLog('LessonModal', 'featureImage:uploading', {
          fileName: file.name,
          fileSize: file.size,
          pickId: pickId,
        });

        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileName', file.name);

        const result = (await uploadLessonAttachmentDirect(
          formData
        )) as UploadResult;

        // 결과 검증
        if (!result?.success || !result?.url) {
          throw new Error(result?.error || '업로드에 실패했습니다.');
        }

        // 여전히 최신 선택인지 확인
        if (pickId !== lastPickIdRef.current) {
          debugLog('LessonModal', 'handleFileChange:upload-aborted', {
            pickId,
            currentPickId: lastPickIdRef.current,
          });
          return;
        }

        // 업로드 성공: 공개 URL로 전환
        setFeatureImageUrl(result.url);
        setFeatureImagePreview(null); // data URL 제거 (메모리 절약)

        debugLog('LessonModal', 'featureImage:uploaded', {
          fileName: file.name,
          url: result.url,
          pickId: pickId,
        });
      } catch (uploadError) {
        // 여전히 최신 선택인지 확인
        if (pickId === lastPickIdRef.current) {
          const errorMessage =
            uploadError instanceof Error
              ? uploadError.message
              : '이미지 업로드에 실패했습니다. 다시 시도해주세요.';
          trackError(
            'LessonModal',
            uploadError instanceof Error
              ? uploadError
              : new Error(errorMessage),
            {
              action: 'handleFileChange:upload',
              fileName: file.name,
              pickId: pickId,
            }
          );
          setFeatureImageError(errorMessage);
        }
      } finally {
        // 최신 선택일 때만 로딩 상태 해제
        if (pickId === lastPickIdRef.current) {
          setUploadingFeatureImage(false);
        }
      }
    };

    reader.onerror = () => {
      if (pickId === lastPickIdRef.current) {
        setFeatureImageError('파일을 읽을 수 없습니다. 다시 시도해주세요.');
        setUploadingFeatureImage(false);
      }
    };

    // FileReader로 파일 읽기 시작
    reader.readAsDataURL(file);
  };

  // Modal 초기화 함수
  const resetModal = useCallback(() => {
    debugLog('LessonModal', 'resetModal:start', {});

    // data URL은 자동으로 메모리 관리되므로 추가 cleanup 불필요

    // 상태 초기화
    setLessonData({
      title: '',
      description: '',
      videoUrl: '',
      videoSource: 'youtube',
      hours: 0,
      minutes: 0,
      seconds: 0,
      enablePreview: false, // enablePreview 초기화 추가
      thumbnail: null,
    });
    setFeatureImagePreview(null);
    setFeatureImageUrl(null);
    setFeatureImageError(null);
    setAttachments([]);
    setAttachmentErrors([]);

    // Race condition 방지 카운터 리셋
    lastPickIdRef.current = 0;

    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = '';
    }

    debugLog('LessonModal', 'resetModal:complete', {});
  }, []);

  // Modal이 닫힐 때 cleanup
  useEffect(() => {
    const modalElement = document.getElementById(modalId);

    const handleModalHidden = () => {
      debugLog('LessonModal', 'modal:hidden', {});
      // 편집 모드가 아닐 때만 초기화
      if (!editingLesson) {
        resetModal();
      }
    };

    if (modalElement) {
      modalElement.addEventListener('hidden.bs.modal', handleModalHidden);
    }

    // Cleanup
    return () => {
      if (modalElement) {
        modalElement.removeEventListener('hidden.bs.modal', handleModalHidden);
      }
      // data URL은 자동 메모리 관리
    };
  }, [modalId, editingLesson, resetModal]);

  return (
    <>
      <div
        className="rbt-default-modal modal fade"
        id={modalId}
        tabIndex={-1}
        aria-labelledby={`${modalId}Label`}
        aria-hidden="true"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <button
                type="button"
                className="rbt-round-btn"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="feather-x"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="inner rbt-default-form">
                <div className="row">
                  <div className="col-lg-12">
                    <h5 className="modal-title mb--20" id="LessonLabel">
                      {editingLesson ? 'Edit Lesson' : 'Add Lesson'}
                    </h5>
                    <div className="course-field mb--20">
                      <label htmlFor="lessonModalName">Lesson Name</label>
                      <input
                        id="lessonModalName"
                        name="lessonModalName"
                        type="text"
                        value={lessonData.title}
                        onChange={(e) =>
                          setLessonData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                      />
                      <small>
                        <i className="feather-info"></i> Lesson titles are
                        displayed publicly wherever required. Each Lesson may
                        contain one or more lessons, quiz and assignments.
                      </small>
                    </div>
                    <div className="course-field mb--20">
                      <label htmlFor="lessonModalSummary">Lesson Summary</label>
                      <QuillWrapper
                        value={lessonData.description}
                        onChange={(content) =>
                          setLessonData((prev) => ({
                            ...prev,
                            description: content,
                          }))
                        }
                        placeholder="Add a summary for this lesson..."
                      />
                      <small>
                        <i className="feather-info"></i> Add a summary of short
                        text to prepare students for the activities for the
                        Lesson. The text is shown on the course page beside the
                        tooltip beside the Lesson name.
                      </small>
                    </div>
                    <div className="course-field mb--20">
                      <h6>Feature Image</h6>
                      <div className="rbt-create-course-thumbnail upload-area">
                        <div className="upload-area">
                          <div
                            className="brows-file-wrapper"
                            data-black-overlay="9"
                          >
                            <input
                              ref={fileInputRef}
                              name="lessonFeatureImage"
                              id="lessonFeatureImage"
                              type="file"
                              className="inputfile"
                              accept="image/*"
                              onChange={handleFileChange}
                              style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                opacity: 0,
                                cursor: 'pointer',
                                zIndex: 11, // z-index를 label보다 높게 설정
                              }}
                            />
                            <Image
                              id="lessonFeatureImagePreview"
                              src={
                                featureImageUrl || featureImagePreview || img
                              }
                              width={797}
                              height={262}
                              alt="file image"
                              style={{ objectFit: 'cover' }}
                            />

                            <label
                              className="d-flex"
                              htmlFor="lessonFeatureImage"
                              onClick={(e) => {
                                e.preventDefault();
                                handleFeatureImageClick(e);
                              }}
                              style={{
                                cursor: 'pointer',
                                zIndex: 10, // input보다 낮게 설정
                              }}
                              title="No File Choosen"
                            >
                              <i className="feather-upload"></i>
                              <span className="text-center">Choose a File</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* 업로드 중 표시 */}
                      {uploadingFeatureImage && (
                        <div className="text-center mb-3">
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          <small>이미지 업로드 중...</small>
                        </div>
                      )}

                      {/* 에러 메시지 표시 */}
                      {featureImageError && (
                        <div className="alert alert-danger mt-2" role="alert">
                          <small>{featureImageError}</small>
                        </div>
                      )}

                      <small>
                        <i className="feather-info"></i> <b>권장 크기:</b>{' '}
                        700x430 픽셀, <b>파일 형식:</b> JPG, PNG, GIF, WEBP
                        (최대 3MB)
                      </small>
                    </div>
                    <div className="course-field mb--20">
                      <h6>Video Source</h6>
                      <div className="rbt-modern-select bg-transparent height-45 w-100 mb--10">
                        <select
                          id="lessonVideoSource"
                          name="lessonVideoSource"
                          className="w-100"
                          value={lessonData.videoSource}
                          onChange={(e) =>
                            setLessonData((prev) => ({
                              ...prev,
                              videoSource: e.target
                                .value as LessonFormData['videoSource'],
                            }))
                          }
                        >
                          <option value="youtube">Youtube</option>
                          <option value="vimeo">Vimeo</option>
                          <option value="external">External URL</option>
                          <option value="facebook">Facebook</option>
                          <option value="twitter">Twitter</option>
                        </select>
                      </div>
                    </div>
                    <div className="course-field mb--20">
                      <label htmlFor="lessonVideoUrl">Video URL</label>
                      <input
                        id="lessonVideoUrl"
                        name="lessonVideoUrl"
                        type="text"
                        placeholder="Enter video URL"
                        value={lessonData.videoUrl}
                        onChange={onVideoUrlChange}
                      />
                      {/* Status Indicators */}
                      {isLoadingMetadata && (
                        <div className="mt-2 text-info">
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            메타데이터 가져오는 중...
                        </div>
                      )}
                      
                      {isDuplicate && (
                        <div className="alert alert-warning mt-2">
                          <i className="feather-alert-triangle me-2"></i>
                          이미 이 코스에 등록된 영상입니다.
                        </div>
                      )}

                      {metadataError && (
                        <div className="alert alert-danger mt-2">
                          {metadataError}
                          <button 
                            className="btn btn-sm btn-outline-danger ms-2" 
                            onClick={(e) => {
                                e.preventDefault();
                                handleYoutubeUrlChange(lessonData.videoUrl);
                            }}
                          >
                            재시도
                          </button>
                        </div>
                      )}

                      {youtubeMetadata && (
                          <div className="mt-2 p-2 border rounded d-flex align-items-center bg-light">
                              <img src={youtubeMetadata.thumbnail_url} alt="Thumbnail" width="60" height="45" style={{objectFit: 'cover', marginRight: '10px'}} />
                              <div>
                                  <div className="fw-bold" style={{fontSize: '0.9rem'}}>{youtubeMetadata.original_title}</div>
                                  <div className="text-muted" style={{fontSize: '0.8rem'}}>{youtubeMetadata.channel_name} • {youtubeMetadata.duration_seconds ? `${Math.floor(youtubeMetadata.duration_seconds / 60)}분 ${youtubeMetadata.duration_seconds % 60}초` : '길이 정보 없음'}</div>
                              </div>
                          </div>
                      )}
                      <small>
                        <i className="feather-info"></i> Add the URL of your
                        lesson video from {lessonData.videoSource}.
                      </small>
                    </div>
                    <div className="course-field mb--15">
                      <label>Video playback time</label>
                      <div className="row row--15">
                        <div className="col-lg-4">
                          <input
                            id="lessonHours"
                            name="lessonHours"
                            type="number"
                            placeholder="00"
                            min="0"
                            value={lessonData.hours}
                            onChange={(e) =>
                              setLessonData((prev) => ({
                                ...prev,
                                hours: parseInt(e.target.value) || 0,
                              }))
                            }
                          />
                          <small className="d-block mt_dec--5">
                            <i className="feather-info"></i> Hour.
                          </small>
                        </div>
                        <div className="col-lg-4">
                          <input
                            id="lessonMinutes"
                            name="lessonMinutes"
                            type="number"
                            placeholder="00"
                            min="0"
                            max="59"
                            value={lessonData.minutes}
                            onChange={(e) =>
                              setLessonData((prev) => ({
                                ...prev,
                                minutes: parseInt(e.target.value) || 0,
                              }))
                            }
                          />
                          <small className="d-block mt_dec--5">
                            <i className="feather-info"></i> Minute.
                          </small>
                        </div>
                        <div className="col-lg-4">
                          <input
                            id="lessonSeconds"
                            name="lessonSeconds"
                            type="number"
                            placeholder="00"
                            min="0"
                            max="59"
                            value={lessonData.seconds}
                            onChange={(e) =>
                              setLessonData((prev) => ({
                                ...prev,
                                seconds: parseInt(e.target.value) || 0,
                              }))
                            }
                          />
                          <small className="d-block mt_dec--5">
                            <i className="feather-info"></i> Second.
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="course-field mb--20">
                      <h6>Upload exercise files to the Lesson</h6>
                      <div className="rbt-modern-select bg-transparent height-45 w-100 mb--10">
                        <button
                          className="rbt-btn btn-md btn-border hover-icon-reverse"
                          onClick={handleAttachmentClick}
                        >
                          <span className="icon-reverse-wrapper">
                            <span className="btn-text">Upload Attachments</span>
                            <span className="btn-icon">
                              <i className="feather-paperclip"></i>
                            </span>
                            <span className="btn-icon">
                              <i className="feather-paperclip"></i>
                            </span>
                          </span>
                        </button>
                        {/* Attachment 파일 input - 별도로 추가 */}
                        <input
                          type="file"
                          ref={attachmentInputRef}
                          multiple
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt,.jpg,.jpeg,.png,.gif,.webp,.bmp"
                          style={{ display: 'none' }}
                          onChange={handleAttachmentChange}
                        />
                      </div>

                      {/* 업로드 중 표시 */}
                      {uploadingAttachment && (
                        <div className="text-center mt-2">
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          <small>파일 업로드 중...</small>
                        </div>
                      )}

                      {/* 업로드된 파일 목록 */}
                      {attachments.length > 0 && (
                        <div className="mt-3">
                          <h6 className="mb-2">업로드된 파일:</h6>
                          <div className="uploaded-files-list">
                            {attachments.map((file) => (
                              <div
                                key={file.id}
                                className="d-flex align-items-center justify-content-between mb-2 p-2 bg-light rounded"
                              >
                                <div className="d-flex align-items-center">
                                  <i className="feather-file me-2"></i>
                                  <small
                                    className="text-truncate"
                                    style={{ maxWidth: '200px' }}
                                  >
                                    {file.name}
                                  </small>
                                  <small className="text-muted ms-2">
                                    ({(file.size / 1024).toFixed(1)} KB)
                                  </small>
                                </div>
                                <button
                                  className="btn btn-link btn-sm text-danger p-0 text-decoration-none"
                                  onClick={() => {
                                    setAttachments((prev) =>
                                      prev.filter((f) => f.id !== file.id)
                                    );
                                    debugLog(
                                      'LessonModal',
                                      'attachment:removed',
                                      { fileName: file.name }
                                    );
                                  }}
                                  title="파일 삭제"
                                >
                                  <i className="feather-x"></i>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 에러 표시 */}
                      {attachmentErrors.length > 0 && (
                        <div className="mt-2">
                          {attachmentErrors.map((e, idx) => (
                            <div key={idx}>
                              <small className="text-danger">
                                <i className="feather-alert-circle"></i>{' '}
                                {e.fileName}: {e.error}
                              </small>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="course-field mb--20">
                      <p className="rbt-checkbox-wrapper mb--5 d-flex">
                        <input
                          className="form-check-input"
                          id={`preview-checkbox-${modalId}`}
                          name={`preview-checkbox-${modalId}`}
                          type="checkbox"
                          checked={Boolean(lessonData?.enablePreview)}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setLessonData((prev) => ({
                              ...prev,
                              enablePreview: isChecked,
                            }));
                          }}
                        />
                        <label htmlFor={`preview-checkbox-${modalId}`}>
                          Enable Course Preview
                        </label>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="top-circle-shape"></div>
            <div className="modal-footer pt--30">
              <button
                type="button"
                className="rbt-btn btn-border btn-md radius-round-10"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="rbt-btn btn-gradient btn-md"
                onClick={handleSubmit}
                data-bs-dismiss="modal"
              >
                {editingLesson ? 'Update Lesson' : 'Add Lesson'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LessonModal;
