'use client';

import React, { useEffect, useState } from 'react';
import ProfileCompletionChecklist from '@/components/Common/ProfileCompletionChecklist';
import EditProfileLink from '@/components/shared/EditProfileLink';

// Database User type - matches Supabase schema exactly
interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  created_at: string | null;
  phone: string | null;
  is_phone_verified?: boolean;
  skill_occupation: string | null;
  bio: string | null;
  role: string | null;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  photo_url?: string | null;
  avatar_url?: string | null;
  facebook_url?: string | null;
  twitter_url?: string | null;
  instagram_url?: string | null;
  linkedin_url?: string | null;
  website_url?: string | null;
  github_url?: string | null;
}

interface SocialLink {
  name: string;
  url: string | null | undefined;
  icon: string;
}

const Profile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Format date utility function
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Extract display name with priority: first/last → username → name → email
  const getDisplayName = (): { firstName: string; lastName: string } => {
    if (!userProfile) {
      return { firstName: 'N/A', lastName: 'N/A' };
    }

    // Priority 1: Use explicit first_name and last_name if available
    if (userProfile.first_name || userProfile.last_name) {
      return {
        firstName: userProfile.first_name || 'N/A',
        lastName: userProfile.last_name || 'N/A',
      };
    }

    // Priority 2: Parse from name field
    if (userProfile.name) {
      const nameParts = userProfile.name.split(' ');
      return {
        firstName: nameParts[0] || 'N/A',
        lastName: nameParts.slice(1).join(' ') || 'N/A',
      };
    }

    // Priority 3: Use username as first name
    if (userProfile.username) {
      return {
        firstName: userProfile.username,
        lastName: 'N/A',
      };
    }

    // Priority 4: Use email as last resort
    const emailName = userProfile.email.split('@')[0];
    return {
      firstName: emailName,
      lastName: 'N/A',
    };
  };

  // Prepare social links data
  const getSocialLinks = (): SocialLink[] => {
    if (!userProfile) return [];

    const links: SocialLink[] = [
      {
        name: 'Facebook',
        url: userProfile.facebook_url,
        icon: 'feather-facebook',
      },
      { name: 'X', url: userProfile.twitter_url, icon: 'fab fa-x-twitter' },
      {
        name: 'Instagram',
        url: userProfile.instagram_url,
        icon: 'feather-instagram',
      },
      {
        name: 'LinkedIn',
        url: userProfile.linkedin_url,
        icon: 'feather-linkedin',
      },
      { name: 'Website', url: userProfile.website_url, icon: 'feather-globe' },
      { name: 'GitHub', url: userProfile.github_url, icon: 'feather-github' },
    ];

    return links.filter((link) => link.url);
  };

  if (loading) {
    return (
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use default values if no user profile
  const userData: UserProfile = userProfile || {
    id: '',
    name: 'N/A',
    email: 'N/A',
    created_at: null,
    phone: null,
    skill_occupation: null,
    bio: null,
    role: 'student',
  };

  const { firstName, lastName } = getDisplayName();
  const socialLinks = getSocialLinks();

  return (
    <>
      {/* Profile Completion Checklist - Moved from Settings */}
      {userProfile && (
        <div className="mb-4">
          <ProfileCompletionChecklist userProfile={userProfile} />
        </div>
      )}

      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title d-flex justify-content-between align-items-center">
            <h4 className="rbt-title-style-3 mb-0">My Profile</h4>
            <EditProfileLink role={userData.role} />
          </div>

          {/* Registration Date */}
          <div className="rbt-profile-row row row--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">
                <span className="icon-circle">
                  <i className="feather-calendar"></i>
                </span>
                Registration Date
              </div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">
                {formatDate(userData.created_at)}
              </div>
            </div>
          </div>

          {/* First Name */}
          <div className="rbt-profile-row row row--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">
                <span className="icon-circle">
                  <i className="feather-user"></i>
                </span>
                First Name
              </div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">
                {firstName === 'N/A' ? (
                  <span className="badge bg-light">Not set</span>
                ) : (
                  firstName
                )}
              </div>
            </div>
          </div>

          {/* Last Name */}
          <div className="rbt-profile-row row row--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">
                <span className="icon-circle">
                  <i className="feather-user"></i>
                </span>
                Last Name
              </div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">
                {lastName === 'N/A' ? (
                  <span className="badge bg-light">Not set</span>
                ) : (
                  lastName
                )}
              </div>
            </div>
          </div>

          {/* Username */}
          <div className="rbt-profile-row row row--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">
                <span className="icon-circle">
                  <i className="feather-at-sign"></i>
                </span>
                Username
              </div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">
                {userData.username ? (
                  userData.username
                ) : (
                  <span className="badge bg-light">Not set</span>
                )}
              </div>
            </div>
          </div>

          {/* Role */}
          <div className="rbt-profile-row row row--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">
                <span className="icon-circle">
                  <i className="feather-shield"></i>
                </span>
                Role
              </div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">
                <span className="badge bg-primary">
                  {userData.role || 'student'}
                </span>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="rbt-profile-row row row--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">
                <span className="icon-circle">
                  <i className="feather-mail"></i>
                </span>
                Email
              </div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">{userData.email}</div>
            </div>
          </div>

          {/* Phone Number */}
          <div className="rbt-profile-row row row--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">
                <span className="icon-circle">
                  <i className="feather-phone"></i>
                </span>
                Phone Number
              </div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">
                {userData.phone ? (
                  userData.phone
                ) : (
                  <span className="badge bg-light">Not provided</span>
                )}
              </div>
            </div>
          </div>

          {/* Skill/Occupation */}
          <div className="rbt-profile-row row row--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">
                <span className="icon-circle">
                  <i className="feather-briefcase"></i>
                </span>
                Skill/Occupation
              </div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">
                {userData.skill_occupation ? (
                  userData.skill_occupation
                ) : (
                  <span className="badge bg-light">Not provided</span>
                )}
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="rbt-profile-row row row--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">
                <span className="icon-circle">
                  <i className="feather-file-text"></i>
                </span>
                Biography
              </div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">
                {userData.bio ? (
                  userData.bio
                ) : (
                  <span className="badge bg-light">No biography provided</span>
                )}
              </div>
            </div>
          </div>

          {/* Social Links Section */}
          {socialLinks.length > 0 && (
            <div className="rbt-profile-row row row--15">
              <div className="col-lg-4 col-md-4">
                <div className="rbt-profile-content b2">
                  <span className="icon-circle">
                    <i className="feather-share-2"></i>
                  </span>
                  Social Links
                </div>
              </div>
              <div className="col-lg-8 col-md-8">
                <div className="rbt-profile-content b2">
                  <div className="social-icon-wrapper">
                    {socialLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rbt-btn-link me-3"
                        title={link.name}
                      >
                        {link.icon.startsWith('fab') ? (
                          <i className={`${link.icon} me-1`}></i>
                        ) : (
                          <i className={`${link.icon} me-1`}></i>
                        )}
                        <span>{link.name}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
