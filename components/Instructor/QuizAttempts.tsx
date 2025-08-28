'use client';

import React, { useState, useMemo } from 'react';
import Select, { SingleValue } from 'react-select';
import { sampleQuizAttemptsData } from '@/constants/sampleQuizAttemptsData';
import {
  QuizAttemptWithRelations,
  QuizAttemptsProps,
  SelectOption,
  FilterStatus,
  SortBy,
} from '@/types/quiz';

const QuizAttempts: React.FC<QuizAttemptsProps> = ({
  quizAttempts = [],
  error,
  useDevData = false,
}) => {
  // 개발 모드에서 샘플 데이터 사용 옵션
  const data: QuizAttemptWithRelations[] =
    useDevData && process.env.NODE_ENV === 'development'
      ? (sampleQuizAttemptsData as QuizAttemptWithRelations[])
      : quizAttempts;

  const actualQuizAttempts = data;

  // State with proper typing
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date_desc');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // 코스 옵션 추출
  const courseOptions = useMemo<SelectOption[]>(() => {
    const uniqueCourses = new Map<string, string>();
    actualQuizAttempts.forEach((attempt) => {
      const courseId = attempt?.course_id || attempt?.courses?.id;
      const courseTitle = attempt?.courses?.title || 'Unknown Course';
      if (courseId && !uniqueCourses.has(courseId)) {
        uniqueCourses.set(courseId, courseTitle);
      }
    });

    const options: SelectOption[] = [{ value: 'all', label: 'All Courses' }];
    uniqueCourses.forEach((title, id) => {
      options.push({ value: id, label: title });
    });
    return options;
  }, [actualQuizAttempts]);

  // 필터링 및 정렬된 데이터
  const filteredData = useMemo<QuizAttemptWithRelations[]>(() => {
    let filtered = [...actualQuizAttempts];

    // 코스 필터
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(
        (a) => (a?.course_id || a?.courses?.id) === selectedCourse
      );
    }

    // Pass/Fail 필터
    if (filterStatus === 'pass') {
      filtered = filtered.filter((a) => a.passed === true);
    } else if (filterStatus === 'fail') {
      filtered = filtered.filter((a) => a.passed === false);
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return (
            new Date(b.completed_at || b.created_at || 0).getTime() -
            new Date(a.completed_at || a.created_at || 0).getTime()
          );
        case 'date_asc':
          return (
            new Date(a.completed_at || a.created_at || 0).getTime() -
            new Date(b.completed_at || b.created_at || 0).getTime()
          );
        case 'score_desc':
          return (b.score || 0) - (a.score || 0);
        case 'score_asc':
          return (a.score || 0) - (b.score || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [actualQuizAttempts, selectedCourse, sortBy, filterStatus]);

  const sortOptions: SelectOption[] = [
    { value: 'date_desc', label: 'Latest First' },
    { value: 'date_asc', label: 'Oldest First' },
    { value: 'score_desc', label: 'Highest Score' },
    { value: 'score_asc', label: 'Lowest Score' },
  ];

  const statusOptions: SelectOption[] = [
    { value: 'all', label: 'All Results' },
    { value: 'pass', label: 'Pass Only' },
    { value: 'fail', label: 'Fail Only' },
  ];

  // Event handlers with proper typing
  const handleCourseChange = (option: SingleValue<SelectOption>) => {
    if (option) {
      setSelectedCourse(option.value);
    }
  };

  const handleSortChange = (option: SingleValue<SelectOption>) => {
    if (option) {
      setSortBy(option.value as SortBy);
    }
  };

  const handleFilterStatusChange = (option: SingleValue<SelectOption>) => {
    if (option) {
      setFilterStatus(option.value as FilterStatus);
    }
  };

  // 에러 처리
  if (error) {
    return (
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Quiz Attempts</h4>
          </div>
          <div className="alert alert-danger">
            Failed to load quiz attempts. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  // 빈 상태 처리 (개발 모드에서 샘플 데이터 사용 안내 추가)
  if (!actualQuizAttempts.length) {
    return (
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Quiz Attempts</h4>
          </div>
          <div className="text-center py-5">
            <p className="text-muted">
              No quiz attempts found for your courses.
            </p>
            {process.env.NODE_ENV === 'development' && !useDevData && (
              <p className="text-muted mt-3">
                <small>
                  💡 Tip: Pass <code>useDevData=true</code> prop to see sample
                  data in development mode.
                </small>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
      <div className="content">
        <div className="section-title">
          <h4 className="rbt-title-style-3">
            Quiz Attempts ({filteredData.length})
          </h4>
        </div>

        {/* 필터 섹션 */}
        <div className="rbt-dashboard-filter-wrapper">
          <div className="row g-5">
            <div className="col-lg-4">
              <div className="filter-select rbt-modern-select">
                <span className="select-label d-block">Course</span>
                <Select
                  instanceId="courseFilter"
                  className="react-select"
                  classNamePrefix="react-select"
                  value={courseOptions.find(
                    (opt) => opt.value === selectedCourse
                  )}
                  onChange={handleCourseChange}
                  options={courseOptions}
                />
              </div>
            </div>
            <div className="col-lg-4">
              <div className="filter-select rbt-modern-select">
                <span className="select-label d-block">Sort By</span>
                <Select
                  instanceId="sortBy"
                  className="react-select"
                  classNamePrefix="react-select"
                  value={sortOptions.find((opt) => opt.value === sortBy)}
                  onChange={handleSortChange}
                  options={sortOptions}
                />
              </div>
            </div>
            <div className="col-lg-4">
              <div className="filter-select rbt-modern-select">
                <span className="select-label d-block">Result</span>
                <Select
                  instanceId="filterStatus"
                  className="react-select"
                  classNamePrefix="react-select"
                  value={statusOptions.find(
                    (opt) => opt.value === filterStatus
                  )}
                  onChange={handleFilterStatusChange}
                  options={statusOptions}
                />
              </div>
            </div>
          </div>
        </div>

        <hr className="mt--30" />

        {/* 테이블 */}
        <div className="rbt-dashboard-table table-responsive mobile-table-750 mt--30">
          <table className="rbt-table table table-borderless">
            <thead>
              <tr>
                <th>Quiz Info</th>
                <th>Student</th>
                <th>Questions</th>
                <th>Score</th>
                <th>Total</th>
                <th>Result</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center">
                    No quiz attempts match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredData.map((attempt) => {
                  const date = new Date(
                    attempt.completed_at || attempt.created_at || ''
                  );
                  const formattedDate = date.toLocaleDateString();
                  const quizTitle = attempt?.lessons?.title || 'Untitled Quiz';
                  const courseTitle =
                    attempt?.courses?.title || 'Unknown Course';
                  const studentName = attempt?.user?.name || 'Unknown';
                  const studentEmail = attempt?.user?.email || '';

                  // Handle answers count - could be array or object
                  let questionsCount = 0;
                  if (Array.isArray(attempt?.answers)) {
                    questionsCount = attempt.answers.length;
                  } else if (
                    typeof attempt?.answers === 'object' &&
                    attempt?.answers !== null
                  ) {
                    questionsCount = Object.keys(attempt.answers).length;
                  }

                  const score = attempt?.score || 0;
                  const totalPoints = attempt?.total_points || 0;
                  const percentage =
                    totalPoints > 0
                      ? Math.round((score / totalPoints) * 100)
                      : 0;
                  const passed = attempt?.passed || false;

                  return (
                    <tr key={attempt.id}>
                      <th>
                        <p className="b3 mb--5">{formattedDate}</p>
                        <span className="h6 mb--5">{quizTitle}</span>
                        <p className="b3">Course: {courseTitle}</p>
                      </th>
                      <td>
                        <p className="b3">{studentName}</p>
                        <small className="text-muted">{studentEmail}</small>
                      </td>
                      <td>
                        <p className="b3">{questionsCount}</p>
                      </td>
                      <td>
                        <p className="b3">{score}</p>
                      </td>
                      <td>
                        <p className="b3">{totalPoints}</p>
                        <small className="text-muted">({percentage}%)</small>
                      </td>
                      <td>
                        <span
                          className={`rbt-badge-5 ${
                            passed
                              ? 'bg-color-success-opacity color-success'
                              : 'bg-color-danger-opacity color-danger'
                          }`}
                        >
                          {passed ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                      <td>
                        <div className="rbt-button-group justify-content-end">
                          <a
                            className="rbt-btn btn-xs bg-primary-opacity radius-round"
                            href="#"
                            title="View Details"
                          >
                            <i className="feather-eye pl--0" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuizAttempts;
