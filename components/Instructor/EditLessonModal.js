"use client";

import { useState, useEffect } from "react";

const EditLessonModal = ({ isOpen, lesson, onClose, onSave }) => {
  const [lessonData, setLessonData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: ''
  });

  useEffect(() => {
    if (lesson) {
      setLessonData({
        title: lesson.title || '',
        description: lesson.description || '',
        videoUrl: lesson.video_url || '',
        duration: lesson.duration_minutes || ''
      });
    }
  }, [lesson]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!lessonData.title.trim()) {
      alert('Please enter a lesson title');
      return;
    }
    
    const updates = {
      title: lessonData.title,
      description: lessonData.description,
      video_url: lessonData.videoUrl,
      duration_minutes: parseInt(lessonData.duration) || 0
    };
    
    onSave(updates);
  };

  if (!isOpen || !lesson) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Lesson</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="lesson-title" className="form-label">Lesson Title *</label>
                <input
                  type="text"
                  className="form-control"
                  id="lesson-title"
                  placeholder="Enter lesson title"
                  value={lessonData.title}
                  onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="lesson-description" className="form-label">Description</label>
                <textarea
                  className="form-control"
                  id="lesson-description"
                  rows="3"
                  placeholder="Brief description of the lesson"
                  value={lessonData.description}
                  onChange={(e) => setLessonData({ ...lessonData, description: e.target.value })}
                ></textarea>
              </div>
              
              <div className="mb-3">
                <label htmlFor="lesson-video" className="form-label">Video URL</label>
                <input
                  type="url"
                  className="form-control"
                  id="lesson-video"
                  placeholder="https://example.com/video.mp4"
                  value={lessonData.videoUrl}
                  onChange={(e) => setLessonData({ ...lessonData, videoUrl: e.target.value })}
                />
                <small className="form-text text-muted">
                  Enter the URL of your lesson video (YouTube, Vimeo, or direct link)
                </small>
              </div>
              
              <div className="mb-3">
                <label htmlFor="lesson-duration" className="form-label">Duration (minutes)</label>
                <input
                  type="number"
                  className="form-control"
                  id="lesson-duration"
                  placeholder="30"
                  value={lessonData.duration}
                  onChange={(e) => setLessonData({ ...lessonData, duration: e.target.value })}
                  min="0"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="rbt-btn btn-border btn-sm" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="rbt-btn btn-gradient btn-sm">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditLessonModal;