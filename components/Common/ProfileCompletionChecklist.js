"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const ProfileCompletionChecklist = ({ userProfile }) => {
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [checklist, setChecklist] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    if (userProfile) {
      const items = [
        {
          id: 'username',
          label: 'Choose a username',
          completed: !!userProfile.username,
          required: true,
          link: '#', // Same page since we're already in settings
          icon: 'feather-user'
        },
        {
          id: 'phone',
          label: 'Verify phone number',
          completed: !!userProfile.is_phone_verified,
          required: false,
          link: '#',
          icon: 'feather-phone',
          badge: userProfile.is_phone_verified ? 'Verified' : 'Not verified'
        },
        {
          id: 'skill',
          label: 'Add your skill/occupation',
          completed: !!userProfile.skill_occupation,
          required: false,
          link: '#',
          icon: 'feather-briefcase'
        },
        {
          id: 'bio',
          label: 'Write a bio',
          completed: !!userProfile.bio,
          required: false,
          link: '#',
          icon: 'feather-file-text'
        },
        {
          id: 'photo',
          label: 'Upload profile photo',
          completed: !!userProfile.photo_url && userProfile.photo_url !== '/images/team/avatar.jpg',
          required: false,
          link: '#',
          icon: 'feather-camera'
        }
      ];

      setChecklist(items);

      // Calculate completion percentage
      const completedItems = items.filter(item => item.completed).length;
      const percentage = Math.round((completedItems / items.length) * 100);
      setCompletionPercentage(percentage);
    }
  }, [userProfile]);

  const incompleteCount = checklist.filter(item => !item.completed).length;

  // Always show full checklist view
  return (
    <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mb--30">
      <div className="content">
        <div className="row">
          <div className="col-lg-12">
            <div className="section-title" style={{ marginBottom: 0 }}>
              <h4 className="rbt-title-style-3">Profile Completion</h4>
            </div>
            <div className="rbt-profile-completion-wrapper">
              <div className="rbt-progress-style-1" style={{ marginBottom: isCollapsed ? '10px' : '20px' }}>
                <div className="single-progress">
                  <h6 className="title mb--10">
                    {completionPercentage === 100 
                      ? '🎉 Congratulations! Your profile is complete' 
                      : `Your profile is ${completionPercentage}% complete`}
                  </h6>
                  <div className="progress">
                    <div 
                      className="progress-bar wow fadeInLeft bg-gradient-primary" 
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  <span className="progress-number">{completionPercentage}%</span>
                </div>
                {incompleteCount > 0 && isCollapsed && (
                  <p className="text-muted small mt-2 mb-0">
                    {incompleteCount} {incompleteCount === 1 ? 'item' : 'items'} remaining
                  </p>
                )}
              </div>

              <div className="text-center" style={{ marginBottom: isCollapsed ? '0' : '20px' }}>
                <button
                  className="rbt-btn btn-sm btn-border radius-round-10"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  type="button"
                >
                  <span className="btn-text">
                    {isCollapsed ? 'View Details' : 'Hide Details'}
                  </span>
                  <i className={`feather ms-2 ${isCollapsed ? 'feather-chevron-down' : 'feather-chevron-up'}`}></i>
                </button>
              </div>

              <div 
                className="rbt-checklist"
                style={{
                  maxHeight: isCollapsed ? '0' : '1000px',
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease-in-out',
                  opacity: isCollapsed ? '0' : '1'
                }}
              >
                {checklist.map((item) => (
                  <div key={item.id} className="rbt-checklist-item">
                    <div className="d-flex align-items-center">
                      <div className={`rbt-checkbox ${item.completed ? 'checked' : ''}`}>
                        {item.completed ? (
                          <i className="feather-check text-success"></i>
                        ) : (
                          <i className="feather-circle text-muted"></i>
                        )}
                      </div>
                      <div className="ms-3">
                        <span className={item.completed ? 'text-decoration-line-through text-muted' : ''}>
                          {item.label}
                        </span>
                        {item.required && (
                          <span className="badge bg-danger ms-2">Required</span>
                        )}
                        {item.badge && (
                          <span className={`badge ms-2 ${item.completed ? 'bg-success' : 'bg-warning'}`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {userProfile && !userProfile.is_phone_verified && !isCollapsed && (
                <div className="alert alert-info mt--30" role="alert">
                  <div className="d-flex align-items-center">
                    <i className="feather-info me-2"></i>
                    <div>
                      <strong>Why verify your phone?</strong>
                      <p className="mb-0 small">
                        Phone verification enhances account security and enables features like SMS notifications 
                        for important updates and course announcements.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionChecklist;