'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Select, { components } from 'react-select';
import {
  getInstructorAnnouncements,
  deleteAnnouncement,
} from '@/app/lib/actions/announcementActions';
import AnnouncementModal from '@/components/create-course/AnnouncementModal';

const Announcement = () => {
  const components = { ValueContainer, MultiValue };
  const [announcements, setAnnouncements] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

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
    { value: 'urgent', label: 'Urgent' },
    { value: 'important', label: 'Important' },
    { value: 'normal', label: 'Normal' },
  ];

  // Load announcements
  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const result = await getInstructorAnnouncements();
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

  // Handle delete
  const handleDelete = async (announcementId) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      const result = await deleteAnnouncement(announcementId);
      if (result.success) {
        loadAnnouncements();
      } else {
        alert('Failed to delete announcement');
      }
    }
  };

  // Handle edit
  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setShowModal(true);
  };

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
    if (priorityFilter.value !== 'all') {
      filtered = filtered.filter((a) => a.priority === priorityFilter.value);
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
      urgent: <span className="badge bg-danger">Urgent</span>,
      important: <span className="badge bg-warning">Important</span>,
      normal: <span className="badge bg-info">Normal</span>,
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
              <div className="row gy-5 align-items-end">
                <div className="col-lg-8">
                  <div className="inner">
                    <div className="content text-left">
                      <h5 className="mb--5">Notify your all students.</h5>
                      <p className="b3">Create Announcement</p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="call-to-btn text-start text-lg-end position-relative">
                    <button
                      className="rbt-btn btn-sm rbt-switch-btn rbt-switch-y"
                      onClick={() => {
                        setEditingAnnouncement(null);
                        setShowModal(true);
                      }}
                    >
                      <span data-text="Add New Announcement">
                        Add New Announcement
                      </span>
                    </button>
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
                  <span className="select-label d-block">Priority</span>
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
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAnnouncements.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4">
                        No announcements found. Click &quot;Add New
                        Announcement&quot; to create one.
                      </td>
                    </tr>
                  ) : (
                    filteredAnnouncements.map((announcement) => {
                      const dateInfo = formatDate(announcement.created_at);
                      return (
                        <tr key={announcement.id}>
                          <th>
                            <span className="h6 mb--5">{dateInfo.date}</span>
                            <p className="b3">{dateInfo.time}</p>
                          </th>
                          <td>
                            <span className="h6 mb--5">
                              {announcement.title}
                            </span>
                            <p className="b3">
                              Course:{' '}
                              {announcement.courses?.title ||
                                'General Announcement'}
                            </p>
                          </td>
                          <td>{getPriorityBadge(announcement.priority)}</td>
                          <td>
                            <div className="rbt-button-group justify-content-end">
                              <a
                                className="rbt-btn-link left-icon"
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleEdit(announcement);
                                }}
                                style={{ cursor: 'pointer' }}
                              >
                                <i className="feather-edit"></i> Edit
                              </a>
                              <a
                                className="rbt-btn-link left-icon"
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleDelete(announcement.id);
                                }}
                                style={{ cursor: 'pointer' }}
                              >
                                <i className="feather-trash-2"></i> Delete
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
          )}
        </div>
      </div>

      {/* Announcement Modal */}
      {showModal && (
        <AnnouncementModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingAnnouncement(null);
          }}
          announcement={editingAnnouncement}
          courses={courses}
          onSave={() => {
            setShowModal(false);
            setEditingAnnouncement(null);
            loadAnnouncements();
          }}
        />
      )}
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
