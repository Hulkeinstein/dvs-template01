import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getServerClient } from '@/app/lib/supabase/server';
import { NextAuthOptions, User, Account, Profile } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import bcrypt from 'bcrypt';

// Use server-side SupabaseClient
const getSupabaseClient = () => {
  try {
    return getServerClient();
  } catch {
    console.warn('Supabase 환경 변수가 설정되지 않았습니다.');
    return null;
  }
};

export const authOptions: NextAuthOptions = {
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
    CredentialsProvider({
      id: 'credentials',
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const supabase = getSupabaseClient();
        if (!supabase) {
          throw new Error('Database connection failed');
        }

        // Supabase에서 사용자 조회
        const { data: user } = await (supabase as any)
          .from('user')
          .select('id, email, name, role, password_hash, auth_provider')
          .eq('email', credentials.email)
          .single();

        if (!user || !user.password_hash) {
          return null; // 사용자 없음 또는 비밀번호 미설정
        }

        // 비밀번호 검증
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: null, // Credentials 로그인 시 이미지는 별도 로드 필요할 수 있음
          role: user.role || 'student',
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/auth/error', // 에러 페이지 경로 추가
  },
  debug: process.env.NODE_ENV === 'development', // 개발 환경에서 디버깅 활성화
  callbacks: {
    async signIn({
      user,
    }: {
      user: User;
      account: Account | null;
      profile?: Profile;
    }) {
      const supabase = getSupabaseClient();
      if (!supabase) {
        console.error('Supabase 클라이언트가 초기화되지 않았습니다.');
        return true; // Supabase 없이도 로그인 허용
      }

      try {
        if (!user.email) return false;

        // Supabase에서 사용자 조회
        // Note: Using any for supabase response to avoid strict typing issues with the client instance for now
        const { data: existingUser, error: selectError } = await (
          supabase as any
        )
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
          const { data: newUser, error: insertError } = await (supabase as any)
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
      } catch (error: any) {
        console.error('로그인 처리 오류:', error);
        console.error('Error Stack:', error.stack);
        return false;
      }
    },

    async jwt({ token, user }: { token: JWT; user?: User }) {
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
            const { data, error } = await (supabase as any)
              .from('user')
              .select('id, role, is_profile_complete')
              .eq('email', user.email)
              .single();

            if (error) {
              console.error('JWT callback - user fetch error:', error);
              token.role = 'student';
            } else {
              token.id = data.id;
              token.role = data.role;
              // Add custom property if needed, but extend JWT type first if so.
              // token.isProfileComplete = data.is_profile_complete || false;
            }
          } catch (e) {
            console.error('JWT callback error:', e);
            token.role = 'student';
          }
        } else {
          // Supabase가 없는 경우 기본값 설정
          token.role = 'student';
        }
      }
      return token;
    },

    async session({ session, token }: { session: any; token: JWT }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        // session.user.isProfileComplete = token.isProfileComplete;
      }
      return session;
    },
  },
};
