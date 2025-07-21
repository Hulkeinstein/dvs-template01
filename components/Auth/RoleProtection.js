"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const RoleProtection = ({ allowedRoles, children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // 이 훅은 컴포넌트가 클라이언트(브라우저)에 마운트된 후에만 isMounted를 true로 설정합니다.
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 페이지 이동(navigation) 로직을 이 useEffect 안에서만 처리합니다.
  // 이 훅은 렌더링이 완료된 후에만 실행되므로 안전합니다.
  useEffect(() => {
    // 1. 컴포넌트가 마운트되지 않았거나, 세션 정보를 아직 로딩 중이면 아무것도 하지 않습니다.
    if (!isMounted || status === "loading") {
      return;
    }

    // 2. 로그인하지 않은 사용자라면 로그인 페이지로 보냅니다.
    if (!session) {
      router.push("/login");
      return;
    }

    // 3. 로그인이 완료되었다면, 역할을 확인하고 리디렉션합니다.
    const userRole = session.user?.role;
    if (!allowedRoles.includes(userRole)) {
      // 통합 대시보드로 리다이렉트
      router.push('/dashboard');
    }
  }, [isMounted, status, session, router, allowedRoles]);

  // --- 렌더링 로직 (무엇을 화면에 보여줄지만 결정) ---

  // 1. 컴포넌트가 마운트 되기 전(서버 렌더링 포함)에는 아무것도 렌더링하지 않습니다.
  //    이것이 Hydration 에러를 막는 가장 중요한 부분입니다.
  if (!isMounted) {
    return null;
  }

  // 2. 세션 정보를 가져오는 중이거나, 사용자가 아직 인증되지 않았다면 로딩 화면을 표시합니다.
  //    이 상태는 리디렉션이 처리되는 동안에도 유지됩니다.
  if (status !== "authenticated") {
    return <div>Loading...</div>;
  }

  // 3. 사용자가 인증되었고, 역할도 일치하는 경우에만 페이지 내용을 보여줍니다.
  if (allowedRoles.includes(session.user?.role)) {
    return <>{children}</>;
  }

  // 4. 역할이 일치하지 않아 리디렉션이 필요한 경우에도 로딩 화면을 보여줍니다.
  return <div>Loading...</div>;
};

export default RoleProtection;