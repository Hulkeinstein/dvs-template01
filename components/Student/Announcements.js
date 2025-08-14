'use client';

import { useState, useEffect } from 'react';
import Select, { components } from 'react-select';
import { getStudentAnnouncements } from '@/app/lib/actions/announcementActions';

const Announcement = () => {
  const components = { ValueContainer, MultiValue };
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [sortBy, setSortBy] = useState({ value: 'latest', label: 'Latest' });
  const [priorityFilter, setPriorityFilter] = useState({
    value: 'all',
    label: 'All Priorities',
  });

  const sortByOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'priority', label: 'Priority' },
    { value: 'title', label: 'Title (A-Z)' },
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'urgent', label: 'Urgent Only' },
    { value: 'important', label: 'Important & Urgent' },
  ];

  // Load announcements
  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const result = await getStudentAnnouncements();
      if (result.success) {
        setAnnouncements(result.announcements);
        // Format courses for Select component
        const formattedCourses = result.courses.map((course) => ({
          value: course.id,
          label: course.title,
        }));
        setCourses(formattedCourses);
      }
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  // Filter and sort announcements
  const getFilteredAnnouncements = () => {
    let filtered = [...announcements];

    // Filter by courses
    if (selectedCourses.length > 0) {
      const selectedCourseIds = selectedCourses.map((c) => c.value);
      filtered = filtered.filter(
        (a) => a.course_id && selectedCourseIds.includes(a.course_id)
      );
    }

    // Filter by priority
    if (priorityFilter.value === 'urgent') {
      filtered = filtered.filter((a) => a.priority === 'urgent');
    } else if (priorityFilter.value === 'important') {
      filtered = filtered.filter(
        (a) => a.priority === 'urgent' || a.priority === 'important'
      );
    }

    // Sort
    switch (sortBy.value) {
      case 'oldest':
        filtered.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
        break;
      case 'priority':
        const priorityOrder = { urgent: 0, important: 1, normal: 2 };
        filtered.sort(
          (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
        );
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'latest':
      default:
        filtered.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
    }

    return filtered;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    };
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: <span className="badge bg-danger fs-5 px-4 py-2">Urgent</span>,
      important: (
        <span className="badge bg-warning fs-5 px-4 py-2">Important</span>
      ),
      normal: <span className="badge bg-info fs-5 px-4 py-2">Normal</span>,
    };
    return badges[priority] || null;
  };

  const filteredAnnouncements = getFilteredAnnouncements();

  return (
    <>
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Announcements</h4>
          </div>

          <div className="rbt-callto-action rbt-cta-default style-2">
            <div className="content-wrapper overflow-hidden pt--30 pb--30 bg-color-primary-opacity">
              <div className="row gy-5 align-items-center">
                <div className="col-lg-12">
                  <div className="inner">
                    <div className="content text-center">
                      <h5 className="mb--5">Course Announcements</h5>
                      <p className="b3">
                        Stay updated with the latest announcements from your
                        courses
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rbt-dashboard-filter-wrapper mt--60">
            <div className="row g-5">
              <div className="col-lg-6">
                <div className="filter-select rbt-modern-select">
                  <span className="select-label d-block">Courses</span>
                  <Select
                    instanceId="sortByAuthor"
                    className="react-select"
                    classNamePrefix="react-select"
                    value={selectedCourses}
                    onChange={setSelectedCourses}
                    options={courses}
                    closeMenuOnSelect={false}
                    isMulti
                    components={components}
                    placeholder="All Courses"
                  />
                </div>
              </div>
              <div className="col-lg-3">
                <div className="filter-select rbt-modern-select">
                  <span className="select-label d-block">Sort By</span>
                  <Select
                    instanceId="sortBySelect"
                    className="react-select"
                    classNamePrefix="react-select"
                    value={sortBy}
                    onChange={setSortBy}
                    options={sortByOptions}
                  />
                </div>
              </div>
              <div className="col-lg-3">
                <div className="filter-select rbt-modern-select">
                  <span className="select-label d-block">Priority Filter</span>
                  <Select
                    instanceId="prioritySelect"
                    className="react-select"
                    classNamePrefix="react-select"
                    value={priorityFilter}
                    onChange={setPriorityFilter}
                    options={priorityOptions}
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="mt--30" />

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="rbt-dashboard-table table-responsive mobile-table-750 mt--30">
              <table className="rbt-table table table-borderless">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Announcements</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAnnouncements.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center py-4">
                        No announcements available for your enrolled courses.
                      </td>
                    </tr>
                  ) : (
                    filteredAnnouncements.map((announcement) => {
                      const dateInfo = formatDate(announcement.created_at);
                      return (
                        <tr key={announcement.id}>
                          <th className="align-middle">
                            <span className="h6 mb--5">{dateInfo.date}</span>
                            <p className="b3">{dateInfo.time}</p>
                          </th>
                          <td className="align-middle">
                            <span className="h6 mb--5">
                              {announcement.title}
                            </span>
                            <p className="b3">
                              Course:{' '}
                              {announcement.courses?.title ||
                                'General Announcement'}
                            </p>
                            {/* Display content preview */}
                            <div
                              className="text-muted small mt-2"
                              dangerouslySetInnerHTML={{
                                __html:
                                  announcement.content?.substring(0, 150) +
                                  '...',
                              }}
                            />
                          </td>
                          <td className="align-middle">
                            {getPriorityBadge(announcement.priority)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Announcement;

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
