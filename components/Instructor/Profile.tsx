import React from 'react';
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
  avatar_url?: string | null;
  photo_url?: string | null;
  facebook_url?: string | null;
  twitter_url?: string | null;
  instagram_url?: string | null;
  linkedin_url?: string | null;
  website_url?: string | null;
  github_url?: string | null;
}

interface ProfileProps {
  userProfile: UserProfile | null;
}

interface SocialLink {
  name: string;
  url: string | null | undefined;
  icon: string;
}

const Profile: React.FC<ProfileProps> = ({ userProfile }) => {
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

  // Use default values if no user profile
  const userData: UserProfile = userProfile || {
    id: '',
    name: 'N/A',
    email: 'N/A',
    created_at: null,
    phone: null,
    skill_occupation: null,
    bio: null,
    role: 'N/A',
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
            <EditProfileLink role={userProfile?.role} />
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

          {/* Role */}
          <div className="rbt-profile-row row row--15 mt--15">
            <div className="col-lg-4 col-md-4">
              <div className="rbt-profile-content b2">Role</div>
            </div>
            <div className="col-lg-8 col-md-8">
              <div className="rbt-profile-content b2">
                {userData.role || 'N/A'}
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

          {/* Social Links Section */}
          {socialLinks.length > 0 && (
            <div className="rbt-profile-row row row--15 mt--15">
              <div className="col-lg-4 col-md-4">
                <div className="rbt-profile-content b2">Social Links</div>
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
