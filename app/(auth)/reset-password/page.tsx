'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  validateResetToken,
  resetPasswordWithToken,
} from '@/app/lib/actions/passwordActions';
import Link from 'next/link';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setTokenValid(false);
        return;
      }

      const result = await validateResetToken(token);
      setTokenValid(result.valid);
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!newPassword || !confirmPassword) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    if (newPassword.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setError('비밀번호는 대문자를 포함해야 합니다.');
      return;
    }

    if (!/[a-z]/.test(newPassword)) {
      setError('비밀번호는 소문자를 포함해야 합니다.');
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setError('비밀번호는 숫자를 포함해야 합니다.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPasswordWithToken(token, newPassword);

      if (result.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(result.error || '비밀번호 재설정에 실패했습니다.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('비밀번호 재설정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state while checking token
  if (tokenValid === null) {
    return (
      <div className="rbt-elements-area bg-color-white rbt-section-gap">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt--20">토큰을 확인하는 중...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Invalid or expired token
  if (!tokenValid) {
    return (
      <div className="rbt-elements-area bg-color-white rbt-section-gap">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="rbt-contact-form-area">
                <div className="rbt-form-wrapper">
                  <div className="text-center">
                    <h3 className="title text-danger">
                      링크가 유효하지 않습니다
                    </h3>
                    <p className="description mt--20">
                      비밀번호 재설정 링크가 만료되었거나 유효하지 않습니다.
                      <br />
                      다시 비밀번호 재설정을 요청해주세요.
                    </p>
                    <div className="mt--30">
                      <Link
                        href="/auth/forgot-password"
                        className="rbt-btn btn-md btn-gradient"
                      >
                        비밀번호 재설정 다시 요청하기
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success message
  if (success) {
    return (
      <div className="rbt-elements-area bg-color-white rbt-section-gap">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="rbt-contact-form-area">
                <div className="rbt-form-wrapper">
                  <div className="text-center">
                    <div className="mb--20">
                      <i
                        className="feather-check-circle text-success"
                        style={{ fontSize: '48px' }}
                      ></i>
                    </div>
                    <h3 className="title">비밀번호가 재설정되었습니다</h3>
                    <p className="description mt--20">
                      새 비밀번호로 로그인할 수 있습니다.
                      <br />
                      잠시 후 로그인 페이지로 이동합니다...
                    </p>
                    <div className="mt--30">
                      <Link
                        href="/login"
                        className="rbt-btn btn-md btn-gradient"
                      >
                        지금 로그인하기
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Password reset form
  return (
    <div className="rbt-elements-area bg-color-white rbt-section-gap">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="rbt-contact-form-area">
              <form onSubmit={handleSubmit} className="rbt-form-wrapper">
                <div className="text-center mb--30">
                  <h3 className="title">새 비밀번호 설정</h3>
                  <p className="description mt--20">
                    안전한 새 비밀번호를 설정해주세요.
                  </p>
                </div>

                {error && (
                  <div className="alert alert-danger mb--20" role="alert">
                    {error}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="newPassword">새 비밀번호</label>
                  <div className="position-relative">
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="최소 8자, 대소문자 및 숫자 포함"
                      required
                      disabled={loading}
                      minLength={8}
                    />
                  </div>
                  <small className="form-text text-muted">
                    비밀번호는 대문자, 소문자, 숫자를 포함하여 8자 이상이어야
                    합니다.
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">비밀번호 확인</label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호를 다시 입력하세요"
                    required
                    disabled={loading}
                    minLength={8}
                  />
                </div>

                <div className="form-check mb--20">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="showPassword"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="showPassword">
                    비밀번호 표시
                  </label>
                </div>

                <div className="form-submit-group">
                  <button
                    type="submit"
                    className="rbt-btn btn-md btn-gradient hover-icon-reverse w-100"
                    disabled={loading}
                  >
                    <span className="icon-reverse-wrapper">
                      <span className="btn-text">
                        {loading ? '처리 중...' : '비밀번호 재설정'}
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
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="rbt-elements-area bg-color-white rbt-section-gap">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
