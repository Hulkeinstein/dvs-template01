'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Select, { components } from 'react-select';
import { sampleAssignmentsData } from '@/constants/sampleAssignmentsData';
import { ROUTES } from '@/app/lib/constants/routes';

const Assignments = ({
  assignments = [],
  error = null,
  useDevData = false,
}) => {
  const components = { ValueContainer, MultiValue };
  const [course, setCourses] = useState({ value: '', label: '' });
  const [sortBy, setSortBy] = useState({ value: 'Default', label: 'Default' });
  const [sortByOffer, setSortByOffer] = useState({
    value: 'Free',
    label: 'Free',
  });

  const courses = [
    { value: 'Web Design HTML', label: 'Web Design HTML' },
    { value: 'Graphic Photoshop', label: 'Graphic Photoshop' },
    { value: 'English Career', label: 'English Career' },
    { value: 'Spoken English Career', label: 'Spoken English Career' },
    { value: 'Art Painting Experts', label: 'Art Painting Experts' },
    { value: 'App Development Experts', label: 'App Development Experts' },
    { value: 'Web Application Experts', label: 'Web Application Experts' },
    { value: 'Php Development Experts', label: 'Php Development Experts' },
  ];

  const sortByOptions = [
    { value: 'Default', label: 'Default' },
    { value: 'Latest', label: 'Latest' },
    { value: 'Popularity', label: 'Popularity' },
    { value: 'Trending', label: 'Trending' },
    { value: 'Price: low to high', label: 'Price: low to high' },
    { value: 'Price: high to low', label: 'Price: high to low' },
  ];

  const sortByOffers = [
    { value: 'Free', label: 'Free' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Premium', label: 'Premium' },
  ];

  // Use sample data in development mode or if explicitly requested
  const [displayData, setDisplayData] = useState([]);

  useEffect(() => {
    if (
      process.env.NODE_ENV === 'development' &&
      useDevData &&
      assignments.length === 0
    ) {
      setDisplayData(sampleAssignmentsData);
    } else {
      setDisplayData(assignments);
    }
  }, [assignments, useDevData]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Past due (${Math.abs(diffDays)} days ago)`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  // Get unique courses from displayData
  const uniqueCourses = [
    ...new Set(displayData.map((a) => a.course?.title)),
  ].filter(Boolean);
  const dynamicCourses = uniqueCourses.map((title) => ({
    value: title,
    label: title,
  }));

  return (
    <>
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Assignments</h4>
          </div>

          <div className="rbt-dashboard-filter-wrapper">
            <div className="row g-5">
              <div className="col-lg-6">
                <div className="filter-select rbt-modern-select">
                  <span className="select-label d-block">Courses</span>
                  <Select
                    instanceId="sortByAuthor"
                    className="react-select"
                    classNamePrefix="react-select"
                    defaultValue={course}
                    onChange={setCourses}
                    options={courses}
                    closeMenuOnSelect={true}
                    isMulti
                    components={components}
                  />
                </div>
              </div>
              <div className="col-lg-3">
                <div className="filter-select rbt-modern-select">
                  <span className="select-label d-block">Short By</span>
                  <Select
                    instanceId="sortBySelect"
                    className="react-select"
                    classNamePrefix="react-select"
                    defaultValue={sortBy}
                    onChange={setSortBy}
                    options={sortByOptions}
                  />
                </div>
              </div>
              <div className="col-lg-3">
                <div className="filter-select rbt-modern-select">
                  <span className="select-label d-block">Short By Offer</span>
                  <Select
                    instanceId="sortBySelect"
                    className="react-select"
                    classNamePrefix="react-select"
                    defaultValue={sortByOffer}
                    onChange={setSortByOffer}
                    options={sortByOffers}
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="mt--30" />

          <div className="rbt-dashboard-table table-responsive mobile-table-750 mt--30">
            <table className="rbt-table table table-borderless">
              <thead>
                <tr>
                  <th>Assignment Name</th>
                  <th>Total Marks</th>
                  <th>Total Submit</th>
                  <th>Due Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {displayData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      <p className="b3">No assignments found</p>
                    </td>
                  </tr>
                ) : (
                  displayData.map((assignment) => (
                    <tr key={assignment.id}>
                      <th>
                        <span className="h6 mb--5">{assignment.title}</span>
                        <p className="b3">
                          Course:{' '}
                          <Link
                            href={ROUTES.INSTRUCTOR.EDIT_COURSE(
                              assignment.course_id
                            )}
                          >
                            {assignment.course?.title || 'Unknown Course'}
                          </Link>
                        </p>
                        {assignment.topic && (
                          <p className="b3 text-muted">
                            Topic: {assignment.topic.title}
                          </p>
                        )}
                      </th>
                      <td>
                        <p className="b3">{assignment.total_points}</p>
                        <small className="text-muted">
                          Pass: {assignment.passing_points}
                        </small>
                      </td>
                      <td>
                        <p className="b3">{assignment.submissions_count}</p>
                      </td>
                      <td>
                        <p
                          className={`b3 ${assignment.due_date && new Date(assignment.due_date) < new Date() ? 'text-danger' : ''}`}
                        >
                          {formatDate(assignment.due_date)}
                        </p>
                      </td>
                      <td>
                        <div className="rbt-button-group justify-content-end">
                          <Link
                            className="rbt-btn btn-xs bg-primary-opacity radius-round"
                            href={ROUTES.INSTRUCTOR.EDIT_ASSIGNMENT(
                              assignment.course_id,
                              assignment.lesson_id
                            )}
                            title="Edit"
                          >
                            <i className="feather-edit pl--0"></i> Edit
                          </Link>
                          <button
                            className="rbt-btn btn-xs bg-color-danger-opacity radius-round color-danger"
                            title="Delete"
                            onClick={() => {
                              if (process.env.NODE_ENV === 'development') {
                                console.log(
                                  'Delete assignment:',
                                  assignment.id
                                );
                              }
                            }}
                          >
                            <i className="feather-trash-2 pl--0"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Assignments;

const ValueContainer = ({ children, ...props }) => {
  const { getValue, hasValue } = props;
  const nbValues = getValue().length;
  if (!hasValue) {
    return (
      <components.ValueContainer {...props}>
        {children}
      </components.ValueContainer>
    );
  }
  return (
    <components.ValueContainer {...props}>
      {`${nbValues} items selected`}
    </components.ValueContainer>
  );
};

const MultiValue = (props) => {
  return '3 Selected';
};
