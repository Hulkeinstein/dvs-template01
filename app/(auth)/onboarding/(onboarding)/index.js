"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const OnboardingClient = ({ userProfile, session }) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    otp: '',
    skill_occupation: '',
    bio: '',
  });

  // Hydration 오류 방지
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize form with user data
  useEffect(() => {
    if (mounted) {
      // Google 로그인 시 받은 이름을 username 기본값으로 설정
      const defaultUsername = userProfile?.username || 
        (session?.user?.name ? session.user.name.toLowerCase().replace(/\s+/g, '_') : '');
      
      setFormData({
        username: defaultUsername,
        phone: userProfile?.phone || '',
        otp: '',
        skill_occupation: userProfile?.skill_occupation || '',
        bio: userProfile?.bio || '',
      });
    }
  }, [userProfile, session, mounted]);

  // OTP 타이머
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (formData.phone.length < 10) {
      newErrors.phone = "Please enter a valid phone number";
    }

    if (otpSent && !formData.otp.trim()) {
      newErrors.otp = "Verification code is required";
    } else if (otpSent && !/^\d{6}$/.test(formData.otp)) {
      newErrors.otp = "Please enter a 6-digit code";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async () => {
    // 전화번호 유효성 검사
    if (!formData.phone.trim()) {
      setErrors({ phone: "Phone number is required" });
      return;
    }

    setLoading(true);
    setErrors({});

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
        setOtpSent(true);
        setOtpTimer(300); // 5분 타이머
        setErrors({ success: 'Verification code sent to your phone!' });
      } else {
        setErrors({ phone: result.error || 'Failed to send verification code' });
      }
    } catch (error) {
      setErrors({ phone: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndContinue = async () => {
    if (!validateStep1()) {
      return;
    }

    if (!otpSent) {
      setErrors({ otp: 'Please send verification code first' });
      return;
    }

    setLoading(true);
    try {
      // OTP 검증
      const verifyResponse = await fetch('/api/auth/phone/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone,
          otp: formData.otp
        }),
      });

      const verifyResult = await verifyResponse.json();

      if (!verifyResponse.ok) {
        setErrors({ otp: verifyResult.error || 'Invalid verification code' });
        setLoading(false);
        return;
      }

      // Username 업데이트
      const profileResponse = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          phone: formData.phone
        }),
      });

      const profileResult = await profileResponse.json();

      if (profileResponse.ok) {
        setCurrentStep(2);
      } else {
        setErrors({ submit: profileResult.error || 'Failed to update profile' });
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (skipOptional = false) => {
    setLoading(true);
    try {
      const dataToSubmit = skipOptional 
        ? {} 
        : {
          skill_occupation: formData.skill_occupation,
          bio: formData.bio
        };

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSubmit),
      });

      const result = await response.json();

      if (response.ok) {
        // 프로필 완성 후 대시보드로 리다이렉트
        router.push('/dashboard');
        router.refresh(); // 세션 정보 새로고침
      } else {
        setErrors({ submit: result.error || 'Failed to update profile' });
      }
    } catch (error) {
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Hydration 오류 방지를 위해 클라이언트에서만 렌더링
  if (!mounted) {
    return null;
  }

  return (
    <div className="rbt-elements-area bg-color-white rbt-section-gap">
      <div className="container">
        <div className="row gy-5 row--30">
          <div className="col-lg-6 offset-lg-3">
            <div className="rbt-contact-form contact-form-style-1 max-width-auto">
              <div className="text-center mb--30">
                {session?.user?.image && (
                  <div className="mb--20">
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={80}
                      height={80}
                      className="rounded-circle"
                    />
                  </div>
                )}
                <h3 className="title">Welcome, {session?.user?.name}!</h3>
                <p className="description">
                  {currentStep === 1 
                    ? "Let's verify your phone number to get started"
                    : "Add more details about yourself (optional)"
                  }
                </p>
              </div>

              {/* Progress indicator */}
              <div className="rbt-progress-style-1 mb--40">
                <div className="single-progress">
                  <h6 className="title">Profile Completion</h6>
                  <div className="progress">
                    <div 
                      className="progress-bar wow fadeInLeft" 
                      style={{ width: currentStep === 1 ? '50%' : '100%' }}
                    />
                  </div>
                  <span className="progress-number">{currentStep === 1 ? '50%' : '100%'}</span>
                </div>
              </div>

              {errors.submit && (
                <div className="alert alert-danger" role="alert">
                  {errors.submit}
                </div>
              )}

              {errors.success && (
                <div className="alert alert-success" role="alert">
                  {errors.success}
                </div>
              )}

              <form onSubmit={(e) => e.preventDefault()}>
                {currentStep === 1 ? (
                  <>
                    <div className="form-group">
                      <input
                        name="username"
                        type="text"
                        placeholder="Choose a username *"
                        value={formData.username}
                        onChange={handleInputChange}
                        className={errors.username ? 'error' : ''}
                        disabled={loading}
                      />
                      <span className="focus-border"></span>
                      {errors.username && (
                        <span className="text-danger small d-block mt-1">{errors.username}</span>
                      )}
                    </div>

                    <div className="form-group">
                      <div className="phone-input-wrapper">
                        <PhoneInput
                          country={'us'}
                          value={formData.phone}
                          onChange={(phone) => {
                            setFormData(prev => ({ ...prev, phone: '+' + phone }));
                            if (errors.phone) {
                              setErrors(prev => ({ ...prev, phone: "" }));
                            }
                          }}
                          disabled={loading || otpSent}
                          inputStyle={{
                            border: 'none',
                            borderBottom: '2px solid #e5e5e5',
                            borderRadius: 0,
                            boxShadow: 'none'
                          }}
                          buttonStyle={{
                            border: 'none',
                            borderBottom: '2px solid #e5e5e5',
                            borderRadius: 0,
                            background: 'transparent'
                          }}
                          dropdownStyle={{
                            borderRadius: '8px'
                          }}
                          inputProps={{
                            name: 'phone',
                            required: true,
                            className: errors.phone ? 'form-control error' : 'form-control',
                            style: { 
                              paddingRight: otpSent ? '80px' : '160px',
                              border: 'none',
                              borderBottom: '2px solid #e5e5e5',
                              borderRadius: 0,
                              boxShadow: 'none',
                              outline: 'none'
                            },
                            placeholder: 'Enter your phone number'
                          }}
                          containerClass="phone-input-container"
                          enableSearch={true}
                          searchPlaceholder="Search countries"
                          preferredCountries={['us', 'kr', 'jp', 'cn', 'gb', 'ca', 'au']}
                        />
                        {!otpSent && (
                          <button
                            type="button"
                            className="rbt-btn btn-sm send-code-btn"
                            onClick={handleSendOTP}
                            disabled={loading || !formData.phone || formData.phone.length < 10}
                          >
                            Send Code
                          </button>
                        )}
                        {otpSent && otpTimer > 0 && (
                          <span className="timer-badge">
                            {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                          </span>
                        )}
                      </div>
                      {errors.phone && (
                        <span className="text-danger small d-block mt-1">{errors.phone}</span>
                      )}
                    </div>

                    {otpSent && (
                      <div className="form-group">
                        <input
                          name="otp"
                          type="text"
                          placeholder="Enter 6-digit verification code *"
                          value={formData.otp}
                          onChange={handleInputChange}
                          className={errors.otp ? 'error' : ''}
                          disabled={loading}
                          maxLength="6"
                        />
                        <span className="focus-border"></span>
                        {errors.otp && (
                          <span className="text-danger small d-block mt-1">{errors.otp}</span>
                        )}
                        {otpTimer === 0 && (
                          <button
                            type="button"
                            className="rbt-btn-link mt-2"
                            onClick={handleSendOTP}
                            disabled={loading}
                          >
                            Resend Code
                          </button>
                        )}
                      </div>
                    )}

                    <div className="form-submit-group">
                      <button
                        type="button"
                        className="rbt-btn btn-md btn-gradient hover-icon-reverse w-100"
                        onClick={handleVerifyAndContinue}
                        disabled={loading || !otpSent}
                      >
                        <span className="icon-reverse-wrapper">
                          <span className="btn-text">
                            {loading ? 'Verifying...' : 'Verify & Continue'}
                          </span>
                          <span className="btn-icon">
                            <i className="feather-arrow-right"></i>
                          </span>
                          <span className="btn-icon">
                            <i className="feather-arrow-right"></i>
                          </span>
                        </span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <input
                        name="skill_occupation"
                        type="text"
                        placeholder="Your skill or occupation (optional)"
                        value={formData.skill_occupation}
                        onChange={handleInputChange}
                        disabled={loading}
                      />
                      <span className="focus-border"></span>
                    </div>

                    <div className="form-group">
                      <textarea
                        name="bio"
                        placeholder="Tell us about yourself (optional)"
                        rows={4}
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={loading}
                      />
                      <span className="focus-border"></span>
                    </div>

                    <div className="row gx-3">
                      <div className="col-6">
                        <button
                          type="button"
                          className="rbt-btn btn-md btn-border w-100"
                          onClick={() => setCurrentStep(1)}
                          disabled={loading}
                        >
                          Back
                        </button>
                      </div>
                      <div className="col-6">
                        <button
                          type="button"
                          className="rbt-btn btn-md btn-gradient hover-icon-reverse w-100"
                          onClick={() => handleSubmit(false)}
                          disabled={loading}
                        >
                          <span className="icon-reverse-wrapper">
                            <span className="btn-text">
                              {loading ? 'Saving...' : 'Complete Profile'}
                            </span>
                            <span className="btn-icon">
                              <i className="feather-arrow-right"></i>
                            </span>
                            <span className="btn-icon">
                              <i className="feather-arrow-right"></i>
                            </span>
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="text-center mt--20">
                      <button
                        type="button"
                        className="rbt-btn btn-link"
                        onClick={() => handleSubmit(true)}
                        disabled={loading}
                      >
                        Skip for now
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingClient;