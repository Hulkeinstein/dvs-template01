'use client';

import { useState } from 'react';
import { requestPasswordReset } from '@/app/lib/actions/passwordActions';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setError('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await requestPasswordReset(email);
      if (result.success) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Error:', err);
      // Still show success for security reasons
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rbt-elements-area bg-color-white rbt-section-gap">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="rbt-contact-form-area">
                <div className="rbt-form-wrapper">
                  <div className="text-center mb--30">
                    <h3 className="title">이메일을 확인해주세요</h3>
                    <p className="description mt--20">
                      {email}로 비밀번호 재설정 안내를 발송했습니다.
                      <br />
                      이메일을 확인하여 비밀번호를 재설정해주세요.
                    </p>
                    <p className="description mt--20 text-muted">
                      <small>
                        이메일이 도착하지 않았다면 스팸 폴더를 확인해주세요.
                        <br />
                        계정이 존재하지 않는 경우 이메일이 발송되지 않습니다.
                      </small>
                    </p>
                    <div className="mt--30">
                      <Link
                        href="/login"
                        className="rbt-btn btn-md btn-gradient"
                      >
                        로그인 페이지로 돌아가기
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

  return (
    <div className="rbt-elements-area bg-color-white rbt-section-gap">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="rbt-contact-form-area">
              <form onSubmit={handleSubmit} className="rbt-form-wrapper">
                <div className="text-center mb--30">
                  <h3 className="title">비밀번호 재설정</h3>
                  <p className="description mt--20">
                    가입하신 이메일 주소를 입력하시면
                    <br />
                    비밀번호 재설정 링크를 보내드립니다.
                  </p>
                </div>

                {error && (
                  <div className="alert alert-danger mb--20" role="alert">
                    {error}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="email">이메일 주소</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-submit-group">
                  <button
                    type="submit"
                    className="rbt-btn btn-md btn-gradient hover-icon-reverse w-100"
                    disabled={loading}
                  >
                    <span className="icon-reverse-wrapper">
                      <span className="btn-text">
                        {loading ? '전송 중...' : '재설정 링크 보내기'}
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

                <div className="text-center mt--20">
                  <Link href="/login" className="rbt-btn-link">
                    로그인 페이지로 돌아가기
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
