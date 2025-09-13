'use client';

import React, { useEffect, useState } from 'react';
import ProfileCompletionChecklist from '@/components/Common/ProfileCompletionChecklist';
import Link from 'next/link';

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
            <Link
              href="/student-settings"
              className="rbt-btn btn-sm btn-gradient hover-icon-reverse"
            >
              <span className="icon-reverse-wrapper">
                <span className="btn-text">Edit Profile</span>
                <span className="btn-icon">
                  <i className="feather-edit"></i>
                </span>
                <span className="btn-icon">
                  <i className="feather-edit"></i>
                </span>
              </span>
            </Link>
          </div>

          {/* Registration Date */}
          <div className="rbt-profile-row row row--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">Registration Date</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">
                {formatDate(userData.created_at)}
              </div>
            </div>
          </div>

          {/* First Name */}
          <div className="rbt-profile-row row row--15 mt--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">First Name</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">{firstName}</div>
            </div>
          </div>

          {/* Last Name */}
          <div className="rbt-profile-row row row--15 mt--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">Last Name</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">{lastName}</div>
            </div>
          </div>

          {/* Username */}
          <div className="rbt-profile-row row row--15 mt--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">Username</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">
                {userData.username || 'Not set'}
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="rbt-profile-row row row--15 mt--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">Email</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">{userData.email}</div>
            </div>
          </div>

          {/* Phone Number */}
          <div className="rbt-profile-row row row--15 mt--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">Phone Number</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">
                {userData.phone || 'Not provided'}
              </div>
            </div>
          </div>

          {/* Skill/Occupation */}
          <div className="rbt-profile-row row row--15 mt--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">Skill/Occupation</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">
                {userData.skill_occupation || 'Not provided'}
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="rbt-profile-row row row--15 mt--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">Biography</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">
                {userData.bio || 'No biography provided'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
