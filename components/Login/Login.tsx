'use client';

import React, { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="row gy-5 row--30">
      {/* 왼쪽: 로그인 영역 */}
      <div className="col-lg-6">
        <div className="rbt-contact-form contact-form-style-1 max-width-auto">
          <h3 className="title">시작하기</h3>
          <p className="description mb--20 text-muted">
            <span className="text-secondary">Google 계정으로 시작</span>하세요.
            <br />
            <strong>
              처음 방문하시는 분도 자동으로 회원가입이 진행됩니다.
            </strong>
            <br />
            <br />
            정회원이 되시면{' '}
            <strong className="text-secondary">
              @danielvisionschool.org
            </strong>{' '}
            계정을 발급받게 됩니다.
          </p>

          <div className="form-submit-group">
            <button
              type="button"
              className="rbt-btn btn-md btn-gradient hover-icon-reverse w-100"
              onClick={() => signIn('google', { callbackUrl: '/' })}
            >
              <span className="icon-reverse-wrapper">
                <span className="btn-text">Google로 시작하기</span>
                <span className="btn-icon">
                  <i className="feather-arrow-right"></i>
                </span>
                <span className="btn-icon">
                  <i className="feather-arrow-right"></i>
                </span>
              </span>
            </button>
          </div>

          <div className="d-flex align-items-center my-4">
            <hr className="flex-grow-1" />
            <span className="px-3 text-muted">또는</span>
            <hr className="flex-grow-1" />
          </div>

          {/* 이메일 로그인 폼 */}
          <form onSubmit={handleEmailLogin}>
            {error && (
              <div className="alert alert-danger mb-3" role="alert">
                {error}
              </div>
            )}

            <div className="rbt-form-group">
              <label htmlFor="email">이메일</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
              />
            </div>

            <div className="rbt-form-group">
              <label htmlFor="password">비밀번호</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                required
              />
            </div>

            <div className="form-submit-group mt--20">
              <button
                type="submit"
                className="rbt-btn btn-md btn-border hover-icon-reverse w-100"
                disabled={loading}
              >
                <span className="icon-reverse-wrapper">
                  <span className="btn-text">
                    {loading ? '로그인 중...' : '이메일로 로그인'}
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

            <div className="text-center mt-3">
              <Link href="/forgot-password" className="rbt-btn-link">
                비밀번호를 잊으셨나요?
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* 오른쪽: 정회원 안내 영역 */}
      <div className="col-lg-6">
        <div className="rbt-contact-form contact-form-style-1 max-width-auto">
          <h3 className="title">정회원 안내</h3>
          <p className="description text-muted">
            유료 등록 시{' '}
            <strong className="text-secondary">danielvisionschool.org</strong>{' '}
            도메인 계정을 통해
            <br />
            <span className="text-secondary">프리미엄 강의</span> 및{' '}
            <span className="text-secondary">특화된 콘텐츠</span>를 이용하실 수
            있습니다.
          </p>
          <ul className="rbt-list-style-1 mt--20">
            <li>📘 프리미엄 훈련 과정</li>
            <li>📁 개인 대시보드</li>
            <li>🎓 수료 증명서 발급</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
