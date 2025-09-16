import React from 'react';

interface PasswordGuidanceProps {
  authProvider?: string;
  hasPasswordHash: boolean;
}

/**
 * 사용자의 인증 상태에 따른 안내 메시지를 표시하는 컴포넌트
 */
export function PasswordGuidance({
  authProvider,
  hasPasswordHash,
}: PasswordGuidanceProps) {
  // Google OAuth 사용자이며 비밀번호가 설정되지 않은 경우
  if (authProvider === 'google' && !hasPasswordHash) {
    return (
      <div className="alert alert-info d-flex align-items-start mb-4">
        <i className="feather-info me-3 mt-1"></i>
        <div>
          <h5 className="mb-2">Google 계정으로 로그인 중</h5>
          <p className="mb-2">
            현재 Google 계정으로 안전하게 로그인하고 있습니다. 비밀번호를 추가로
            설정하면 더 많은 방법으로 로그인할 수 있습니다.
          </p>
          <p className="text-primary fw-semibold mb-0">
            <i className="feather-check-circle me-2"></i>
            최초 비밀번호 설정시 현재 비밀번호 입력이 필요 없습니다.
          </p>
        </div>
      </div>
    );
  }

  // Google과 비밀번호 모두 사용 가능한 경우
  if (authProvider === 'both') {
    return (
      <div className="alert alert-success d-flex align-items-center mb-4">
        <i className="feather-check-circle me-2"></i>
        <span className="fw-semibold">
          Google 계정과 비밀번호 모두 사용 가능합니다
        </span>
      </div>
    );
  }

  // Email only 사용자인 경우
  if (authProvider === 'email' && hasPasswordHash) {
    return (
      <div className="alert alert-secondary d-flex align-items-center mb-4">
        <i className="feather-lock me-2"></i>
        <span>이메일과 비밀번호로 로그인 중입니다</span>
      </div>
    );
  }

  return null;
}

export default PasswordGuidance;
