// SSO Start 페이지 - Admin 앱으로 안전한 인증 코드 전달
// Admin(3002) → 메인(3000) → 코드 생성 → POST로 Admin 전달

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { createAdminSSOCode } from '@/app/lib/auth/sso-issue';

// SSO 자동 POST 폼 컴포넌트
function SSOAutoSubmitForm({ code, returnUrl, to }) {
  return (
    <html>
      <head>
        <title>SSO 인증 중...</title>
      </head>
      <body
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h2>SSO 인증 중...</h2>
          <p>Admin 대시보드로 이동합니다.</p>
          <div style={{ marginTop: '20px' }}>
            <div
              className="spinner"
              style={{
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #3498db',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 1s linear infinite',
                margin: '0 auto',
              }}
            ></div>
          </div>
        </div>

        {/* 자동 제출 폼 (숨김) */}
        <form
          id="sso-form"
          method="POST"
          action={returnUrl}
          style={{ display: 'none' }}
        >
          <input type="hidden" name="code" value={code} />
          <input type="hidden" name="to" value={to} />
        </form>

        {/* CSS 애니메이션 */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>

        {/* 자동 제출 스크립트 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 폼 자동 제출
              document.getElementById('sso-form').submit();
              
              // 5초 후에도 페이지가 남아있으면 수동 제출 버튼 표시
              setTimeout(function() {
                var div = document.createElement('div');
                div.style.marginTop = '30px';
                div.innerHTML = '<p>자동 이동이 되지 않는다면:</p>' +
                  '<button onclick="document.getElementById(\\'sso-form\\').submit()" ' +
                  'style="padding: 10px 20px; background: #3498db; color: white; ' +
                  'border: none; border-radius: 5px; cursor: pointer;">' +
                  'Admin 대시보드로 이동</button>';
                document.querySelector('body > div').appendChild(div);
              }, 5000);
            `,
          }}
        />
      </body>
    </html>
  );
}

// SSO Start 페이지 메인 컴포넌트
export default async function SSOStartPage({ searchParams }) {
  // 1. URL 파라미터 추출
  const returnUrl =
    searchParams.return || 'http://localhost:3002/api/auth/sso/receive';
  const to = searchParams.to || '/admin-dashboard';

  // 2. 현재 세션 확인
  const session = await getServerSession(authOptions);

  // 3. 세션이 없으면 로그인 페이지로 리다이렉트
  if (!session?.user) {
    // 로그인 후 다시 SSO 프로세스로 돌아오도록 returnUrl 설정
    const loginUrl = new URL(
      '/login',
      process.env.NEXTAUTH_URL || 'http://localhost:3000'
    );
    loginUrl.searchParams.set(
      'callbackUrl',
      `/auth/sso/start?return=${encodeURIComponent(returnUrl)}&to=${encodeURIComponent(to)}`
    );
    redirect(loginUrl.toString());
  }

  // 4. Admin 권한 확인
  if (session.user.role !== 'admin') {
    return (
      <html>
        <body
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#e74c3c' }}>접근 권한 없음</h2>
            <p>Admin 권한이 필요합니다.</p>
            <p>현재 역할: {session.user.role || 'student'}</p>
            <a
              href="/dashboard"
              style={{
                display: 'inline-block',
                marginTop: '20px',
                padding: '10px 20px',
                background: '#3498db',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '5px',
              }}
            >
              대시보드로 돌아가기
            </a>
          </div>
        </body>
      </html>
    );
  }

  // 5. SSO 코드 생성 (RS256 서명)
  try {
    const code = await createAdminSSOCode({
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      name: session.user.name,
    });

    // 6. 자동 POST 폼 렌더링 및 제출
    return <SSOAutoSubmitForm code={code} returnUrl={returnUrl} to={to} />;
  } catch (error) {
    console.error('SSO 코드 생성 실패:', error);

    return (
      <html>
        <body
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#e74c3c' }}>SSO 인증 실패</h2>
            <p>인증 코드 생성 중 오류가 발생했습니다.</p>
            <details style={{ marginTop: '20px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer' }}>오류 상세</summary>
              <pre
                style={{
                  background: '#f4f4f4',
                  padding: '10px',
                  borderRadius: '5px',
                  overflow: 'auto',
                }}
              >
                {error.message}
              </pre>
            </details>
            <a
              href="/dashboard"
              style={{
                display: 'inline-block',
                marginTop: '20px',
                padding: '10px 20px',
                background: '#3498db',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '5px',
              }}
            >
              대시보드로 돌아가기
            </a>
          </div>
        </body>
      </html>
    );
  }
}
