"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";

import img from "../../../public/images/others/thumbnail-placeholder.svg";

const LessonModal = ({ modalId = "Lesson", onAddLesson, editingLesson, onEditComplete }) => {
  const fileInputRef = useRef(null);
  const [featureImagePreview, setFeatureImagePreview] = useState(null);
  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    videoSource: 'youtube',
    hours: 0,
    minutes: 0,
    seconds: 0,
    enablePreview: false,
    thumbnail: null
  });
  
  // 편집 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (editingLesson) {
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
        thumbnail: editingLesson.thumbnail || null
      });
      
      if (editingLesson.thumbnail) {
        setFeatureImagePreview(editingLesson.thumbnail);
      }
    }
  }, [editingLesson]);
  
  const handleSubmit = () => {
    if (lessonData.title.trim() && onAddLesson) {
      // Calculate total duration in seconds
      const totalDuration = (lessonData.hours * 3600) + (lessonData.minutes * 60) + lessonData.seconds;
      
      // Prepare lesson data with calculated duration
      const lessonToAdd = {
        ...lessonData,
        duration: totalDuration,
        thumbnail: featureImagePreview
      };
      
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
        thumbnail: null
      });
      setFeatureImagePreview(null);
      
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

  const handleImportClick = (e) => {
    e.preventDefault();
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    
    if (file) {
      // Validate file type - more flexible validation
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeatureImagePreview(reader.result);
      };
      reader.onerror = (error) => {
        alert('Error reading file. Please try again.');
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <>
      <div
        className="rbt-default-modal modal fade"
        id={modalId}
        tabIndex="-1"
        aria-labelledby={`${modalId}Label`}
        aria-hidden="true"
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
                        type="text"
                        value={lessonData.title}
                        onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
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
                        value={lessonData.description}
                        onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
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
                              name="lessonFeatureImage"
                              id="lessonFeatureImage"
                              type="file"
                              className="inputfile"
                              accept="image/*"
                              onChange={handleFileChange}
                            />
                            <Image
                              id="lessonFeatureImagePreview"
                              src={featureImagePreview || img}
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

                      <small>
                        <i className="feather-info"></i> <b>Size:</b> 700x430
                        pixels, <b>File Support:</b> JPG, JPEG, PNG, GIF, WEBP
                      </small>
                    </div>
                    <div className="course-field mb--20">
                      <h6>Video Source</h6>
                      <div className="rbt-modern-select bg-transparent height-45 w-100 mb--10">
                        <select 
                          className="w-100"
                          value={lessonData.videoSource}
                          onChange={(e) => setLessonData({ ...lessonData, videoSource: e.target.value })}
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
                        type="text"
                        placeholder="Enter video URL"
                        value={lessonData.videoUrl}
                        onChange={(e) => setLessonData({ ...lessonData, videoUrl: e.target.value })}
                      />
                      <small>
                        <i className="feather-info"></i> Add the URL of your lesson video from {lessonData.videoSource}.
                      </small>
                    </div>
                    <div className="course-field mb--15">
                      <label>Video playback time</label>
                      <div className="row row--15">
                        <div className="col-lg-4">
                          <input 
                            type="number" 
                            placeholder="00" 
                            min="0"
                            value={lessonData.hours}
                            onChange={(e) => setLessonData({ ...lessonData, hours: parseInt(e.target.value) || 0 })}
                          />
                          <small className="d-block mt_dec--5">
                            <i className="feather-info"></i> Hour.
                          </small>
                        </div>
                        <div className="col-lg-4">
                          <input 
                            type="number" 
                            placeholder="00" 
                            min="0"
                            max="59"
                            value={lessonData.minutes}
                            onChange={(e) => setLessonData({ ...lessonData, minutes: parseInt(e.target.value) || 0 })}
                          />
                          <small className="d-block mt_dec--5">
                            <i className="feather-info"></i> Minute.
                          </small>
                        </div>
                        <div className="col-lg-4">
                          <input 
                            type="number" 
                            placeholder="00" 
                            min="0"
                            max="59"
                            value={lessonData.seconds}
                            onChange={(e) => setLessonData({ ...lessonData, seconds: parseInt(e.target.value) || 0 })}
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
                          onClick={handleImportClick}
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
                        <input
                          type="file"
                          ref={fileInputRef}
                          style={{ display: "none" }}
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                    <div className="course-field mb--20">
                      <p className="rbt-checkbox-wrapper mb--5 d-flex">
                        <input
                          id="rbt-checkbox-11"
                          name="rbt-checkbox-11"
                          type="checkbox"
                          checked={lessonData.enablePreview}
                          onChange={(e) => setLessonData({ ...lessonData, enablePreview: e.target.checked })}
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
    </>
  );
};

export default LessonModal;
