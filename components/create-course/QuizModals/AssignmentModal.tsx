'use client';

import React, { useState, useRef } from 'react';
import QuillWrapper from '../QuillWrapper';
import { sampleAssignmentData } from '@/constants/sampleAssignmentData';
import {
  saveAsTemplate,
  getMyTemplates,
  deleteTemplate,
  incrementTemplateUsage,
} from '@/app/lib/actions/assignmentTemplateActions';
import type { TemplateRow } from '@/app/lib/actions/assignmentTemplateActions';
import { toast } from '@/hooks/use-toast';
import type {
  AssignmentLesson,
  AttachmentData,
  TimeLimitData,
} from '@/types/create-course';

// Props interface
interface AssignmentModalProps {
  modalId?: string;
  onAddAssignment?: (
    data: AssignmentLesson
  ) => { success: boolean; error?: string } | void;
  editingAssignment?: AssignmentLesson | null;
  onEditComplete?: () => void;
}

// File validation result
interface FileValidation {
  valid: boolean;
  error?: string;
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({
  modalId = 'Assignment',
  onAddAssignment,
  editingAssignment,
  onEditComplete,
}) => {
  const [assignmentData, setAssignmentData] = useState<
    Partial<AssignmentLesson>
  >({
    title: '',
    summary: '',
    instructions: '',
    attachments: [],
    timeLimit: { value: 0, unit: 'weeks' },
    totalPoints: 100,
    passingPoints: 70,
    maxUploads: 1,
    maxFileSize: 10,
    content_type: 'assignment',
  });
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState<boolean>(false);
  const [myTemplates, setMyTemplates] = useState<TemplateRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local validateFile function (avoiding import issues)
  const validateFile = (file: File, maxSizeMB: number = 10): FileValidation => {
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

    if (!allowedExtensions.includes(fileExtension || '')) {
      return {
        valid: false,
        error:
          'File type not allowed. Allowed types: PDF, Word, PowerPoint, Excel, ZIP, Images',
      };
    }

    return { valid: true };
  };

  // File upload handlers
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const files = Array.from(e.target.files || []);

    // Validate file count
    if (
      (assignmentData.attachments || []).length + files.length >
      (assignmentData.maxUploads || 1)
    ) {
      alert(`Maximum ${assignmentData.maxUploads || 1} files allowed`);
      return;
    }

    // Validate and process files
    for (const file of files) {
      // Validate file
      const validation = validateFile(file, assignmentData.maxFileSize || 10);
      if (!validation.valid) {
        alert(`${file.name}: ${validation.error}`);
        continue;
      }

      // Create attachment object matching AttachmentData interface
      const newAttachment: AttachmentData = {
        id: Date.now() + Math.random(), // Temporary ID
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      };

      setAssignmentData((prev) => ({
        ...prev,
        attachments: [...(prev.attachments || []), newAttachment],
      }));
    }

    // Reset input
    e.target.value = '';
  };

  const removeFile = (index: number): void => {
    const newAttachments = [...(assignmentData.attachments || [])];
    newAttachments.splice(index, 1);
    setAssignmentData({
      ...assignmentData,
      attachments: newAttachments,
    });
  };

  // Load template handler
  const handleLoadTemplate = async (template: TemplateRow): Promise<void> => {
    const templateAttachments = (template.template_data?.attachments || []).map(
      (att: any) => ({
        ...att,
        id: att.id || Date.now() + Math.random(),
      })
    );

    const templateTimeLimit = template.template_data?.timeLimit || {
      value: 0,
      unit: 'weeks',
    };
    const validUnit = ['hours', 'days', 'weeks'].includes(
      templateTimeLimit.unit
    )
      ? templateTimeLimit.unit
      : 'weeks';

    setAssignmentData({
      title: template.name || '',
      summary: template.description || '',
      instructions: template.template_data?.instructions || '',
      timeLimit: {
        value: templateTimeLimit.value,
        unit: validUnit as 'hours' | 'days' | 'weeks',
      },
      totalPoints: template.template_data?.totalPoints || 100,
      passingPoints: template.template_data?.passingPoints || 70,
      maxUploads: template.template_data?.maxUploads || 1,
      maxFileSize: template.template_data?.maxFileSize || 10,
      attachments: templateAttachments,
      content_type: 'assignment',
    });

    setShowDropdown(false);

    // 사용 횟수 증가
    await incrementTemplateUsage(template.id);

    toast({
      title: 'Success',
      description: `Template "${template.name}" loaded`,
    });
  };

  // Delete template handler
  const handleDeleteTemplate = async (
    templateId: string,
    e: React.MouseEvent
  ): Promise<void> => {
    e.stopPropagation(); // 드롭다운 닫힘 방지

    if (!confirm('Delete this template?')) return;

    const result = await deleteTemplate(templateId);

    if (result.success) {
      setMyTemplates(myTemplates.filter((t) => t.id !== templateId));
      toast({
        description: 'Template deleted',
      });
    } else {
      toast({
        title: 'Error',
        description: result.message || 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };

  // Save as template handler
  const handleSaveAsTemplate = async (): Promise<void> => {
    const templateName = prompt('Enter template name:');
    if (!templateName) return;

    if (templateName.length > 100) {
      toast({
        title: 'Error',
        description: 'Template name must be less than 100 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsSavingTemplate(true);
    try {
      const templateData = {
        name: templateName,
        description: assignmentData.summary || '',
        template_data: {
          instructions: assignmentData.instructions || '',
          timeLimit: {
            value: assignmentData.timeLimit?.value || 0,
            unit: (assignmentData.timeLimit?.unit || 'weeks') as any,
          },
          totalPoints: assignmentData.totalPoints || 100,
          passingPoints: assignmentData.passingPoints || 70,
          maxUploads: assignmentData.maxUploads || 1,
          maxFileSize: assignmentData.maxFileSize || 10,
          attachments: (assignmentData.attachments || []).map((att) => ({
            name: att.name,
            url: att.url,
            size: att.size,
            type: att.type,
          })),
        },
      };

      const result = await saveAsTemplate(templateData);

      if (result.success) {
        // 템플릿 목록 새로고침
        const updatedTemplates = await getMyTemplates();
        if (updatedTemplates.success) {
          setMyTemplates(updatedTemplates.data || []);
        }

        toast({
          title: 'Success',
          description: `Template "${templateName}" saved successfully`,
        });
      } else {
        const errorMessage =
          result.code === 'DUPLICATE_TEMPLATE_NAME'
            ? 'A template with this name already exists'
            : result.message || 'Failed to save template';

        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // Load editing data when editingAssignment changes
  React.useEffect(() => {
    if (editingAssignment) {
      setAssignmentData({
        ...editingAssignment,
        // Ensure timeLimit has valid unit
        timeLimit: {
          value: editingAssignment.timeLimit.value,
          unit: (['hours', 'days', 'weeks'].includes(
            editingAssignment.timeLimit.unit
          )
            ? editingAssignment.timeLimit.unit
            : 'weeks') as 'hours' | 'days' | 'weeks',
        },
        attachments: editingAssignment.attachments || [],
      });
    } else {
      // Reset to initial state
      setAssignmentData({
        title: '',
        summary: '',
        instructions: '',
        attachments: [],
        timeLimit: { value: 0, unit: 'weeks' },
        totalPoints: 100,
        passingPoints: 70,
        maxUploads: 1,
        maxFileSize: 10,
        content_type: 'assignment',
      });
    }
  }, [editingAssignment]);

  // Load my templates on mount
  React.useEffect(() => {
    const loadTemplates = async (): Promise<void> => {
      const result = await getMyTemplates();
      if (result.success) {
        setMyTemplates(result.data || []);
      }
      // 에러는 조용히 무시 (instructor 아니면 빈 배열)
    };

    loadTemplates();
  }, []);

  // Close dropdown when clicking outside (only when dropdown is open)
  React.useEffect(() => {
    if (!showDropdown) return; // 드롭다운이 열려있지 않으면 리스너 불필요

    const handleClickOutside = (event: MouseEvent): void => {
      if (!(event.target as HTMLElement).closest('.dropdown')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleSubmit = async (): Promise<void> => {
    if (!assignmentData.title?.trim()) {
      alert('Please enter assignment title');
      return;
    }

    if (onAddAssignment) {
      // Ensure all required fields for AssignmentLesson are present
      const finalData: AssignmentLesson = {
        id: editingAssignment?.id || Date.now(), // Generate temp ID if new
        title: assignmentData.title || '',
        content_type: 'assignment',
        summary: assignmentData.summary || '',
        instructions: assignmentData.instructions || '',
        totalPoints: assignmentData.totalPoints || 100,
        passingPoints: assignmentData.passingPoints || 70,
        maxUploads: assignmentData.maxUploads || 1,
        maxFileSize: assignmentData.maxFileSize || 10,
        attachments: assignmentData.attachments || [],
        timeLimit: assignmentData.timeLimit || { value: 0, unit: 'weeks' },
      };

      const result = onAddAssignment(finalData);

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
          instructions: '',
          attachments: [],
          timeLimit: { value: 0, unit: 'weeks' },
          totalPoints: 100,
          passingPoints: 70,
          maxUploads: 1,
          maxFileSize: 10,
          content_type: 'assignment',
        });

        // Close modal using Bootstrap's data-bs-dismiss
        const closeButton = document.querySelector(
          `#${modalId} [data-bs-dismiss="modal"]`
        );
        if (closeButton) {
          (closeButton as HTMLButtonElement).click();
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
            (courseBuilderAccordion as HTMLButtonElement).click();
          }
        }, 300);
      } else {
        // Show error message if assignment save failed
        alert(result?.error || '과제 저장에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  return (
    <>
      <div
        className="rbt-default-modal modal fade"
        id={modalId}
        tabIndex={-1}
        aria-labelledby={`${modalId}Label`}
        aria-hidden="true"
        data-bs-focus="false"
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
                                {/* My Templates Section */}
                                {myTemplates.length > 0 && (
                                  <>
                                    <li>
                                      <h6 className="dropdown-header">
                                        My Templates
                                      </h6>
                                    </li>
                                    {myTemplates.map((template) => (
                                      <li key={template.id}>
                                        <a
                                          className="dropdown-item d-flex justify-content-between align-items-center"
                                          href="#"
                                          onClick={(
                                            e: React.MouseEvent<HTMLAnchorElement>
                                          ) => {
                                            e.preventDefault();
                                            handleLoadTemplate(template);
                                          }}
                                        >
                                          <span>{template.name}</span>
                                          <button
                                            className="btn btn-sm btn-link text-danger p-0"
                                            onClick={(e: React.MouseEvent) =>
                                              handleDeleteTemplate(
                                                template.id,
                                                e
                                              )
                                            }
                                            aria-label="Delete template"
                                          >
                                            <i className="feather-trash-2"></i>
                                          </button>
                                        </a>
                                      </li>
                                    ))}
                                    <li>
                                      <hr className="dropdown-divider" />
                                    </li>
                                  </>
                                )}

                                {/* Sample Data Section */}
                                <li>
                                  <h6 className="dropdown-header">
                                    Sample Data
                                  </h6>
                                </li>
                                <li>
                                  <a
                                    className="dropdown-item"
                                    href="#"
                                    onClick={(
                                      e: React.MouseEvent<HTMLAnchorElement>
                                    ) => {
                                      e.preventDefault();
                                      const sample = sampleAssignmentData.basic;
                                      setAssignmentData({
                                        ...assignmentData,
                                        title: sample.title,
                                        summary: sample.summary,
                                        timeLimit: {
                                          value: sample.timeLimit.value,
                                          unit: ([
                                            'hours',
                                            'days',
                                            'weeks',
                                          ].includes(sample.timeLimit.unit)
                                            ? sample.timeLimit.unit
                                            : 'weeks') as
                                            | 'hours'
                                            | 'days'
                                            | 'weeks',
                                        },
                                        totalPoints: sample.totalPoints,
                                        passingPoints: sample.passingPoints,
                                        maxUploads: sample.maxUploads,
                                        maxFileSize: sample.maxFileSize,
                                        attachments: [],
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
                                    onClick={(
                                      e: React.MouseEvent<HTMLAnchorElement>
                                    ) => {
                                      e.preventDefault();
                                      const sample =
                                        sampleAssignmentData.advanced;
                                      setAssignmentData({
                                        ...assignmentData,
                                        title: sample.title,
                                        summary: sample.summary,
                                        timeLimit: {
                                          value: sample.timeLimit.value,
                                          unit: ([
                                            'hours',
                                            'days',
                                            'weeks',
                                          ].includes(sample.timeLimit.unit)
                                            ? sample.timeLimit.unit
                                            : 'weeks') as
                                            | 'hours'
                                            | 'days'
                                            | 'weeks',
                                        },
                                        totalPoints: sample.totalPoints,
                                        passingPoints: sample.passingPoints,
                                        maxUploads: sample.maxUploads,
                                        maxFileSize: sample.maxFileSize,
                                        attachments: [],
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
                                    onClick={(
                                      e: React.MouseEvent<HTMLAnchorElement>
                                    ) => {
                                      e.preventDefault();
                                      const sample = sampleAssignmentData.quiz;
                                      setAssignmentData({
                                        ...assignmentData,
                                        title: sample.title,
                                        summary: sample.summary,
                                        timeLimit: {
                                          value: sample.timeLimit.value,
                                          unit: ([
                                            'hours',
                                            'days',
                                            'weeks',
                                          ].includes(sample.timeLimit.unit)
                                            ? sample.timeLimit.unit
                                            : 'weeks') as
                                            | 'hours'
                                            | 'days'
                                            | 'weeks',
                                        },
                                        totalPoints: sample.totalPoints,
                                        passingPoints: sample.passingPoints,
                                        maxUploads: sample.maxUploads,
                                        maxFileSize: sample.maxFileSize,
                                        attachments: [],
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
                                    onClick={(
                                      e: React.MouseEvent<HTMLAnchorElement>
                                    ) => {
                                      e.preventDefault();
                                      const sample =
                                        sampleAssignmentData.report;
                                      setAssignmentData({
                                        ...assignmentData,
                                        title: sample.title,
                                        summary: sample.summary,
                                        timeLimit: {
                                          value: sample.timeLimit.value,
                                          unit: ([
                                            'hours',
                                            'days',
                                            'weeks',
                                          ].includes(sample.timeLimit.unit)
                                            ? sample.timeLimit.unit
                                            : 'weeks') as
                                            | 'hours'
                                            | 'days'
                                            | 'weeks',
                                        },
                                        totalPoints: sample.totalPoints,
                                        passingPoints: sample.passingPoints,
                                        maxUploads: sample.maxUploads,
                                        maxFileSize: sample.maxFileSize,
                                        attachments: [],
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
                                    onClick={(
                                      e: React.MouseEvent<HTMLAnchorElement>
                                    ) => {
                                      e.preventDefault();
                                      const sample = sampleAssignmentData.group;
                                      setAssignmentData({
                                        ...assignmentData,
                                        title: sample.title,
                                        summary: sample.summary,
                                        timeLimit: {
                                          value: sample.timeLimit.value,
                                          unit: ([
                                            'hours',
                                            'days',
                                            'weeks',
                                          ].includes(sample.timeLimit.unit)
                                            ? sample.timeLimit.unit
                                            : 'weeks') as
                                            | 'hours'
                                            | 'days'
                                            | 'weeks',
                                        },
                                        totalPoints: sample.totalPoints,
                                        passingPoints: sample.passingPoints,
                                        maxUploads: sample.maxUploads,
                                        maxFileSize: sample.maxFileSize,
                                        attachments: [],
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
                                    onClick={(
                                      e: React.MouseEvent<HTMLAnchorElement>
                                    ) => {
                                      e.preventDefault();
                                      const sample =
                                        sampleAssignmentData.practice;
                                      setAssignmentData({
                                        ...assignmentData,
                                        title: sample.title,
                                        summary: sample.summary,
                                        timeLimit: {
                                          value: sample.timeLimit.value,
                                          unit: ([
                                            'hours',
                                            'days',
                                            'weeks',
                                          ].includes(sample.timeLimit.unit)
                                            ? sample.timeLimit.unit
                                            : 'weeks') as
                                            | 'hours'
                                            | 'days'
                                            | 'weeks',
                                        },
                                        totalPoints: sample.totalPoints,
                                        passingPoints: sample.passingPoints,
                                        maxUploads: sample.maxUploads,
                                        maxFileSize: sample.maxFileSize,
                                        attachments: [],
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
                          value={assignmentData.title || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setAssignmentData({
                              ...assignmentData,
                              title: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="course-field mb--30">
                        <label htmlFor="assignmentSummary">Summary</label>
                        <QuillWrapper
                          value={assignmentData.summary || ''}
                          onChange={(content) =>
                            setAssignmentData({
                              ...assignmentData,
                              summary: content,
                            })
                          }
                          placeholder="Enter assignment instructions..."
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
                        {(assignmentData.attachments || []).length > 0 && (
                          <div className="mt-3">
                            <small className="text-muted">
                              Uploaded Files:
                            </small>
                            <ul className="list-unstyled mt-2">
                              {(assignmentData.attachments || []).map(
                                (file, index) => (
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
                                )
                              )}
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
                              value={assignmentData.timeLimit?.value || 0}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) =>
                                setAssignmentData({
                                  ...assignmentData,
                                  timeLimit: {
                                    value: parseInt(e.target.value) || 0,
                                    unit:
                                      assignmentData.timeLimit?.unit || 'weeks',
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
                              value={assignmentData.timeLimit?.unit || 'weeks'}
                              onChange={(
                                e: React.ChangeEvent<HTMLSelectElement>
                              ) =>
                                setAssignmentData({
                                  ...assignmentData,
                                  timeLimit: {
                                    value: assignmentData.timeLimit?.value || 0,
                                    unit: e.target
                                      .value as TimeLimitData['unit'],
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
                              value={assignmentData.totalPoints || 0}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) =>
                                setAssignmentData({
                                  ...assignmentData,
                                  totalPoints: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div className="course-field mb--15">
                        <label>Passing Points</label>
                        <div className="row row--15">
                          <div className="col-lg-4">
                            <input
                              id="assignmentPassingPoints"
                              name="assignmentPassingPoints"
                              className="shadow-none"
                              type="number"
                              placeholder="0"
                              value={assignmentData.passingPoints || 0}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) =>
                                setAssignmentData({
                                  ...assignmentData,
                                  passingPoints: parseInt(e.target.value) || 0,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div className="course-field mb--15">
                        <label>Max Uploads</label>
                        <div className="row row--15">
                          <div className="col-lg-4">
                            <input
                              id="assignmentMaxUploads"
                              name="assignmentMaxUploads"
                              className="shadow-none"
                              type="number"
                              placeholder="1"
                              value={assignmentData.maxUploads || 1}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) =>
                                setAssignmentData({
                                  ...assignmentData,
                                  maxUploads: parseInt(e.target.value) || 1,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div className="course-field mb--15">
                        <label>Max File Size (MB)</label>
                        <div className="row row--15">
                          <div className="col-lg-4">
                            <input
                              id="assignmentMaxFileSize"
                              name="assignmentMaxFileSize"
                              className="shadow-none"
                              type="number"
                              placeholder="10"
                              value={assignmentData.maxFileSize || 10}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) =>
                                setAssignmentData({
                                  ...assignmentData,
                                  maxFileSize: parseInt(e.target.value) || 10,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer pt--20 pb--20 border-top-light">
              <button
                type="button"
                className="rbt-btn btn-border btn-md radius-round-10"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <div className="d-flex gap-2">
                {!editingAssignment && (
                  <button
                    type="button"
                    className="rbt-btn btn-border btn-md radius-round-10"
                    onClick={handleSaveAsTemplate}
                    disabled={isSavingTemplate || !assignmentData.title?.trim()}
                  >
                    <i className="feather-save me-2"></i>
                    {isSavingTemplate ? 'Saving...' : 'Save as Template'}
                  </button>
                )}
                <button
                  type="button"
                  className="rbt-btn btn-gradient btn-md"
                  onClick={handleSubmit}
                >
                  {editingAssignment ? 'Update Assignment' : 'Add Assignment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssignmentModal;
