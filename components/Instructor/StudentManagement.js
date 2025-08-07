'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { getInstructorStudents } from '@/app/lib/actions/getInstructorStudents';
import Image from 'next/image';

const StudentManagement = () => {
  const { data: session } = useSession();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterToggle, setFilterToggle] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  // Filter states
  const [filters, setFilters] = useState({
    course: 'all',
    search: '',
    progress: 'all',
    lastActivity: 'all',
    sortBy: 'name',
  });

  useEffect(() => {
    const loadStudents = async () => {
      if (!session?.user?.id) return;

      try {
        const { students, courses } = await getInstructorStudents(
          session.user.id
        );
        setStudents(students);
        setCourses(courses);
      } catch (error) {
        console.error('Error loading students:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [session]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    handleFilterChange('search', e.target.value);
  };

  const clearFilters = () => {
    setFilters({
      course: 'all',
      search: '',
      progress: 'all',
      lastActivity: 'all',
      sortBy: 'name',
    });
    setCurrentPage(1);
  };

  // Filter logic
  const filteredStudents = students.filter((student) => {
    const matchesCourse =
      filters.course === 'all' || student.courseId === filters.course;
    const matchesSearch =
      student.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      student.email.toLowerCase().includes(filters.search.toLowerCase());

    // Progress filter
    let matchesProgress = true;
    if (filters.progress !== 'all') {
      const progress = student.progress || 0;
      switch (filters.progress) {
        case '0':
          matchesProgress = progress === 0;
          break;
        case '1-30':
          matchesProgress = progress >= 1 && progress <= 30;
          break;
        case '31-70':
          matchesProgress = progress >= 31 && progress <= 70;
          break;
        case '71-99':
          matchesProgress = progress >= 71 && progress <= 99;
          break;
        case '100':
          matchesProgress = progress === 100;
          break;
      }
    }

    // Last activity filter (simulated - in real app, you'd have lastActivityDate)
    let matchesActivity = true;
    if (filters.lastActivity !== 'all') {
      // For demo purposes, using enrolledAt as activity date
      const lastActivity = new Date(student.enrolledAt);
      const today = new Date();
      const daysDiff = Math.floor(
        (today - lastActivity) / (1000 * 60 * 60 * 24)
      );

      switch (filters.lastActivity) {
        case 'today':
          matchesActivity = daysDiff === 0;
          break;
        case 'week':
          matchesActivity = daysDiff <= 7;
          break;
        case 'month':
          matchesActivity = daysDiff <= 30;
          break;
        case 'inactive':
          matchesActivity = daysDiff > 30;
          break;
      }
    }

    return matchesCourse && matchesSearch && matchesProgress && matchesActivity;
  });

  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (filters.sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'progressLow':
        return (a.progress || 0) - (b.progress || 0);
      case 'progressHigh':
        return (b.progress || 0) - (a.progress || 0);
      case 'recentActivity':
        return new Date(b.enrolledAt) - new Date(a.enrolledAt);
      case 'joinDate':
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });

  const uniqueStudents = sortedStudents.reduce((acc, student) => {
    const existingStudent = acc.find((s) => s.id === student.id);
    if (existingStudent) {
      existingStudent.courses = existingStudent.courses || [];
      existingStudent.courses.push({
        id: student.courseId,
        title: student.courseTitle,
        progress: student.progress,
        enrolledAt: student.enrolledAt,
      });
    } else {
      acc.push({
        ...student,
        courses: [
          {
            id: student.courseId,
            title: student.courseTitle,
            progress: student.progress,
            enrolledAt: student.enrolledAt,
          },
        ],
      });
    }
    return acc;
  }, []);

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = uniqueStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );
  const totalPages = Math.ceil(uniqueStudents.length / studentsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Students</h4>
          </div>
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rbt-course-area">
        <div className="rbt-course-top-wrapper mt--10">
          <div className="row g-5 align-items-center">
            <div className="col-lg-5 col-md-12">
              <div className="rbt-sorting-list d-flex flex-wrap align-items-center">
                <div className="rbt-short-item">
                  <span className="course-index">
                    Showing {uniqueStudents.length} students
                  </span>
                </div>
              </div>
            </div>
            <div className="col-lg-7 col-md-12">
              <div className="rbt-sorting-list d-flex flex-wrap justify-content-start justify-content-lg-end">
                <div className="rbt-short-item">
                  <div className="rbt-search-style me-0">
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={filters.search}
                      onChange={handleSearch}
                    />
                    <button
                      type="submit"
                      className="rbt-search-btn rbt-round-btn"
                    >
                      <i className="feather-search"></i>
                    </button>
                  </div>
                </div>
                <div className="rbt-short-item">
                  <button
                    className="rbt-btn btn-sm btn-border radius-30 color-white"
                    onClick={() => setFilterToggle(!filterToggle)}
                  >
                    <span className="icon">
                      <i className="feather-filter"></i>
                    </span>
                    <span>Filters</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {filterToggle && (
            <div className="default-exp-wrapper mt--30">
              <div className="filter-inner">
                <div className="filter-select-option">
                  <div className="filter-select rbt-modern-select">
                    <label>Course</label>
                    <select
                      className="w-100"
                      value={filters.course}
                      onChange={(e) =>
                        handleFilterChange('course', e.target.value)
                      }
                    >
                      <option value="all">All Courses</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="filter-select-option">
                  <div className="filter-select rbt-modern-select">
                    <label>Progress</label>
                    <select
                      className="w-100"
                      value={filters.progress}
                      onChange={(e) =>
                        handleFilterChange('progress', e.target.value)
                      }
                    >
                      <option value="all">All Progress</option>
                      <option value="0">Not Started (0%)</option>
                      <option value="1-30">Beginning (1-30%)</option>
                      <option value="31-70">In Progress (31-70%)</option>
                      <option value="71-99">Almost Done (71-99%)</option>
                      <option value="100">Completed (100%)</option>
                    </select>
                  </div>
                </div>

                <div className="filter-select-option">
                  <div className="filter-select rbt-modern-select">
                    <label>Last Activity</label>
                    <select
                      className="w-100"
                      value={filters.lastActivity}
                      onChange={(e) =>
                        handleFilterChange('lastActivity', e.target.value)
                      }
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="inactive">Inactive (30+ days)</option>
                    </select>
                  </div>
                </div>

                <div className="filter-select-option">
                  <div className="filter-select rbt-modern-select">
                    <label>Sort By</label>
                    <select
                      className="w-100"
                      value={filters.sortBy}
                      onChange={(e) =>
                        handleFilterChange('sortBy', e.target.value)
                      }
                    >
                      <option value="name">Name (A-Z)</option>
                      <option value="progressLow">
                        Progress (Low to High)
                      </option>
                      <option value="progressHigh">
                        Progress (High to Low)
                      </option>
                      <option value="recentActivity">Recent Activity</option>
                      <option value="joinDate">Join Date</option>
                    </select>
                  </div>
                </div>

                <div className="filter-select-option">
                  <div className="filter-select">
                    <button
                      className="rbt-btn btn-sm btn-border radius-30"
                      onClick={clearFilters}
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mb--60 mt--30">
          <div className="content">
            <div className="rbt-dashboard-table table-responsive mobile-table-750">
              <table className="rbt-table table table-borderless">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Contact</th>
                    <th>Enrolled Courses</th>
                    <th>Progress</th>
                    <th>Join Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        No students found.
                      </td>
                    </tr>
                  ) : (
                    currentStudents.map((student) => (
                      <tr key={student.id}>
                        <td>
                          <div className="rbt-student-profile">
                            <div className="rbt-avatar-md">
                              <Image
                                src="/images/client/avatar-01.png"
                                alt={student.name}
                                width={40}
                                height={40}
                              />
                            </div>
                            <div className="rbt-student-info">
                              <h6 className="mb-1">{student.name}</h6>
                              <small className="text-muted">
                                {student.email}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="rbt-contact-info">
                            <span className="d-block">{student.phone}</span>
                            {student.phoneVerified && (
                              <small className="text-success">
                                <i className="feather-check-circle"></i>{' '}
                                Verified
                              </small>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="rbt-course-list">
                            {student.courses.map((course) => (
                              <span key={course.id} className="d-block mb-1">
                                {course.title}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          {student.courses.map((course) => (
                            <div
                              key={course.id}
                              className="rbt-progress-style-1 mb-2"
                            >
                              <div className="single-progress">
                                <h6 className="rbt-title-style-2 mb--10">
                                  {course.progress}%
                                </h6>
                                <div className="progress">
                                  <div
                                    className="progress-bar wow fadeInLeft bar-color-success"
                                    role="progressbar"
                                    style={{ width: `${course.progress}%` }}
                                    aria-valuenow={course.progress}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </td>
                        <td>
                          <span className="rbt-date">
                            {new Date(student.createdAt).toLocaleDateString(
                              'en-US',
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              }
                            )}
                          </span>
                        </td>
                        <td>
                          {student.profileComplete ? (
                            <span className="rbt-badge-5 bg-color-success-opacity color-success">
                              Active
                            </span>
                          ) : (
                            <span className="rbt-badge-5 bg-color-warning-opacity color-warning">
                              Incomplete
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="row mt--30">
                <div className="col-lg-12">
                  <nav>
                    <ul className="rbt-pagination">
                      <li className={currentPage === 1 ? 'disabled' : ''}>
                        <a
                          href="#"
                          aria-label="Previous"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) paginate(currentPage - 1);
                          }}
                        >
                          <i className="feather-chevron-left"></i>
                        </a>
                      </li>
                      {[...Array(totalPages)].map((_, index) => (
                        <li
                          key={index + 1}
                          className={currentPage === index + 1 ? 'active' : ''}
                        >
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              paginate(index + 1);
                            }}
                          >
                            {index + 1}
                          </a>
                        </li>
                      ))}
                      <li
                        className={currentPage === totalPages ? 'disabled' : ''}
                      >
                        <a
                          href="#"
                          aria-label="Next"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages)
                              paginate(currentPage + 1);
                          }}
                        >
                          <i className="feather-chevron-right"></i>
                        </a>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentManagement;
