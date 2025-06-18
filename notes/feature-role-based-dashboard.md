기능 요약: 역할 기반 대시보드 접근 제어
브랜치: feature/role-based-dashboard
이 브랜치는 사용자의 역할(학생, 교사)에 따라 특정 페이지에 대한 접근을 제어하고, 역할에 맞지 않는 사용자는 자동으로 올바른 페이지로 리디렉션하는 기능을 구현했습니다.
주요 변경 사항
1. 인증 및 역할 관리 (app/api/auth/[...nextauth]/route.js)
Supabase 연동: 사용자가 구글로 로그인할 때, Supabase 데이터베이스와 통신하도록 설정했습니다.
사용자 자동 등록: 처음 로그인하는 사용자는 user 테이블에 자동으로 정보가 기록되며, 기본 역할은 **'student'**로 설정됩니다.
세션에 역할 주입: 로그인 시 DB에서 사용자의 role 정보를 조회하여, NextAuth 세션 토큰에 역할을 포함시켰습니다. 이제 클라이언트와 서버 양쪽에서 사용자의 역할을 알 수 있습니다.
2. 역할 보호 컴포넌트 (components/Auth/RoleProtection.js)
보안 컴포넌트 생성: 특정 페이지나 레이아웃을 감싸서 접근 권한을 검사하는 <RoleProtection> 컴포넌트를 만들었습니다.
자동 리디렉션: 허용된 역할이 아닌 사용자가 페이지에 접근할 경우, 해당 사용자의 역할에 맞는 기본 대시보드 페이지로 자동으로 이동시킵니다.
Hydration 에러 해결: Next.js의 서버 렌더링과 클라이언트 렌더링 간의 불일치로 인해 발생했던 여러 Hydration Error를 해결하여 안정성을 높였습니다.
3. 대시보드 페이지 적용
instructor-dashboard와 student-dashboard의 메인 페이지(index.js) 내부 UI를 <RoleProtection> 컴포넌트로 감쌌습니다.
각 대시보드에 접근 가능한 역할을 allowedRoles prop으로 명시하여, 교사는 교사 페이지에만, 학생은 학생 페이지에만 접근할 수 있도록 설정했습니다.
향후 계획
현재 feature/role-based-dashboard 브랜치를 main 브랜치에 머지합니다.
main 브랜치에서 feature/dashboard-internal-pages와 같은 새 브랜치를 생성합니다.
새 브랜치에서 대시보드 내부의 모든 하위 기능 페이지(My Profile, My Courses 등) 개발을 진행합니다.
모든 기능 개발이 완료된 후, 메인 헤더의 메뉴를 "Dashboard" 하나로 통합하고, app/dashboard/page.js 리디렉션 페이지를 생성하여 최종적으로 기능을 완성합니다.
