'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Select, {
  components as SelectComponents,
  MultiValue as SelectMultiValue,
} from 'react-select';
import { sampleAssignmentsData } from '@/constants/sampleAssignmentsData';
import type { Assignment } from '@/types/assignment';

interface SelectOption {
  value: string;
  label: string;
}

interface AssignmentsProps {
  assignments?: Assignment[];
  error?: string | null;
  useDevData?: boolean;
}

const Assignments: React.FC<AssignmentsProps> = ({
  assignments = [],
  error = null,
  useDevData = false,
}) => {
  // Show error message if there's an error
  if (error) {
    console.error('Error loading assignments:', error);
  }
  const components = { ValueContainer, MultiValue };
  const [course, setCourses] = useState<
    SelectMultiValue<SelectOption> | SelectOption
  >({ value: '', label: '' });
  const [sortBy, setSortBy] = useState<SelectOption>({
    value: 'Default',
    label: 'Default',
  });
  const [sortByOffer, setSortByOffer] = useState<SelectOption>({
    value: 'Free',
    label: 'Free',
  });

  const courses: SelectOption[] = [
    { value: 'Web Design HTML', label: 'Web Design HTML' },
    { value: 'Graphic Photoshop', label: 'Graphic Photoshop' },
    { value: 'English Career', label: 'English Career' },
    { value: 'Spoken English Career', label: 'Spoken English Career' },
    { value: 'Art Painting Experts', label: 'Art Painting Experts' },
    { value: 'App Development Experts', label: 'App Development Experts' },
    { value: 'Web Application Experts', label: 'Web Application Experts' },
    { value: 'Php Development Experts', label: 'Php Development Experts' },
  ];

  const sortByOptions: SelectOption[] = [
    { value: 'Default', label: 'Default' },
    { value: 'Latest', label: 'Latest' },
    { value: 'Popularity', label: 'Popularity' },
    { value: 'Trending', label: 'Trending' },
    { value: 'Price: low to high', label: 'Price: low to high' },
    { value: 'Price: high to low', label: 'Price: high to low' },
  ];

  const sortByOffers: SelectOption[] = [
    { value: 'Free', label: 'Free' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Premium', label: 'Premium' },
  ];

  // Use sample data in development mode or if explicitly requested
  const [displayData, setDisplayData] = useState<Assignment[]>([]);

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
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil(
      (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

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

  // Get unique courses from displayData - can be used for dynamic course filtering
  // const uniqueCourses = [...new Set(displayData.map(a => a.course?.title))].filter(Boolean);
  // const dynamicCourses: SelectOption[] = uniqueCourses.map(title => ({
  //   value: title as string,
  //   label: title as string
  // }));

  const handleDeleteAssignment = (assignmentId: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Delete assignment:', assignmentId);
    }
    // TODO: Implement actual deletion logic
  };

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
                    onChange={(value) =>
                      setCourses(
                        value as SelectMultiValue<SelectOption> | SelectOption
                      )
                    }
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
                    onChange={(value) => setSortBy(value as SelectOption)}
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
                    onChange={(value) => setSortByOffer(value as SelectOption)}
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
                    <td colSpan={5} className="text-center">
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
                            href={`/instructor/courses/${assignment.course_id}/edit`}
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
                            href={`/instructor/courses/${assignment.course_id}/edit/assignment/${assignment.lesson_id}`}
                            title="Edit"
                          >
                            <i className="feather-edit pl--0"></i> Edit
                          </Link>
                          <button
                            className="rbt-btn btn-xs bg-color-danger-opacity radius-round color-danger"
                            title="Delete"
                            onClick={() =>
                              handleDeleteAssignment(assignment.id)
                            }
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

// Custom components for react-select
interface ValueContainerProps {
  children: React.ReactNode;
  getValue: () => readonly SelectOption[];
  hasValue: boolean;
  [key: string]: unknown; // For other props from react-select
}

const ValueContainer: React.FC<ValueContainerProps> = ({ 
  children, 
  getValue, 
  hasValue, 
  ...props 
}) => {
  const nbValues = getValue().length;
  if (!hasValue) {
    return (
      <SelectComponents.ValueContainer {...props} getValue={getValue} hasValue={hasValue}>
        {children}
      </SelectComponents.ValueContainer>
    );
  }
  return (
    <SelectComponents.ValueContainer {...props} getValue={getValue} hasValue={hasValue}>
      {`${nbValues} items selected`}
    </SelectComponents.ValueContainer>
  );
};

const MultiValue: React.FC = () => {
  return null; // Don't render individual value chips
};
