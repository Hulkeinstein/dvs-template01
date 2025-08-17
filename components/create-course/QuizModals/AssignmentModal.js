'use client';

import React, { useState, useRef } from 'react';
import { sampleAssignmentData } from '@/constants/sampleAssignmentData';
import TextEditorWrapper from '../TextEditorWrapper';

const AssignmentModal = ({
  modalId = 'Assignment',
  onAddAssignment,
  editingAssignment,
  onEditComplete,
}) => {
  const [content, setContent] = useState('');
  const [assignmentData, setAssignmentData] = useState({
    title: '',
    summary: '',
    attachments: [],
    timeLimit: { value: 0, unit: 'weeks' },
    totalPoints: 100,
    passingPoints: 70,
    maxUploads: 1,
    maxFileSize: 10,
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  // Local validateFile function (avoiding import issues)
  const validateFile = (file, maxSizeMB = 10) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`,
      };
    }

    // Allowed file types for assignments
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = [
      'pdf',
      'doc',
      'docx',
      'ppt',
      'pptx',
      'xls',
      'xlsx',
      'zip',
      'jpg',
      'jpeg',
      'png',
      'txt',
      'csv',
    ];

    if (!allowedExtensions.includes(fileExtension)) {
      return {
        valid: false,
        error:
          'File type not allowed. Allowed types: PDF, Word, PowerPoint, Excel, ZIP, Images',
      };
    }

    return { valid: true };
  };

  // File upload handlers
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);

    // Validate file count
    if (
      assignmentData.attachments.length + files.length >
      assignmentData.maxUploads
    ) {
      alert(`Maximum ${assignmentData.maxUploads} files allowed`);
      return;
    }

    // Validate and process files
    const uploadedFiles = [];
    for (const file of files) {
      // Validate file
      const validation = validateFile(file, assignmentData.maxFileSize);
      if (!validation.valid) {
        alert(`${file.name}: ${validation.error}`);
        continue;
      }

      // For now, store file info locally with preview URL
      // TODO: In production, implement actual upload to Supabase using Server Actions
      uploadedFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file), // Temporary URL for preview
      });
    }

    // Update state with new files
    if (uploadedFiles.length > 0) {
      setAssignmentData({
        ...assignmentData,
        attachments: [...assignmentData.attachments, ...uploadedFiles],
      });
    }

    // Reset input
    e.target.value = '';
  };

  const removeFile = (index) => {
    const newAttachments = [...assignmentData.attachments];
    newAttachments.splice(index, 1);
    setAssignmentData({
      ...assignmentData,
      attachments: newAttachments,
    });
  };

  // Load editing data when editingAssignment changes
  React.useEffect(() => {
    if (editingAssignment) {
      setAssignmentData({
        id: editingAssignment.id,
        title: editingAssignment.title || '',
        summary:
          editingAssignment.summary || editingAssignment.description || '',
        attachments: editingAssignment.attachments || [],
        timeLimit: editingAssignment.timeLimit || { value: 0, unit: 'weeks' },
        totalPoints: editingAssignment.totalPoints || 100,
        passingPoints: editingAssignment.passingPoints || 70,
        maxUploads: editingAssignment.maxUploads || 1,
        maxFileSize: editingAssignment.maxFileSize || 10,
      });
      setContent(
        editingAssignment.summary || editingAssignment.description || ''
      );
    }
  }, [editingAssignment]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.dropdown')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

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
                    <form action="#">
                      <h5 className="modal-title mb--20" id={`${modalId}Label`}>
                        {editingAssignment
                          ? 'Edit Assignment'
                          : 'Add Assignment'}
                      </h5>
                      {!editingAssignment && (
                        <div className="mb--20">
                          <div
                            className="dropdown position-relative"
                            style={{ display: 'inline-block' }}
                          >
                            <button
                              className="btn btn-sm btn-primary"
                              type="button"
                              onClick={() => setShowDropdown(!showDropdown)}
                            >
                              <i className="feather-download me-2"></i>
                              Load Sample Data
                              <i
                                className={`feather-chevron-${showDropdown ? 'up' : 'down'} ms-2`}
                              ></i>
                            </button>
                            {showDropdown && (
                              <ul
                                className="dropdown-menu show"
                                style={{
                                  position: 'absolute',
                                  top: '100%',
                                  left: 0,
                                  zIndex: 1051,
                                }}
                              >
                                <li>
                                  <a
                                    className="dropdown-item"
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const sample = sampleAssignmentData.basic;
                                      setAssignmentData({
                                        ...assignmentData,
                                        ...sample,
                                      });
                                      setShowDropdown(false);
                                    }}
                                  >
                                    Basic Project
                                  </a>
                                </li>
                                <li>
                                  <a
                                    className="dropdown-item"
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const sample =
                                        sampleAssignmentData.advanced;
                                      setAssignmentData({
                                        ...assignmentData,
                                        ...sample,
                                      });
                                      setShowDropdown(false);
                                    }}
                                  >
                                    Final Project
                                  </a>
                                </li>
                                <li>
                                  <a
                                    className="dropdown-item"
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const sample = sampleAssignmentData.quiz;
                                      setAssignmentData({
                                        ...assignmentData,
                                        ...sample,
                                      });
                                      setShowDropdown(false);
                                    }}
                                  >
                                    Coding Test
                                  </a>
                                </li>
                                <li>
                                  <a
                                    className="dropdown-item"
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const sample =
                                        sampleAssignmentData.report;
                                      setAssignmentData({
                                        ...assignmentData,
                                        ...sample,
                                      });
                                      setShowDropdown(false);
                                    }}
                                  >
                                    Research Report
                                  </a>
                                </li>
                                <li>
                                  <a
                                    className="dropdown-item"
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const sample = sampleAssignmentData.group;
                                      setAssignmentData({
                                        ...assignmentData,
                                        ...sample,
                                      });
                                      setShowDropdown(false);
                                    }}
                                  >
                                    Team Project
                                  </a>
                                </li>
                                <li>
                                  <a
                                    className="dropdown-item"
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const sample =
                                        sampleAssignmentData.practice;
                                      setAssignmentData({
                                        ...assignmentData,
                                        ...sample,
                                      });
                                      setShowDropdown(false);
                                    }}
                                  >
                                    CSS Practice
                                  </a>
                                </li>
                              </ul>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="course-field mb--20">
                        <label htmlFor="assignmentModalTitle">
                          Assignment Title
                        </label>
                        <input
                          id="assignmentModalTitle"
                          type="text"
                          placeholder="Assignments"
                          value={assignmentData.title}
                          onChange={(e) =>
                            setAssignmentData({
                              ...assignmentData,
                              title: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="course-field mb--30">
                        <label htmlFor="modal-field-3">Summary</label>
                        <TextEditorWrapper
                          ref={editorRef}
                          value={assignmentData.summary}
                          onChange={(newContent) =>
                            setAssignmentData({
                              ...assignmentData,
                              summary: newContent,
                            })
                          }
                        />
                      </div>
                      <div className="course-field mb--20">
                        <label>Upload Attachments</label>
                        <div className="rbt-create-course-btn text-center">
                          <button
                            type="button"
                            className="rbt-btn btn-gradient btn-sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <span className="icon">
                              <i className="feather-upload-cloud"></i>
                            </span>
                            <span>Upload Files</span>
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.jpg,.jpeg,.png"
                          />
                        </div>
                        {assignmentData.attachments.length > 0 && (
                          <div className="mt-3">
                            <small className="text-muted">
                              Uploaded Files:
                            </small>
                            <ul className="list-unstyled mt-2">
                              {assignmentData.attachments.map((file, index) => (
                                <li
                                  key={index}
                                  className="d-flex align-items-center mb-2"
                                >
                                  <i className="feather-file mr-2"></i>
                                  <span className="flex-grow-1">
                                    {file.name}
                                  </span>
                                  <button
                                    type="button"
                                    className="btn btn-sm"
                                    onClick={() => removeFile(index)}
                                  >
                                    <i className="feather-x text-danger"></i>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="course-field mb--15">
                        <label>Time Limit</label>
                        <div className="row row--15">
                          <div className="col-sm-6 col-lg-4">
                            <input
                              id="assignmentTimeLimit"
                              name="assignmentTimeLimit"
                              className="shadow-none"
                              type="number"
                              placeholder="00"
                              value={assignmentData.timeLimit.value}
                              onChange={(e) =>
                                setAssignmentData({
                                  ...assignmentData,
                                  timeLimit: {
                                    ...assignmentData.timeLimit,
                                    value: parseInt(e.target.value) || 0,
                                  },
                                })
                              }
                            />
                          </div>
                          <div className="col-sm-5 col-lg-4">
                            <select
                              id="assignmentTimeLimitUnit"
                              name="assignmentTimeLimitUnit"
                              className="w-75"
                              style={{ height: '50px' }}
                              value={assignmentData.timeLimit.unit}
                              onChange={(e) =>
                                setAssignmentData({
                                  ...assignmentData,
                                  timeLimit: {
                                    ...assignmentData.timeLimit,
                                    unit: e.target.value,
                                  },
                                })
                              }
                            >
                              <option value="weeks">Weeks</option>
                              <option value="days">Days</option>
                              <option value="hours">Hours</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="course-field mb--15">
                        <label>Total Points</label>
                        <div className="row row--15">
                          <div className="col-lg-4">
                            <input
                              id="assignmentTotalPoints"
                              name="assignmentTotalPoints"
                              className="shadow-none"
                              type="number"
                              placeholder="0"
                              value={assignmentData.totalPoints}
                              onChange={(e) =>
                                setAssignmentData({
                                  ...assignmentData,
                                  totalPoints: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                            <small>
                              <i className="feather-info pr--5"></i>
                              Maximum points a student can score
                            </small>
                          </div>
                        </div>
                      </div>
                      <div className="course-field mb--15">
                        <label>Minimum Pass Points</label>
                        <div className="row row--15">
                          <div className="col-lg-4">
                            <input
                              id="assignmentPassingPoints"
                              name="assignmentPassingPoints"
                              className="shadow-none"
                              type="number"
                              placeholder="0"
                              value={assignmentData.passingPoints}
                              onChange={(e) =>
                                setAssignmentData({
                                  ...assignmentData,
                                  passingPoints: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <small>
                            <i className="feather-info pr--5"></i>
                            Minimum points required for the student to pass this
                            assignment.
                          </small>
                        </div>
                      </div>
                      <div className="course-field mb--15">
                        <label>Allow to upload files</label>
                        <div className="row row--15">
                          <div className="col-lg-4">
                            <input
                              id="assignmentMaxUploads"
                              name="assignmentMaxUploads"
                              className="shadow-none"
                              type="number"
                              placeholder="0"
                              value={assignmentData.maxUploads}
                              onChange={(e) =>
                                setAssignmentData({
                                  ...assignmentData,
                                  maxUploads: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <small>
                            <i className="feather-info pr--5"></i>
                            Define the number of files that a student can upload
                            in this assignment. Input 0 to disable the option to
                            upload.
                          </small>
                        </div>
                      </div>
                      <div className="course-field mb--15">
                        <label>Maximum file size limit</label>
                        <div className="row row--15">
                          <div className="col-lg-4">
                            <input
                              id="assignmentMaxFileSize"
                              name="assignmentMaxFileSize"
                              className="shadow-none"
                              type="number"
                              placeholder="0"
                              value={assignmentData.maxFileSize}
                              onChange={(e) =>
                                setAssignmentData({
                                  ...assignmentData,
                                  maxFileSize: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                          <small>
                            <i className="feather-info pr--5"></i>
                            Define maximum file size attachment in MB
                          </small>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            <div className="top-circle-shape"></div>
            <div className="modal-footer pt--30 justify-content-between">
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
                onClick={() => {
                  if (assignmentData.title.trim() && onAddAssignment) {
                    const result = onAddAssignment(assignmentData);

                    // Check if assignment was successfully added
                    if (result && result.success) {
                      // If editing, call onEditComplete
                      if (editingAssignment && onEditComplete) {
                        onEditComplete();
                      }

                      // Reset form
                      setAssignmentData({
                        title: '',
                        summary: '',
                        attachments: [],
                        timeLimit: { value: 0, unit: 'weeks' },
                        totalPoints: 100,
                        passingPoints: 70,
                        maxUploads: 1,
                        maxFileSize: 10,
                      });
                      setContent('');

                      // Close modal using Bootstrap's data-bs-dismiss
                      const closeButton = document.querySelector(
                        `#${modalId} [data-bs-dismiss="modal"]`
                      );
                      if (closeButton) {
                        closeButton.click();
                      } else {
                        // Fallback: Try to get modal instance
                        const modal = document.getElementById(modalId);
                        if (modal && window.bootstrap?.Modal) {
                          const modalInstance =
                            window.bootstrap.Modal.getInstance(modal) ||
                            new window.bootstrap.Modal(modal);
                          if (modalInstance) {
                            modalInstance.hide();
                          }
                        }
                      }

                      // Open Course Builder accordion after modal closes
                      setTimeout(() => {
                        const courseBuilderAccordion =
                          document.querySelector('#headingTwo button');
                        if (
                          courseBuilderAccordion &&
                          courseBuilderAccordion.classList.contains('collapsed')
                        ) {
                          courseBuilderAccordion.click();
                        }
                      }, 300);
                    } else {
                      // Show error message if assignment save failed
                      alert(
                        result?.error ||
                          '과제 저장에 실패했습니다. 다시 시도해주세요.'
                      );
                    }
                  }
                }}
              >
                {editingAssignment ? 'Update Assignment' : 'Add Assignment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssignmentModal;
