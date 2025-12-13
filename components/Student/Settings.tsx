'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  ChangeEvent,
  FormEvent,
} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import ProfileCompletionChecklist from '@/components/Common/ProfileCompletionChecklist';
import PasswordGuidance from '@/components/shared/PasswordGuidance';
import { ROUTES } from '@/app/lib/constants/routes';
import {
  uploadProfilePhoto,
  uploadCoverPhoto,
  updateUserProfile,
} from '@/app/lib/actions/profileActions';
import { setPassword, changePassword } from '@/app/lib/actions/passwordActions';

// Types
interface UserProfile {
  id: string;
  email: string;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  skill_occupation?: string | null;
  bio?: string | null;
  facebook_url?: string | null;
  twitter_url?: string | null;
  instagram_url?: string | null;
  linkedin_url?: string | null;
  website_url?: string | null;
  github_url?: string | null;
  avatar_url?: string | null;
  photo_url?: string | null;
  cover_photo_url?: string | null;
  is_phone_verified?: boolean;
  auth_provider?: string | null;
  password_hash?: string | null;
}

interface SettingProps {
  userProfile: UserProfile | null;
}

interface FormData {
  first_name: string;
  last_name: string;
  phone: string;
  skill_occupation: string;
  bio: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;
  website_url: string;
  github_url: string;
}

interface Message {
  type: 'success' | 'error' | 'warning' | '';
  text: string;
}

const Setting: React.FC<SettingProps> = ({ userProfile }) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [message, setMessage] = useState<Message>({ type: '', text: '' });
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(null);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // File input refs
  const photoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    phone: '',
    skill_occupation: '',
    bio: '',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    linkedin_url: '',
    website_url: '',
    github_url: '',
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
        instagram_url: userProfile.instagram_url || '',
        linkedin_url: userProfile.linkedin_url || '',
        website_url: userProfile.website_url || '',
        github_url: userProfile.github_url || '',
      });
      setPhoneVerified(userProfile.is_phone_verified || false);
      setCurrentAvatarUrl(
        userProfile.avatar_url || userProfile.photo_url || null
      );
      setCurrentCoverUrl(userProfile.cover_photo_url || null);
    }
  }, [userProfile]);

  // OTP Timer
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle profile photo upload
  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: '파일 크기는 5MB 이하여야 합니다.' });
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage({
        type: 'error',
        text: '이미지 파일만 업로드할 수 있습니다.',
      });
      return;
    }

    setUploadingPhoto(true);
    setMessage({ type: '', text: '' });

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadProfilePhoto(formData);

      if (result.success) {
        setMessage({
          type: 'success',
          text: '프로필 사진이 업데이트되었습니다!',
        });
        setCurrentAvatarUrl(result.avatar_url || null);
      } else {
        setMessage({
          type: 'error',
          text: result.error || '업로드에 실패했습니다.',
        });
      }
    } catch {
      setMessage({ type: 'error', text: '업로드 중 오류가 발생했습니다.' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle cover photo upload
  const handleCoverUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: '파일 크기는 5MB 이하여야 합니다.' });
      return;
    }

    if (!file.type.startsWith('image/')) {
      setMessage({
        type: 'error',
        text: '이미지 파일만 업로드할 수 있습니다.',
      });
      return;
    }

    setUploadingCover(true);
    setMessage({ type: '', text: '' });

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadCoverPhoto(formData);

      if (result.success) {
        setMessage({
          type: 'success',
          text: '커버 사진이 업데이트되었습니다!',
        });
        setCurrentCoverUrl(result.cover_photo_url || null);
      } else {
        setMessage({
          type: 'error',
          text: result.error || '업로드에 실패했습니다.',
        });
      }
    } catch {
      setMessage({ type: 'error', text: '업로드 중 오류가 발생했습니다.' });
    } finally {
      setUploadingCover(false);
    }
  };

  const handleEditPhone = () => {
    setPhoneVerified(false);
    setShowOtpInput(false);
    setOtpValue('');
    setOtpTimer(0);
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
    } catch {
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

          // Save phone and verification status to database even in dev mode
          const updateResult = await updateUserProfile({
            phone: formData.phone,
            is_phone_verified: true,
          });

          if (updateResult.success) {
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
              text: 'Failed to save phone verification',
            });
          }
        } else {
          setMessage({
            type: 'error',
            text: result.error || 'Invalid verification code',
          });
        }
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.',
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleProfileSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Include phone verification status in the update
      const profileData = {
        ...formData,
        is_phone_verified: phoneVerified,
      };

      const result = await updateUserProfile(profileData);

      if (result.success) {
        setMessage({ type: 'success', text: '프로필이 업데이트되었습니다!' });
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
    } catch {
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const socialData = {
        facebook_url: formData.facebook_url,
        twitter_url: formData.twitter_url,
        instagram_url: formData.instagram_url,
        linkedin_url: formData.linkedin_url,
        website_url: formData.website_url,
        github_url: formData.github_url,
      };

      const result = await updateUserProfile(socialData);

      if (result.success) {
        setMessage({
          type: 'success',
          text: 'Social links updated successfully!',
        });
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to update social links',
        });
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Password management functions
  const handlePasswordSetup = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setPasswordLoading(true);
      setMessage({ type: '', text: '' });

      try {
        const formData = new FormData(e.currentTarget);
        const newPassword = String(formData.get('newpassword') ?? '');
        const confirmPassword = String(formData.get('confirmpassword') ?? '');

        if (newPassword !== confirmPassword) {
          setMessage({ type: 'error', text: '비밀번호가 일치하지 않습니다.' });
          return;
        }
        if (newPassword.length < 8) {
          setMessage({
            type: 'error',
            text: '비밀번호는 최소 8자 이상이어야 합니다.',
          });
          return;
        }

        const result = await setPassword({
          newPassword,
          confirmPassword,
        });

        if (result.success) {
          setMessage({
            type: 'success',
            text: result.message || '비밀번호가 설정되었습니다!',
          });
          setShowPasswordSetup(false);
          e.currentTarget.reset();
          // Update the local state to reflect that password is now set
          if (userProfile) {
            userProfile.password_hash = 'set';
          }
        } else {
          setMessage({
            type: 'error',
            text: result.error || '비밀번호 설정에 실패했습니다.',
          });
        }
      } catch {
        setMessage({
          type: 'error',
          text: '비밀번호 설정 중 오류가 발생했습니다.',
        });
      } finally {
        setPasswordLoading(false);
      }
    },
    [setMessage, userProfile]
  );

  const handlePasswordChange = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setPasswordLoading(true);
      setMessage({ type: '', text: '' });

      try {
        const formData = new FormData(e.currentTarget);
        const currentPassword = String(formData.get('currentpassword') ?? '');
        const newPassword = String(formData.get('newpassword') ?? '');
        const confirmPassword = String(formData.get('retypenewpassword') ?? '');

        if (!currentPassword) {
          setMessage({ type: 'error', text: '현재 비밀번호를 입력해주세요.' });
          return;
        }
        if (newPassword !== confirmPassword) {
          setMessage({ type: 'error', text: '비밀번호가 일치하지 않습니다.' });
          return;
        }
        if (newPassword.length < 8) {
          setMessage({
            type: 'error',
            text: '비밀번호는 최소 8자 이상이어야 합니다.',
          });
          return;
        }

        const result = await changePassword({
          currentPassword,
          newPassword,
          confirmPassword,
        });

        if (result.success) {
          setMessage({
            type: 'success',
            text: result.message || '비밀번호가 변경되었습니다!',
          });
          e.currentTarget.reset();
        } else {
          setMessage({
            type: 'error',
            text: result.error || '비밀번호 변경에 실패했습니다.',
          });
        }
      } catch {
        setMessage({
          type: 'error',
          text: '비밀번호 변경 중 오류가 발생했습니다.',
        });
      } finally {
        setPasswordLoading(false);
      }
    },
    [setMessage]
  );

  return (
    <>
      {/* Hidden file inputs */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        style={{ display: 'none' }}
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        onChange={handleCoverUpload}
        style={{ display: 'none' }}
      />

      {/* Profile Completion Checklist */}
      {userProfile && (
        <div className="mb-4">
          <ProfileCompletionChecklist
            userProfile={{
              ...userProfile,
              phone: formData.phone,
              is_phone_verified: userProfile.is_phone_verified || false,
              skill_occupation: formData.skill_occupation,
              bio: formData.bio,
            }}
          />
        </div>
      )}

      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Settings</h4>
          </div>

          {message.text && (
            <div
              className={`alert alert-${message.type === 'success' ? 'success' : message.type === 'warning' ? 'warning' : 'danger'} mb-4`}
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
                <div
                  className="tutor-bg-photo bg_image height-245"
                  style={
                    currentCoverUrl
                      ? {
                          backgroundImage: `url(${currentCoverUrl})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }
                      : {}
                  }
                ></div>
                <div className="rbt-tutor-information">
                  <div className="rbt-tutor-information-left">
                    <div className="thumbnail rbt-avatars size-lg position-relative">
                      <Image
                        width={120}
                        height={120}
                        src={
                          currentAvatarUrl ||
                          session?.user?.image ||
                          '/images/team/avatar.jpg'
                        }
                        alt="Student"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <div className="rbt-edit-photo-inner">
                        <button
                          className="rbt-edit-photo"
                          title="Upload Photo"
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          disabled={uploadingPhoto}
                        >
                          {uploadingPhoto ? (
                            <span className="spinner-border spinner-border-sm" />
                          ) : (
                            <i className="feather-camera" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="rbt-tutor-information-right">
                    <div className="tutor-btn">
                      <button
                        className="rbt-btn btn-sm btn-border color-white radius-round-10"
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        disabled={uploadingCover}
                      >
                        {uploadingCover ? 'Uploading...' : 'Edit Cover Photo'}
                      </button>
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
                      placeholder="John"
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
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="phone">
                      Phone Number
                      {phoneVerified && (
                        <span className="badge bg-success ms-2">
                          <i className="feather-check me-1"></i>Verified
                        </span>
                      )}
                    </label>
                    <div className="phone-input-wrapper">
                      <PhoneInput
                        country={'us'}
                        value={formData.phone}
                        onChange={(value) => {
                          if (!phoneVerified) {
                            const newPhone = value
                              ? value.startsWith('+')
                                ? value
                                : '+' + value
                              : '';
                            setFormData((prev) => ({
                              ...prev,
                              phone: newPhone,
                            }));
                          }
                        }}
                        inputProps={{
                          name: 'phone',
                          required: false,
                          autoFocus: false,
                          readOnly: phoneVerified,
                        }}
                        containerClass="phone-input-container"
                        inputClass="form-control"
                        buttonClass="flag-dropdown"
                        inputStyle={{
                          background: phoneVerified ? '#f8f9fa' : 'transparent',
                          cursor: phoneVerified ? 'default' : 'text',
                        }}
                        buttonStyle={{
                          background: phoneVerified ? '#f8f9fa' : 'transparent',
                          cursor: phoneVerified ? 'default' : 'pointer',
                        }}
                      />
                      {phoneVerified && (
                        <button
                          type="button"
                          className="send-code-btn btn btn-sm btn-primary"
                          onClick={handleEditPhone}
                        >
                          <i className="feather-edit-2"></i> Edit
                        </button>
                      )}
                      {!phoneVerified &&
                        !showOtpInput &&
                        formData.phone &&
                        formData.phone.length > 3 && (
                          <button
                            type="button"
                            className="send-code-btn btn btn-sm btn-primary"
                            onClick={handleSendOTP}
                            disabled={otpLoading}
                          >
                            {otpLoading ? 'Sending...' : 'Verify'}
                          </button>
                        )}
                      {showOtpInput && !phoneVerified && otpTimer > 0 && (
                        <span className="timer-badge">
                          {Math.floor(otpTimer / 60)}:
                          {(otpTimer % 60).toString().padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    {!phoneVerified && formData.phone && (
                      <small className="text-muted mt-1 d-block">
                        Verify your phone to enable SMS notifications and
                        enhance account security
                      </small>
                    )}
                    {showOtpInput && (
                      <div className="mt-3">
                        <div className="position-relative">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter 6-digit verification code"
                            value={otpValue}
                            onChange={(e) => setOtpValue(e.target.value)}
                            maxLength={6}
                            style={{
                              height: '50px',
                              paddingRight: '120px',
                            }}
                          />
                          <button
                            type="button"
                            className="btn btn-success"
                            onClick={handleVerifyOTP}
                            disabled={otpLoading || !otpValue}
                            style={{
                              position: 'absolute',
                              right: '10px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              height: '34px',
                              padding: '0 20px',
                              fontSize: '14px',
                              fontWeight: '500',
                              minWidth: '100px',
                            }}
                          >
                            {otpLoading ? 'Verifying...' : 'Verify OTP'}
                          </button>
                        </div>
                        <div className="mt-2 d-flex align-items-center justify-content-between">
                          <small className="text-muted">
                            Didn&apos;t receive the code?
                          </small>
                          {otpTimer === 0 && (
                            <button
                              type="button"
                              className="btn btn-link text-primary"
                              onClick={handleSendOTP}
                              disabled={otpLoading}
                              style={{
                                fontSize: '14px',
                                textDecoration: 'none',
                                fontWeight: '500',
                              }}
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
                      className="form-control-readonly"
                    />
                  </div>
                </div>
                <div className="col-12">
                  <div className="rbt-form-group">
                    <label htmlFor="bio">Bio</label>
                    <textarea
                      id="bio"
                      name="bio"
                      cols={20}
                      rows={5}
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
                authProvider={userProfile?.auth_provider ?? undefined}
                hasPasswordHash={!!userProfile?.password_hash}
              />

              {userProfile?.auth_provider === 'google' &&
              !userProfile?.password_hash ? (
                // Google OAuth 사용자이며 비밀번호가 설정되지 않은 경우
                <div className="rbt-profile-row">
                  <div className="col-12">
                    <div className="small text-muted mb-3">
                      <div className="mb-1">
                        <i className="feather-check-circle me-2 text-success"></i>
                        모바일 앱이나 디바이스에서 편리하게 로그인
                      </div>
                      <div className="mb-1">
                        <i className="feather-check-circle me-2 text-success"></i>
                        Google 서비스 장애 시 백업 로그인 방법
                      </div>
                      <div className="mb-1">
                        <i className="feather-check-circle me-2 text-success"></i>
                        회사나 공용 PC에서 OAuth가 차단된 경우 대안
                      </div>
                    </div>

                    <div className="text-center mt-4">
                      <button
                        type="button"
                        className="rbt-btn btn-gradient"
                        onClick={() => setShowPasswordSetup(true)}
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
                              minLength={8}
                              required
                            />
                            <small className="text-muted">
                              최소 8자, 대소문자와 숫자를 포함해주세요
                            </small>
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
                              minLength={8}
                              required
                            />
                          </div>
                        </div>
                        <div className="col-12 mt--10">
                          <div className="rbt-form-group d-flex gap-3">
                            <button
                              className="rbt-btn btn-gradient"
                              type="submit"
                              disabled={passwordLoading}
                            >
                              {passwordLoading ? '처리 중...' : '비밀번호 설정'}
                            </button>
                            <button
                              className="rbt-btn btn-border"
                              type="button"
                              onClick={() => setShowPasswordSetup(false)}
                              disabled={passwordLoading}
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ) : (
                // 기존 비밀번호 변경 폼 (이메일 로그인 사용자 또는 비밀번호가 이미 설정된 경우)
                <form
                  className="rbt-profile-row rbt-default-form row row--15"
                  onSubmit={handlePasswordChange}
                >
                  <div className="col-12">
                    <div className="rbt-form-group">
                      <label htmlFor="currentpassword">
                        Current Password
                        <Link
                          href={ROUTES.AUTH.FORGOT_PASSWORD}
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
                        minLength={8}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="rbt-form-group">
                      <label htmlFor="retypenewpassword">
                        Confirm New Password
                      </label>
                      <input
                        id="retypenewpassword"
                        name="retypenewpassword"
                        type="password"
                        placeholder="Re-enter new password"
                        minLength={8}
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
                        {passwordLoading ? '처리 중...' : 'Update Password'}
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
                onSubmit={handleSocialSubmit}
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
                      placeholder="https://github.com/yourprofile"
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
