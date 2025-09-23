'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { debugLog, trackError } from '@/app/lib/utils/debugHelper';
import { uploadLessonAttachmentDirect } from '@/app/lib/actions/uploadActions';

import img from '../../../public/images/others/thumbnail-placeholder.svg';

const LessonModal = ({
  modalId = 'Lesson',
  onAddLesson,
  editingLesson,
  onEditComplete,
}) => {
  const fileInputRef = useRef(null);
  const attachmentInputRef = useRef(null);
  // blob URL ref 제거 (data URL 사용으로 불필요)
  const [featureImagePreview, setFeatureImagePreview] = useState(null);
  const [featureImageUrl, setFeatureImageUrl] = useState(null);
  const [uploadingFeatureImage, setUploadingFeatureImage] = useState(false);
  const [featureImageError, setFeatureImageError] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentErrors, setAttachmentErrors] = useState([]);
  const [lessonData, setLessonData] = useState({
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

  // 편집 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (editingLesson) {
      console.log('[LessonModal.js] Editing lesson data received:', {
        id: editingLesson.id,
        title: editingLesson.title,
        hasThumbnail: !!editingLesson.thumbnail,
        thumbnailValue: editingLesson.thumbnail,
        hasAttachments: !!editingLesson.attachments,
        attachmentsCount: editingLesson.attachments?.length || 0,
        attachments: editingLesson.attachments,
      });

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
        enablePreview: editingLesson.enablePreview || false,
        thumbnail: editingLesson.thumbnail || null,
      });

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
      const lessonToAdd = {
        ...lessonData,
        duration: totalDuration,
        thumbnail: featureImageUrl || null, // URL만 저장
        attachments: attachments, // 추가
      };

      debugLog('LessonModal', 'handleSubmit', {
        isEditing: !!editingLesson,
        lessonTitle: lessonData.title,
        hasThumbnail: !!featureImagePreview,
        thumbnailUrl: featureImageUrl,
        hasAttachments: attachments.length > 0,
        attachmentCount: attachments.length,
        totalDuration: totalDuration,
        modalId: modalId,
      });

      console.log('[LessonModal.js] Submitting lesson with data:', {
        thumbnail: featureImageUrl || null,
        attachments: attachments,
      });

      if (editingLesson) {
        // 편집 모드: 기존 레슨 업데이트
        onAddLesson({ ...lessonToAdd, id: editingLesson.id });
      } else {
        // 추가 모드: 새 레슨 추가
        onAddLesson(lessonToAdd);
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

      // 편집 완료 콜백
      if (onEditComplete) {
        onEditComplete();
      }

      // Close modal
      const modal = document.getElementById(modalId);
      const modalInstance = window.bootstrap?.Modal?.getInstance(modal);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  };

  const handleFeatureImageClick = (e) => {
    e.preventDefault();
    debugLog('LessonModal', 'handleFeatureImageClick', {
      action: 'Feature image button clicked',
      modalId: modalId,
    });
    fileInputRef.current.click();
  };

  const handleAttachmentClick = (e) => {
    e.preventDefault();
    debugLog('LessonModal', 'handleAttachmentClick', {
      action: 'Opening file picker for attachments',
      modalId: modalId,
    });
    attachmentInputRef.current.click();
  };

  const handleAttachmentChange = async (event) => {
    const files = Array.from(event.target.files);

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

        const result = await uploadLessonAttachmentDirect(formData);

        if (result.success) {
          const newAttachment = {
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
        const errorInfo = {
          fileName: file.name,
          error: error.message,
          timestamp: new Date().toISOString(),
        };

        setAttachmentErrors((prev) => [...prev, errorInfo]);
        trackError('LessonModal.handleAttachmentChange', error, { file });
      }
    }

    setUploadingAttachment(false);
    // 입력 초기화
    event.target.value = '';
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];

    debugLog('LessonModal', 'handleFileChange', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      triggeredBy: 'featureImage',
    });

    if (file) {
      try {
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
        reader.onloadend = () => {
          setFeatureImagePreview(reader.result); // data:image/... 형식
          debugLog('LessonModal', 'featureImagePreview:set', {
            fileName: file.name,
            previewType: 'dataURL',
            previewLength: reader.result ? reader.result.length : 0,
          });
        };
        reader.readAsDataURL(file);

        // Upload to storage using FormData
        try {
          debugLog('LessonModal', 'featureImage:uploading', {
            fileName: file.name,
            fileSize: file.size,
          });

          const formData = new FormData();
          formData.append('file', file);
          formData.append('fileName', file.name);

          const result = await uploadLessonAttachmentDirect(formData);

          if (result.success) {
            setFeatureImageUrl(result.url);

            // 업로드 성공 시 preview를 null로 설정 (data URL은 자동 메모리 관리)
            setFeatureImagePreview(null);

            debugLog('LessonModal', 'featureImage:uploaded', {
              fileName: file.name,
              url: result.url,
            });
          } else {
            throw new Error(result.error || '업로드에 실패했습니다.');
          }
        } catch (uploadError) {
          trackError('LessonModal.handleFileChange:upload', uploadError, {
            file,
          });
          setFeatureImageError(
            uploadError.message ||
              '이미지 업로드에 실패했습니다. 다시 시도해주세요.'
          );
        } finally {
          setUploadingFeatureImage(false);
        }
      } catch (error) {
        trackError('LessonModal.handleFileChange', error, { file });
        setUploadingFeatureImage(false);
      }
    }
  };

  // Modal 초기화 함수
  const resetModal = useCallback(() => {
    debugLog('LessonModal', 'resetModal:start');

    // data URL은 자동으로 메모리 관리되므로 추가 cleanup 불필요

    // 상태 초기화
    setLessonData({
      title: '',
      description: '',
      contentType: 'video',
      videoSource: 'YouTube',
      videoUrl: '',
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
    setFeatureImagePreview(null);
    setFeatureImageUrl(null);
    setFeatureImageError(null);
    setAttachments([]);
    setAttachmentErrors([]);

    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = '';
    }

    debugLog('LessonModal', 'resetModal:complete');
  }, []);

  // Modal이 닫힐 때 cleanup
  useEffect(() => {
    const modalElement = document.getElementById(modalId);

    const handleModalHidden = () => {
      debugLog('LessonModal', 'modal:hidden');
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
        tabIndex="-1"
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
                          setLessonData({
                            ...lessonData,
                            title: e.target.value,
                          })
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
                      <textarea
                        id="lessonModalSummary"
                        name="lessonModalSummary"
                        value={lessonData.description}
                        onChange={(e) =>
                          setLessonData({
                            ...lessonData,
                            description: e.target.value,
                          })
                        }
                      ></textarea>
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
                            setLessonData({
                              ...lessonData,
                              videoSource: e.target.value,
                            })
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
                        onChange={(e) =>
                          setLessonData({
                            ...lessonData,
                            videoUrl: e.target.value,
                          })
                        }
                      />
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
                              setLessonData({
                                ...lessonData,
                                hours: parseInt(e.target.value) || 0,
                              })
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
                              setLessonData({
                                ...lessonData,
                                minutes: parseInt(e.target.value) || 0,
                              })
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
                              setLessonData({
                                ...lessonData,
                                seconds: parseInt(e.target.value) || 0,
                              })
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
                          id="rbt-checkbox-11"
                          name="rbt-checkbox-11"
                          type="checkbox"
                          checked={lessonData.enablePreview}
                          onChange={(e) =>
                            setLessonData({
                              ...lessonData,
                              enablePreview: e.target.checked,
                            })
                          }
                        />
                        <label htmlFor="rbt-checkbox-11">
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

      {/* 개발 모드 디버그 패널 */}
      {process.env.NODE_ENV === 'development' && (
        <div
          className="position-fixed bottom-0 end-0 m-3 p-3 bg-dark text-white rounded shadow"
          style={{
            fontSize: '12px',
            maxWidth: '300px',
            zIndex: 9999,
            opacity: 0.9,
          }}
        >
          <h6 className="text-warning mb-2 d-flex justify-content-between align-items-center">
            🔍 Attachment Debug
            <button
              className="btn btn-sm btn-link text-white p-0"
              onClick={() => {
                const logs = JSON.parse(
                  localStorage.getItem('attachmentDebugLogs') || '[]'
                );
                console.table(
                  logs.filter((log) => log.component === 'LessonModal')
                );
                alert('LessonModal logs printed to console');
              }}
            >
              <i className="feather-terminal"></i>
            </button>
          </h6>
          <div className="small">
            <div>📎 Attachments: {attachments.length}</div>
            <div>⏳ Uploading: {uploadingAttachment ? 'Yes' : 'No'}</div>
            <div>❌ Errors: {attachmentErrors.length}</div>
            <div>🆔 Modal ID: {modalId}</div>
          </div>
          {attachments.length > 0 && (
            <div className="mt-2">
              <small className="text-muted">Files:</small>
              {attachments.map((file, idx) => (
                <div
                  key={idx}
                  className="text-truncate"
                  style={{ fontSize: '10px' }}
                >
                  • {file.name}
                </div>
              ))}
            </div>
          )}
          <div className="mt-2 d-flex gap-1">
            <button
              className="btn btn-warning btn-sm py-0 px-1"
              onClick={() => window.attachmentDebug?.print()}
              style={{ fontSize: '10px' }}
            >
              All Logs
            </button>
            <button
              className="btn btn-danger btn-sm py-0 px-1"
              onClick={() => {
                window.attachmentDebug?.clearLogs();
                alert('Debug logs cleared');
              }}
              style={{ fontSize: '10px' }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default LessonModal;
