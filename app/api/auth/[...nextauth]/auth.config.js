import GoogleProvider from 'next-auth/providers/google';
import { getServerClient } from '@/app/lib/supabase/server';

// Use server-side Supabase client
const getSupabaseClient = () => {
  try {
    return getServerClient();
  } catch (error) {
    console.warn('Supabase 환경 변수가 설정되지 않았습니다.');
    return null;
  }
};

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
      // 네트워크 타임아웃 증가 (기본 3.5초 → 10초)
      httpOptions: {
        timeout: 10000,
      },
      // Google OpenID configuration URL 직접 지정 (캐싱 효과)
      wellKnown: 'https://accounts.google.com/.well-known/openid-configuration',
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/auth/error', // 에러 페이지 경로 추가
  },
  debug: process.env.NODE_ENV === 'development', // 개발 환경에서 디버깅 활성화
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('=== SignIn Callback 시작 ===');
      console.log('User:', user);
      console.log('Account:', account);
      console.log('Profile:', profile);

      const supabase = getSupabaseClient();
      if (!supabase) {
        console.error('Supabase 클라이언트가 초기화되지 않았습니다.');
        return true; // Supabase 없이도 로그인 허용
      }

      try {
        // Supabase에서 사용자 조회
        const { data: existingUser, error: selectError } = await supabase
          .from('user')
          .select('id')
          .eq('email', user.email)
          .single();

        if (selectError && selectError.code !== 'PGRST116') {
          console.error('사용자 조회 오류:', selectError);
          return false;
        }

        // 사용자가 없으면 새로 생성
        if (!existingUser) {
          const { data: newUser, error: insertError } = await supabase
            .from('user')
            .insert([
              {
                email: user.email,
                name: user.name, // full_name이 아니라 name 컬럼 사용
                avatar_url: user.image,
                role: 'student', // 기본 역할을 학생으로 설정
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                joined_at: new Date().toISOString(), // 가입 시점 추가
              },
            ])
            .select()
            .single();

          if (insertError) {
            console.error('사용자 생성 오류:', insertError);
            return false;
          }

          console.log('새 사용자 생성 성공:', newUser);
        } else {
          console.log('기존 사용자 로그인:', existingUser);
        }

        return true;
      } catch (error) {
        console.error('로그인 처리 오류:', error);
        console.error('Error Stack:', error.stack);
        return false;
      }
    },

    async jwt({ token, user }) {
      // 초기 로그인 시 사용자 정보를 토큰에 추가
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;

        // Supabase에서 추가 사용자 정보 가져오기
        const supabase = getSupabaseClient();
        if (supabase) {
          try {
            const { data, error } = await supabase
              .from('user')
              .select('id, role, is_profile_complete')
              .eq('email', user.email)
              .single();

            if (error) {
              console.error('JWT callback - user fetch error:', error);
              token.role = 'student';
              token.isProfileComplete = false;
            } else {
              token.id = data.id;
              token.role = data.role;
              token.isProfileComplete = data.is_profile_complete || false;
            }
          } catch (e) {
            console.error('JWT callback error:', e);
            token.role = 'student';
            token.isProfileComplete = false;
          }
        } else {
          // Supabase가 없는 경우 기본값 설정
          token.role = 'student';
          token.isProfileComplete = false;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isProfileComplete = token.isProfileComplete;
      }
      return session;
    },
  },
};
