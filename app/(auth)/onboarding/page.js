import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/app/lib/actions/getUserProfile";
import OnboardingClient from "./(onboarding)";

export const metadata = {
  title: "Complete Your Profile - DVS-TEMPLATE01",
  description: "Complete your profile to get started",
};

const OnboardingPage = async () => {
  const session = await getServerSession(authOptions);
  
  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  if (!session) {
    redirect('/login');
  }

  // 사용자 프로필 확인
  const userProfile = await getUserProfile(session.user.id);
  
  // 이미 프로필이 완성된 경우 대시보드로 리다이렉트
  if (userProfile?.is_profile_complete) {
    redirect('/dashboard');
  }

  return <OnboardingClient userProfile={userProfile} session={session} />;
};

export default OnboardingPage;