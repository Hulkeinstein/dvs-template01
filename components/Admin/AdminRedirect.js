'use client';

import { useEffect } from 'react';

const AdminRedirect = ({ adminUrl }) => {
  useEffect(() => {
    // 클라이언트 사이드에서 리디렉트 수행
    if (adminUrl && typeof window !== 'undefined') {
      // 약간의 지연을 주어 브라우저가 준비되도록 함
      setTimeout(() => {
        window.location.href = adminUrl;
      }, 100);
    }
  }, [adminUrl]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <h2 style={{ marginBottom: '20px' }}>관리자 대시보드로 이동 중...</h2>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        잠시만 기다려 주세요
      </p>
      <div style={{ marginTop: '20px' }}>
        <p style={{ fontSize: '14px', color: '#999' }}>
          자동으로 이동되지 않는다면{' '}
          <a
            href={adminUrl}
            style={{ color: '#0070f3', textDecoration: 'underline' }}
          >
            여기를 클릭
          </a>
          하세요
        </p>
      </div>
    </div>
  );
};

export default AdminRedirect;
