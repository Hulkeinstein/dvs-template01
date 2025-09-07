'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type ErrorType = 'AccessDenied' | 'Configuration' | 'Verification' | string;

interface ErrorInfo {
  title: string;
  message: string;
  details: string[];
}

const AuthErrorPage: React.FC = () => {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') as ErrorType | null;
  const [currentUrl, setCurrentUrl] = useState<string>('');

  const getErrorMessage = (): ErrorInfo => {
    switch (error) {
      case 'AccessDenied':
        return {
          title: 'Google 로그인 실패',
          message: 'Google 계정으로 로그인할 수 없습니다.',
          details: [
            'Google OAuth 설정이 올바른지 확인하세요',
            'Google Cloud Console에서 OAuth 동의 화면이 구성되어 있는지 확인하세요',
            '승인된 리디렉션 URI에 http://localhost:3000/api/auth/callback/google 이 포함되어 있는지 확인하세요',
            '브라우저의 쿠키와 캐시를 삭제하고 다시 시도해보세요',
          ],
        };
      case 'Configuration':
        return {
          title: '설정 오류',
          message: '인증 설정에 문제가 있습니다.',
          details: [
            '환경 변수가 올바르게 설정되었는지 확인하세요',
            'GOOGLE_CLIENT_ID와 GOOGLE_CLIENT_SECRET이 설정되었는지 확인하세요',
            'NEXTAUTH_SECRET이 설정되었는지 확인하세요',
          ],
        };
      case 'Verification':
        return {
          title: '인증 실패',
          message: '이메일 인증에 실패했습니다.',
          details: [
            'Google 계정의 이메일이 유효한지 확인하세요',
            '다시 로그인을 시도해보세요',
          ],
        };
      default:
        return {
          title: '로그인 오류',
          message: '로그인 중 오류가 발생했습니다.',
          details: [
            '잠시 후 다시 시도해주세요',
            '문제가 지속되면 관리자에게 문의하세요',
          ],
        };
    }
  };

  const errorInfo = getErrorMessage();

  useEffect(() => {
    // 클라이언트 사이드에서만 URL 설정
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-color-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6">
            <div className="rbt-contact-form contact-form-style-1 max-width-auto">
              <div className="text-center mb-5">
                <div className="mb-4">
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10"
                    style={{ width: '80px', height: '80px' }}
                  >
                    <i
                      className="feather-alert-triangle text-danger"
                      style={{ fontSize: '40px' }}
                    ></i>
                  </div>
                </div>
                <h2 className="title">{errorInfo.title}</h2>
                <p className="description text-muted mt-3">
                  {errorInfo.message}
                </p>
              </div>

              <div className="bg-color-white rounded p-4 mb-4">
                <h5 className="mb-3">해결 방법:</h5>
                <ul className="rbt-list-style-1">
                  {errorInfo.details.map((detail, index) => (
                    <li key={index} className="mb-2">
                      <i className="feather-check text-success me-2"></i>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              {error === 'AccessDenied' && (
                <div className="bg-gradient-6 rounded p-4 mb-4">
                  <h6 className="mb-3 text-dark">💡 참고사항</h6>
                  <p className="text-dark mb-0">
                    처음 방문하시는 경우, Google 계정으로 로그인하시면 자동으로
                    회원가입이 진행됩니다. 별도의 회원가입 절차는 필요하지
                    않습니다.
                  </p>
                </div>
              )}

              <div className="form-submit-group">
                <Link
                  href="/login"
                  className="rbt-btn btn-md btn-gradient hover-icon-reverse w-100"
                >
                  <span className="icon-reverse-wrapper">
                    <span className="btn-text">다시 로그인하기</span>
                    <span className="btn-icon">
                      <i className="feather-arrow-right"></i>
                    </span>
                    <span className="btn-icon">
                      <i className="feather-arrow-right"></i>
                    </span>
                  </span>
                </Link>
              </div>

              <div className="text-center mt-4">
                <Link href="/" className="text-secondary">
                  홈페이지로 돌아가기
                </Link>
              </div>

              {/* 디버깅 정보 (개발 환경에서만 표시) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-5 p-3 bg-light rounded">
                  <small className="text-muted">
                    <strong>Debug Info:</strong>
                    <br />
                    Error Code: {error || 'unknown'}
                    <br />
                    {currentUrl && <>URL: {currentUrl}</>}
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthErrorPage;
