'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import ProfileCompletionChecklist from '@/components/Common/ProfileCompletionChecklist';
import PasswordGuidance from '@/components/shared/PasswordGuidance';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const Setting = ({ userProfile }) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);

  // Password form states
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({
    type: '',
    text: '',
  });
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    skill_occupation: '',
    bio: '',
    facebook_url: '',
    twitter_url: '',
    linkedin_url: '',
    website_url: '',
    github_url: '',
    instagram_url: '',
  });

  // Initialize form with user data
  useEffect(() => {
    if (userProfile) {
      const nameParts = userProfile.name
        ? userProfile.name.split(' ')
        : ['', ''];
      setFormData({
        first_name: userProfile.first_name || nameParts[0] || '',
        last_name: userProfile.last_name || nameParts.slice(1).join(' ') || '',
        phone: userProfile.phone || '',
        skill_occupation: userProfile.skill_occupation || '',
        bio: userProfile.bio || '',
        facebook_url: userProfile.facebook_url || '',
        twitter_url: userProfile.twitter_url || '',
        linkedin_url: userProfile.linkedin_url || '',
        website_url: userProfile.website_url || '',
        github_url: userProfile.github_url || '',
        instagram_url: userProfile.instagram_url || '',
      });
      setPhoneVerified(userProfile.is_phone_verified || false);
    }
  }, [userProfile]);

  // OTP Timer
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendOTP = async () => {
    if (!formData.phone || formData.phone.length < 4) {
      setMessage({ type: 'error', text: 'Please enter a valid phone number' });
      return;
    }

    setOtpLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/auth/phone/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: formData.phone }),
      });

      const result = await response.json();

      if (response.ok) {
        setShowOtpInput(true);
        setOtpTimer(300); // 5 minutes
        setMessage({
          type: 'success',
          text: 'Verification code sent to your phone!',
        });
      } else {
        // In development, show OTP input anyway for testing
        if (result.error?.includes('Database table not found')) {
          setShowOtpInput(true);
          setOtpTimer(300); // 5 minutes
          setMessage({
            type: 'warning',
            text: 'Database not configured. In development mode - use OTP: 123456',
          });
          console.log('Development mode: Use OTP 123456 for testing');
        } else {
          setMessage({
            type: 'error',
            text: result.error || 'Failed to send verification code',
          });
        }
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.',
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpValue.trim()) {
      setMessage({ type: 'error', text: 'Please enter the verification code' });
      return;
    }

    setOtpLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/auth/phone/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone,
          otp: otpValue,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setPhoneVerified(true);
        setShowOtpInput(false);
        setOtpValue('');
        setMessage({
          type: 'success',
          text: 'Phone number verified successfully!',
        });
      } else {
        // In development, allow test OTP
        if (otpValue === '123456') {
          console.log('Development mode: Test OTP accepted');
          setPhoneVerified(true);
          setShowOtpInput(false);
          setOtpValue('');
          setMessage({
            type: 'success',
            text: 'Phone number verified successfully! (Development mode)',
          });
        } else {
          setMessage({
            type: 'error',
            text: result.error || 'Invalid verification code',
          });
        }
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.',
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          name: `${formData.first_name} ${formData.last_name}`.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Update session if needed
        if (session) {
          await fetch('/api/auth/session?update');
        }
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to update profile',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Form submit handler for profile updates
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Import the update action
      const { updateUserProfile } = await import(
        '@/app/lib/actions/profileActions'
      );

      // Include phone verification status in the update
      const profileData = {
        ...formData,
        is_phone_verified: phoneVerified,
      };

      const result = await updateUserProfile(profileData);

      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Maintain phone verification status after update
        setPhoneVerified(phoneVerified);
        // Update session if needed
        if (session) {
          await fetch('/api/auth/session?update');
        }
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to update profile',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Password setup handler for Google OAuth users
  const handlePasswordSetup = useCallback(
    async (e) => {
      e.preventDefault();
      setPasswordLoading(true);
      setPasswordMessage({ type: '', text: '' });

      const formData = new FormData(e.currentTarget);
      const newPassword = formData.get('newpassword');
      const confirmPassword = formData.get('confirmpassword');

      // Validation
      if (newPassword !== confirmPassword) {
        setPasswordMessage({ type: 'error', text: 'Passwords do not match' });
        setPasswordLoading(false);
        return;
      }

      if (newPassword.length < 8) {
        setPasswordMessage({
          type: 'error',
          text: 'Password must be at least 8 characters',
        });
        setPasswordLoading(false);
        return;
      }

      try {
        const { setPassword } = await import(
          '@/app/lib/actions/passwordActions'
        );
        const result = await setPassword({
          userId: session?.user?.id,
          newPassword,
        });

        if (result.success) {
          setPasswordMessage({
            type: 'success',
            text: 'Password set successfully!',
          });
          setShowPasswordSetup(false);
          // Refresh the page to update auth_provider status
          setTimeout(() => window.location.reload(), 1500);
        } else {
          setPasswordMessage({
            type: 'error',
            text: result.message || 'Failed to set password',
          });
        }
      } catch (error) {
        setPasswordMessage({
          type: 'error',
          text: 'An error occurred. Please try again.',
        });
      } finally {
        setPasswordLoading(false);
      }
    },
    [session]
  );

  // Password change handler for users with existing passwords
  const handlePasswordChange = useCallback(
    async (e) => {
      e.preventDefault();
      setPasswordLoading(true);
      setPasswordMessage({ type: '', text: '' });

      const formData = new FormData(e.currentTarget);
      const currentPassword = formData.get('currentpassword');
      const newPassword = formData.get('newpassword');
      const confirmPassword = formData.get('confirmpassword');

      // Validation
      if (newPassword !== confirmPassword) {
        setPasswordMessage({ type: 'error', text: 'Passwords do not match' });
        setPasswordLoading(false);
        return;
      }

      if (newPassword.length < 8) {
        setPasswordMessage({
          type: 'error',
          text: 'Password must be at least 8 characters',
        });
        setPasswordLoading(false);
        return;
      }

      try {
        const { changePassword } = await import(
          '@/app/lib/actions/passwordActions'
        );
        const result = await changePassword({
          userId: session?.user?.id,
          currentPassword,
          newPassword,
        });

        if (result.success) {
          setPasswordMessage({
            type: 'success',
            text: 'Password changed successfully!',
          });
          // Clear form
          e.target.reset();
        } else {
          setPasswordMessage({
            type: 'error',
            text: result.message || 'Failed to change password',
          });
        }
      } catch (error) {
        setPasswordMessage({
          type: 'error',
          text: 'An error occurred. Please try again.',
        });
      } finally {
        setPasswordLoading(false);
      }
    },
    [session]
  );

  return (
    <>
      {/* Profile Completion Checklist */}
      {userProfile && (
        <ProfileCompletionChecklist
          userProfile={{
            ...userProfile,
            phone: formData.phone,
            is_phone_verified: phoneVerified,
          }}
        />
      )}

      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Settings</h4>
          </div>

          {message.text && (
            <div
              className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} mb-4`}
              role="alert"
            >
              {message.text}
            </div>
          )}

          <div className="advance-tab-button mb--30">
            <ul
              className="nav nav-tabs tab-button-style-2 justify-content-start"
              id="settinsTab-4"
              role="tablist"
            >
              <li role="presentation">
                <Link
                  href="#"
                  className="tab-button active"
                  id="profile-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#profile"
                  role="tab"
                  aria-controls="profile"
                  aria-selected="true"
                >
                  <span className="title">Profile</span>
                </Link>
              </li>
              <li role="presentation">
                <Link
                  href="#"
                  className="tab-button"
                  id="password-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#password"
                  role="tab"
                  aria-controls="password"
                  aria-selected="false"
                >
                  <span className="title">Password</span>
                </Link>
              </li>
              <li role="presentation">
                <Link
                  href="#"
                  className="tab-button"
                  id="social-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#social"
                  role="tab"
                  aria-controls="social"
                  aria-selected="false"
                >
                  <span className="title">Social Share</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="tab-content">
            <div
              className="tab-pane fade active show"
              id="profile"
              role="tabpanel"
              aria-labelledby="profile-tab"
            >
              <div className="rbt-dashboard-content-wrapper">
                <div className="tutor-bg-photo bg_image bg_image--23 height-245"></div>
                <div className="rbt-tutor-information">
                  <div className="rbt-tutor-information-left">
                    <div className="thumbnail rbt-avatars size-lg position-relative">
                      <Image
                        width={300}
                        height={300}
                        src={
                          userProfile?.photo_url ||
                          session?.user?.image ||
                          '/images/team/avatar-2.jpg'
                        }
                        alt="Student"
                      />
                      <div className="rbt-edit-photo-inner">
                        <button className="rbt-edit-photo" title="Upload Photo">
                          <i className="feather-camera" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="rbt-tutor-information-right">
                    <div className="tutor-btn">
                      <Link
                        className="rbt-btn btn-sm btn-border color-white radius-round-10"
                        href="#"
                      >
                        Edit Cover Photo
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <form
                onSubmit={handleProfileSubmit}
                className="rbt-profile-row rbt-default-form row row--15"
              >
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="first_name">First Name</label>
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="First Name"
                    />
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="last_name">Last Name</label>
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="Last Name"
                    />
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="phone">
                      Phone Number
                      {phoneVerified ? (
                        <span className="badge bg-success ms-2">
                          <i className="feather-check me-1"></i>Verified
                        </span>
                      ) : formData.phone ? (
                        <span className="badge bg-warning ms-2">
                          Not Verified
                        </span>
                      ) : null}
                    </label>
                    <div className="phone-input-wrapper position-relative">
                      <div className="phone-input-container position-relative">
                        <PhoneInput
                          country={'us'}
                          value={formData.phone}
                          onChange={(phone) => {
                            const newPhone = phone ? '+' + phone : '';
                            setFormData((prev) => ({
                              ...prev,
                              phone: newPhone,
                            }));

                            // If phone was verified and number changed, unverify it
                            if (
                              phoneVerified &&
                              newPhone !== userProfile?.phone
                            ) {
                              setPhoneVerified(false);
                            }
                          }}
                          disabled={loading}
                          inputStyle={{
                            width: '100%',
                            height: '50px',
                            fontSize: '16px',
                            fontWeight: '400',
                            lineHeight: '28px',
                            paddingLeft: '48px',
                            paddingRight:
                              formData.phone && !phoneVerified
                                ? '85px'
                                : '15px',
                            border: '2px solid #e6e3f1',
                            borderRadius: '6px',
                            boxShadow:
                              '0 13px 14px 0 rgba(129, 104, 145, 0.05)',
                            background: phoneVerified
                              ? '#f8f9fa'
                              : 'transparent',
                            color: '#5f5a70',
                          }}
                          buttonStyle={{
                            border: '2px solid #e6e3f1',
                            borderRadius: '6px 0 0 6px',
                            borderRight: 'none',
                            background: phoneVerified
                              ? '#f8f9fa'
                              : 'transparent',
                            height: '50px',
                          }}
                          dropdownStyle={{
                            borderRadius: '8px',
                          }}
                          containerClass="w-100"
                          enableSearch={true}
                          searchPlaceholder="Search countries"
                          preferredCountries={[
                            'us',
                            'kr',
                            'jp',
                            'cn',
                            'gb',
                            'ca',
                            'au',
                          ]}
                        />
                        {formData.phone &&
                          formData.phone.length > 3 &&
                          !phoneVerified && (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm position-absolute"
                              style={{
                                right: '8px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                padding: '4px 16px',
                                fontSize: '14px',
                                borderRadius: '4px',
                                height: '34px',
                                zIndex: 10,
                              }}
                              onClick={handleSendOTP}
                              disabled={otpLoading}
                            >
                              Verify
                            </button>
                          )}
                      </div>
                    </div>

                    {/* OTP Input Section */}
                    {showOtpInput && !phoneVerified && (
                      <div className="mt-3">
                        <div className="d-flex align-items-center gap-3">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter 6-digit code"
                            value={otpValue}
                            onChange={(e) => setOtpValue(e.target.value)}
                            maxLength="6"
                            style={{ maxWidth: '200px' }}
                          />
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleVerifyOTP}
                            disabled={otpLoading || !otpValue}
                          >
                            {otpLoading ? 'Verifying...' : 'Verify Code'}
                          </button>
                          {otpTimer > 0 ? (
                            <span className="text-muted ms-2">
                              {Math.floor(otpTimer / 60)}:
                              {(otpTimer % 60).toString().padStart(2, '0')}
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-link btn-sm"
                              onClick={handleSendOTP}
                              disabled={otpLoading}
                            >
                              Resend Code
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="skill_occupation">Skill/Occupation</label>
                    <input
                      id="skill_occupation"
                      name="skill_occupation"
                      type="text"
                      value={formData.skill_occupation}
                      onChange={handleInputChange}
                      placeholder="Your skill or occupation"
                    />
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={userProfile?.email || ''}
                      placeholder="example@gmail.com"
                      readOnly
                      style={{
                        backgroundColor: '#f8f9fa',
                        cursor: 'not-allowed',
                      }}
                    />
                  </div>
                </div>
                <div className="col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="bio">Bio</label>
                    <textarea
                      id="bio"
                      name="bio"
                      cols="20"
                      rows="5"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Write something about yourself..."
                    ></textarea>
                  </div>
                </div>
                <div className="col-12 mt--20">
                  <div className="rbt-form-group">
                    <button
                      className="rbt-btn btn-gradient"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div
              className="tab-pane fade"
              id="password"
              role="tabpanel"
              aria-labelledby="password-tab"
            >
              {/* Password Guidance Component */}
              <PasswordGuidance
                authProvider={userProfile?.auth_provider}
                hasPasswordHash={!!userProfile?.password_hash}
              />

              {/* Password Messages */}
              {passwordMessage.text && (
                <div
                  className={`alert alert-${passwordMessage.type === 'error' ? 'danger' : passwordMessage.type} mb-3`}
                >
                  {passwordMessage.text}
                </div>
              )}

              {/* Conditional rendering based on auth_provider and password_hash */}
              {userProfile?.auth_provider === 'google' &&
              !userProfile?.password_hash ? (
                // Google OAuth user without password
                <div className="rbt-profile-row">
                  <div className="col-12">
                    <p className="mb-3">
                      비밀번호를 설정하면 Google 계정 외에도 이메일과 비밀번호로
                      로그인할 수 있습니다.
                    </p>
                    <div className="text-center">
                      <button
                        className="rbt-btn btn-gradient mb-4"
                        onClick={() => setShowPasswordSetup(!showPasswordSetup)}
                        type="button"
                        aria-label="비밀번호 추가 설정 열기"
                      >
                        <i className="feather-lock me-2"></i>
                        비밀번호 추가 설정 (선택사항)
                      </button>
                    </div>
                  </div>

                  {/* Password setup form */}
                  {showPasswordSetup && (
                    <div id="password-setup-section">
                      <form
                        className="rbt-profile-row rbt-default-form row row--15 mt-4"
                        onSubmit={handlePasswordSetup}
                      >
                        <div className="col-12">
                          <h5 className="mb-3">
                            새 비밀번호 설정
                            <small className="text-muted ms-2">
                              (최초 비밀번호 설정시 현재 비밀번호 입력이 불필요)
                            </small>
                          </h5>
                        </div>
                        <div className="col-12">
                          <div className="rbt-form-group">
                            <label htmlFor="newpassword">New Password</label>
                            <input
                              id="newpassword"
                              name="newpassword"
                              type="password"
                              placeholder="Enter new password (min 8 characters)"
                              required
                              minLength="8"
                            />
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="rbt-form-group">
                            <label htmlFor="confirmpassword">
                              Confirm Password
                            </label>
                            <input
                              id="confirmpassword"
                              name="confirmpassword"
                              type="password"
                              placeholder="Re-enter new password"
                              required
                            />
                          </div>
                        </div>
                        <div className="col-12 mt--10">
                          <div className="rbt-form-group">
                            <button
                              className="rbt-btn btn-gradient"
                              type="submit"
                              disabled={passwordLoading}
                            >
                              {passwordLoading
                                ? 'Setting Password...'
                                : 'Set Password'}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ) : (
                // Users with password already set (email or both)
                <form
                  className="rbt-profile-row rbt-default-form row row--15"
                  onSubmit={handlePasswordChange}
                >
                  <div className="col-12">
                    <div className="rbt-form-group">
                      <label htmlFor="currentpassword">
                        Current Password
                        <Link
                          href="/auth/forgot-password"
                          className="text-primary ms-2"
                          style={{ fontSize: '14px' }}
                        >
                          Forgot password?
                        </Link>
                      </label>
                      <input
                        id="currentpassword"
                        name="currentpassword"
                        type="password"
                        placeholder="Enter current password"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="rbt-form-group">
                      <label htmlFor="newpassword">New Password</label>
                      <input
                        id="newpassword"
                        name="newpassword"
                        type="password"
                        placeholder="Enter new password (min 8 characters)"
                        required
                        minLength="8"
                      />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="rbt-form-group">
                      <label htmlFor="confirmpassword">
                        Confirm New Password
                      </label>
                      <input
                        id="confirmpassword"
                        name="confirmpassword"
                        type="password"
                        placeholder="Re-enter new password"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-12 mt--10">
                    <div className="rbt-form-group">
                      <button
                        className="rbt-btn btn-gradient"
                        type="submit"
                        disabled={passwordLoading}
                      >
                        {passwordLoading
                          ? 'Updating Password...'
                          : 'Update Password'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            <div
              className="tab-pane fade"
              id="social"
              role="tabpanel"
              aria-labelledby="social-tab"
            >
              <form
                onSubmit={handleSubmit}
                className="rbt-profile-row rbt-default-form row row--15"
              >
                <div className="col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="facebook_url">
                      <i className="feather-facebook"></i> Facebook
                    </label>
                    <input
                      id="facebook_url"
                      name="facebook_url"
                      type="text"
                      value={formData.facebook_url}
                      onChange={handleInputChange}
                      placeholder="https://facebook.com/yourprofile"
                    />
                  </div>
                </div>
                <div className="col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="twitter_url">
                      <i className="fab fa-x-twitter"></i> X
                    </label>
                    <input
                      id="twitter_url"
                      name="twitter_url"
                      type="text"
                      value={formData.twitter_url}
                      onChange={handleInputChange}
                      placeholder="https://x.com/yourprofile"
                    />
                  </div>
                </div>
                <div className="col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="instagram_url">
                      <i className="feather-instagram"></i> Instagram
                    </label>
                    <input
                      id="instagram_url"
                      name="instagram_url"
                      type="text"
                      value={formData.instagram_url}
                      onChange={handleInputChange}
                      placeholder="https://instagram.com/yourprofile"
                    />
                  </div>
                </div>
                <div className="col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="linkedin_url">
                      <i className="feather-linkedin"></i> LinkedIn
                    </label>
                    <input
                      id="linkedin_url"
                      name="linkedin_url"
                      type="text"
                      value={formData.linkedin_url}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                </div>
                <div className="col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="website_url">
                      <i className="feather-globe"></i> Website
                    </label>
                    <input
                      id="website_url"
                      name="website_url"
                      type="text"
                      value={formData.website_url}
                      onChange={handleInputChange}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
                <div className="col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="github_url">
                      <i className="feather-github"></i> GitHub
                    </label>
                    <input
                      id="github_url"
                      name="github_url"
                      type="text"
                      value={formData.github_url}
                      onChange={handleInputChange}
                      placeholder="https://github.com/yourusername"
                    />
                  </div>
                </div>
                <div className="col-12 mt--10">
                  <div className="rbt-form-group">
                    <button
                      className="rbt-btn btn-gradient"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Social Links'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Setting;
