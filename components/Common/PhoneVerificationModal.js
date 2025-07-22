"use client";

import { useState, useEffect } from "react";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const PhoneVerificationModal = ({ isOpen, onClose, onSuccess, userProfile }) => {
  const [formData, setFormData] = useState({
    phone: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Initialize phone if user already has one
  useEffect(() => {
    if (userProfile?.phone) {
      setFormData(prev => ({ ...prev, phone: userProfile.phone }));
    }
  }, [userProfile]);

  // OTP Timer
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ phone: userProfile?.phone || '', otp: '' });
      setErrors({});
      setOtpSent(false);
      setOtpTimer(0);
    }
  }, [isOpen, userProfile]);

  const handleSendOTP = async () => {
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
        setOtpTimer(300); // 5 minutes
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

  const handleVerify = async () => {
    if (!formData.otp.trim()) {
      setErrors({ otp: "Verification code is required" });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/phone/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.phone,
          otp: formData.otp
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Update user profile if phone number was not previously set
        if (!userProfile?.phone) {
          await fetch('/api/user/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phone: formData.phone
            }),
          });
        }

        onSuccess();
        onClose();
      } else {
        setErrors({ otp: result.error || 'Invalid verification code' });
      }
    } catch (error) {
      setErrors({ otp: 'An error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="modal-backdrop fade show" 
        onClick={onClose}
        style={{ zIndex: 1040 }}
      />
      
      {/* Modal */}
      <div 
        className="modal fade show" 
        style={{ display: 'block', zIndex: 1050 }}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Phone Verification Required</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              />
            </div>
            
            <div className="modal-body">
              <div className="text-center mb-4">
                <i className="feather-shield text-primary" style={{ fontSize: '48px' }}></i>
                <p className="mt-3">
                  This action requires phone verification for security purposes.
                </p>
              </div>

              {errors.success && (
                <div className="alert alert-success" role="alert">
                  {errors.success}
                </div>
              )}

              <div className="form-group mb-3">
                <label>Phone Number</label>
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
                      width: '100%',
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
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}
                    >
                      Send Code
                    </button>
                  )}
                  {otpSent && otpTimer > 0 && (
                    <span className="timer-badge" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                      {Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')}
                    </span>
                  )}
                </div>
                {errors.phone && (
                  <span className="text-danger small d-block mt-1">{errors.phone}</span>
                )}
              </div>

              {otpSent && (
                <div className="form-group mb-3">
                  <label>Verification Code</label>
                  <input
                    type="text"
                    className={`form-control ${errors.otp ? 'is-invalid' : ''}`}
                    placeholder="Enter 6-digit code"
                    value={formData.otp}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, otp: e.target.value }));
                      if (errors.otp) {
                        setErrors(prev => ({ ...prev, otp: "" }));
                      }
                    }}
                    maxLength="6"
                    disabled={loading}
                  />
                  {errors.otp && (
                    <div className="invalid-feedback">{errors.otp}</div>
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
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="rbt-btn btn-border btn-sm"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              {otpSent && (
                <button
                  type="button"
                  className="rbt-btn btn-gradient btn-sm"
                  onClick={handleVerify}
                  disabled={loading || !formData.otp}
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PhoneVerificationModal;