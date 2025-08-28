'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { EnrolledStudent, EnrollmentSummary, FilterStatus } from '@/types/enrollment';

interface EnrolledStudentsProps {
  data: EnrolledStudent[];
  summary: EnrollmentSummary;
}

const EnrolledStudents = ({ data, summary }: EnrolledStudentsProps) => {
  const [activeTab, setActiveTab] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter students based on active tab and search query
  const filteredStudents = useMemo(() => {
    let filtered = data;

    // Filter by tab status
    switch (activeTab) {
      case 'enrolled':
        filtered = data.filter(s => s.enrollment.progress === 0 && s.enrollment.status === 'active');
        break;
      case 'active':
        filtered = data.filter(s => s.enrollment.progress > 0 && s.enrollment.progress < 100 && s.enrollment.status === 'active');
        break;
      case 'completed':
        filtered = data.filter(s => s.enrollment.status === 'completed' || s.enrollment.progress === 100);
        break;
      // 'all' shows everything
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(student => {
        const studentName = student.student.name || 
                           `${student.student.first_name || ''} ${student.student.last_name || ''}`.trim() || 
                           student.student.username || 
                           'Unknown';
        const email = student.student.email.toLowerCase();
        const courseName = student.course.title.toLowerCase();
        
        return studentName.toLowerCase().includes(query) || 
               email.includes(query) || 
               courseName.includes(query);
      });
    }

    return filtered;
  }, [data, activeTab, searchQuery]);

  // Get display name for student
  const getStudentDisplayName = (student: EnrolledStudent['student']): string => {
    if (student.name) return student.name;
    if (student.first_name || student.last_name) {
      return `${student.first_name || ''} ${student.last_name || ''}`.trim();
    }
    if (student.username) return student.username;
    return student.email.split('@')[0]; // Use email prefix as fallback
  };

  // Get status badge class
  const getStatusBadgeClass = (enrollment: EnrolledStudent['enrollment']): string => {
    if (enrollment.status === 'dropped') return 'badge bg-danger';
    if (enrollment.status === 'completed' || enrollment.progress === 100) return 'badge bg-success';
    if (enrollment.progress > 0) return 'badge bg-primary';
    return 'badge bg-secondary';
  };

  // Get status label
  const getStatusLabel = (enrollment: EnrolledStudent['enrollment']): string => {
    if (enrollment.status === 'dropped') return 'Dropped';
    if (enrollment.status === 'completed' || enrollment.progress === 100) return 'Completed';
    if (enrollment.progress > 0) return 'In Progress';
    return 'Enrolled';
  };

  // Format date
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate days since enrollment
  const daysSinceEnrollment = (enrollmentDate: string): number => {
    const enrolled = new Date(enrollmentDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - enrolled.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <>
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title mb-4">
            <h4 className="rbt-title-style-3">Enrolled Students</h4>
            
            {/* Summary Statistics */}
            <div className="row mt-4 mb-4">
              <div className="col-md-3 col-6 mb-3">
                <div className="rbt-counterup variation-01 rbt-hover-03 rbt-border-dashed bg-color-white">
                  <div className="inner">
                    <div className="content">
                      <h3 className="counter"><span className="odometer">{summary.total}</span></h3>
                      <span className="subtitle">Total Students</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-6 mb-3">
                <div className="rbt-counterup variation-01 rbt-hover-03 rbt-border-dashed bg-color-white">
                  <div className="inner">
                    <div className="content">
                      <h3 className="counter"><span className="odometer">{summary.enrolled}</span></h3>
                      <span className="subtitle">Just Enrolled</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-6 mb-3">
                <div className="rbt-counterup variation-01 rbt-hover-03 rbt-border-dashed bg-color-white">
                  <div className="inner">
                    <div className="content">
                      <h3 className="counter"><span className="odometer">{summary.active}</span></h3>
                      <span className="subtitle">Active</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-6 mb-3">
                <div className="rbt-counterup variation-01 rbt-hover-03 rbt-border-dashed bg-color-white">
                  <div className="inner">
                    <div className="content">
                      <h3 className="counter"><span className="odometer">{summary.completed}</span></h3>
                      <span className="subtitle">Completed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="row mb-4">
            <div className="col-lg-6">
              <div className="rbt-form-group">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search by student name, email, or course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="advance-tab-button mb--30">
            <ul
              className="nav nav-tabs tab-button-style-2 justify-content-start"
              id="myTab-enrolled"
              role="tablist"
            >
              <li role="presentation">
                <button
                  className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                  type="button"
                >
                  <span className="title">All Students ({summary.total})</span>
                </button>
              </li>
              <li role="presentation">
                <button
                  className={`tab-button ${activeTab === 'enrolled' ? 'active' : ''}`}
                  onClick={() => setActiveTab('enrolled')}
                  type="button"
                >
                  <span className="title">Just Enrolled ({summary.enrolled})</span>
                </button>
              </li>
              <li role="presentation">
                <button
                  className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
                  onClick={() => setActiveTab('active')}
                  type="button"
                >
                  <span className="title">Active Students ({summary.active})</span>
                </button>
              </li>
              <li role="presentation">
                <button
                  className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
                  onClick={() => setActiveTab('completed')}
                  type="button"
                >
                  <span className="title">Completed ({summary.completed})</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Students List */}
          <div className="tab-content">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-5">
                <i className="feather-users" style={{ fontSize: '48px', color: '#ccc' }}></i>
                <p className="mt-3 text-muted">
                  {searchQuery 
                    ? `No students found matching "${searchQuery}"`
                    : `No ${activeTab === 'all' ? '' : activeTab} students found`}
                </p>
              </div>
            ) : (
              <div className="row g-5">
                {filteredStudents.map((student) => (
                  <div className="col-lg-6 col-md-12" key={student.enrollment.id}>
                    <div className="rbt-card variation-02 rbt-hover">
                      <div className="rbt-card-body">
                        <div className="d-flex align-items-start">
                          {/* Student Avatar */}
                          <div className="rbt-avatar me-3">
                            {student.student.avatar_url ? (
                              <Image
                                src={student.student.avatar_url}
                                alt={getStudentDisplayName(student.student)}
                                width={60}
                                height={60}
                                className="rounded-circle"
                              />
                            ) : (
                              <div 
                                className="rounded-circle d-flex align-items-center justify-content-center"
                                style={{ 
                                  width: '60px', 
                                  height: '60px', 
                                  backgroundColor: '#f0f0f0',
                                  fontSize: '24px',
                                  fontWeight: 'bold',
                                  color: '#666'
                                }}
                              >
                                {getStudentDisplayName(student.student).charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>

                          {/* Student Info */}
                          <div className="flex-grow-1">
                            <h5 className="title mb-2">
                              {getStudentDisplayName(student.student)}
                              <span className={`ms-2 ${getStatusBadgeClass(student.enrollment)}`}>
                                {getStatusLabel(student.enrollment)}
                              </span>
                            </h5>
                            
                            <p className="mb-1 text-muted">
                              <i className="feather-mail me-1"></i>
                              {student.student.email}
                            </p>
                            
                            {student.student.phone && (
                              <p className="mb-1 text-muted">
                                <i className="feather-phone me-1"></i>
                                {student.student.phone}
                              </p>
                            )}

                            {/* Course Info */}
                            <div className="mt-3 p-3 bg-light rounded">
                              <h6 className="mb-2">
                                <i className="feather-book me-1"></i>
                                {student.course.title}
                              </h6>
                              
                              {/* Progress Bar */}
                              <div className="rbt-progress-style-1 mt-2">
                                <div className="single-progress">
                                  <h6 className="title mb-2">Progress</h6>
                                  <div className="progress">
                                    <div
                                      className="progress-bar wow fadeInLeft bar-color-success"
                                      role="progressbar"
                                      style={{ width: `${student.enrollment.progress}%` }}
                                      aria-valuenow={student.enrollment.progress}
                                      aria-valuemin={0}
                                      aria-valuemax={100}
                                    />
                                    <span className="progress-label">{student.enrollment.progress}%</span>
                                  </div>
                                </div>
                              </div>

                              {/* Enrollment Details */}
                              <div className="row mt-3">
                                <div className="col-6">
                                  <small className="text-muted">Enrolled:</small>
                                  <p className="mb-0 small">{formatDate(student.enrollment.enrolled_at)}</p>
                                </div>
                                <div className="col-6">
                                  <small className="text-muted">Last Active:</small>
                                  <p className="mb-0 small">{formatDate(student.enrollment.last_accessed_at)}</p>
                                </div>
                              </div>

                              {/* Additional Stats */}
                              <div className="mt-2">
                                <small className="text-muted">
                                  Enrolled {daysSinceEnrollment(student.enrollment.enrolled_at)} days ago
                                </small>
                              </div>

                              {/* Certificate Status */}
                              {student.enrollment.certificate_issued_at && (
                                <div className="mt-2">
                                  <span className="badge bg-success">
                                    <i className="feather-award me-1"></i>
                                    Certificate Issued
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-3">
                              <Link 
                                href={`/instructor/student-progress/${student.enrollment.id}`}
                                className="btn btn-sm btn-outline-primary me-2"
                              >
                                <i className="feather-eye me-1"></i>
                                View Progress
                              </Link>
                              <button 
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => {
                                  // TODO: Implement messaging functionality
                                  console.log('Message student:', student.student.id);
                                }}
                              >
                                <i className="feather-message-circle me-1"></i>
                                Message
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default EnrolledStudents;