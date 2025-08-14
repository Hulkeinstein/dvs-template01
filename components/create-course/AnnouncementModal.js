'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  createAnnouncement,
  updateAnnouncement,
} from '@/app/lib/actions/announcementActions';

// Dynamic import for Quill editor
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const AnnouncementModal = ({
  isOpen,
  onClose,
  announcement,
  courses,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    course_id: null,
    priority: 'normal',
    is_active: true,
  });

  // Quill editor modules
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  // Load announcement data for editing
  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || '',
        content: announcement.content || '',
        course_id: announcement.course_id || null,
        priority: announcement.priority || 'normal',
        is_active: announcement.is_active !== false,
      });
    } else {
      // Reset form for new announcement
      setFormData({
        title: '',
        content: '',
        course_id: null,
        priority: 'normal',
        is_active: true,
      });
    }
  }, [announcement]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!formData.content.trim()) {
      alert('Please enter announcement content');
      return;
    }

    setLoading(true);

    try {
      let result;
      if (announcement) {
        // Update existing announcement
        result = await updateAnnouncement(announcement.id, formData);
      } else {
        // Create new announcement
        result = await createAnnouncement(formData);
      }

      if (result.success) {
        onSave();
      } else {
        alert(result.error || 'Failed to save announcement');
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      alert('An error occurred while saving the announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        className="modal fade show d-block"
        style={{ zIndex: 1050 }}
        tabIndex="-1"
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered"
          style={{ marginTop: '100px' }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {announcement ? 'Edit Announcement' : 'Create New Announcement'}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={loading}
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Title */}
                <div className="mb-5">
                  <label className="form-label">
                    Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter announcement title"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Course Selection */}
                <div className="mb-5">
                  <label className="form-label">Course (Optional)</label>
                  <select
                    className="form-select form-select-lg"
                    value={formData.course_id || ''}
                    onChange={(e) =>
                      handleInputChange('course_id', e.target.value || null)
                    }
                    disabled={loading}
                    style={{ fontSize: '16px' }}
                  >
                    <option value="">General Announcement (All Courses)</option>
                    {courses.map((course) => (
                      <option key={course.value} value={course.value}>
                        {course.label}
                      </option>
                    ))}
                  </select>
                  <small className="text-muted">
                    Leave empty to send to all students across all courses
                  </small>
                </div>

                {/* Priority */}
                <div className="mb-5">
                  <label className="form-label">Priority</label>
                  <div className="d-flex gap-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="priority"
                        id="priorityNormal"
                        value="normal"
                        checked={formData.priority === 'normal'}
                        onChange={(e) =>
                          handleInputChange('priority', e.target.value)
                        }
                        disabled={loading}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="priorityNormal"
                      >
                        <span className="badge bg-info">Normal</span>
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="priority"
                        id="priorityImportant"
                        value="important"
                        checked={formData.priority === 'important'}
                        onChange={(e) =>
                          handleInputChange('priority', e.target.value)
                        }
                        disabled={loading}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="priorityImportant"
                      >
                        <span className="badge bg-warning">Important</span>
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="priority"
                        id="priorityUrgent"
                        value="urgent"
                        checked={formData.priority === 'urgent'}
                        onChange={(e) =>
                          handleInputChange('priority', e.target.value)
                        }
                        disabled={loading}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="priorityUrgent"
                      >
                        <span className="badge bg-danger">Urgent</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-5">
                  <label className="form-label">
                    Content <span className="text-danger">*</span>
                  </label>
                  <ReactQuill
                    theme="snow"
                    value={formData.content}
                    onChange={(value) => handleInputChange('content', value)}
                    modules={modules}
                    style={{ height: '350px' }}
                    readOnly={loading}
                  />
                  <div style={{ marginBottom: '80px' }}></div>
                </div>

                {/* Active Status */}
                <div className="mb-5">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isActive"
                      checked={formData.is_active}
                      onChange={(e) =>
                        handleInputChange('is_active', e.target.checked)
                      }
                      disabled={loading}
                    />
                    <label className="form-check-label" htmlFor="isActive">
                      Active (visible to students)
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="rbt-btn btn-md btn-border"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rbt-btn btn-md btn-gradient"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Saving...
                    </>
                  ) : announcement ? (
                    'Update Announcement'
                  ) : (
                    'Create Announcement'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnnouncementModal;
