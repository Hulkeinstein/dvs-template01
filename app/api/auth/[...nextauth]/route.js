import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 설정
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    /**
     * 사용자가 로그인에 성공했을 때 호출됩니다.
     * <<<--- 역할 초기화 문제를 해결하기 위해 이 부분을 수정했습니다. ---<<<
     */
    async signIn({ user, account, profile }) {
      try {
        // 1. 먼저 이메일로 기존 사용자가 있는지 확인합니다.
        const { data: existingUser, error: fetchError } = await supabase
          .from('user')
          .select('email') // 어떤 필드든 상관없지만, 가볍게 이메일만 확인합니다.
          .eq('email', user.email)
          .single();
        
        // "행을 찾을 수 없음" (PGRST116) 이외의 에러가 발생하면 로그인을 중단합니다.
        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Supabase select user error:', fetchError);
          return false;
        }

        // 2. 기존 사용자가 있는 경우
        if (existingUser) {
          // 역할(role)을 제외한 다른 정보만 업데이트합니다.
          const { error: updateError } = await supabase
            .from('user')
            .update({
              name: user.name,
              photo_url: user.image,
              // 'role' 필드는 여기에 포함하지 않아 기존 역할을 보존합니다.
            })
            .eq('email', user.email);

          if (updateError) {
            console.error('Supabase update error:', updateError);
            return false; // 업데이트 실패 시 로그인 중단
          }
        } 
        // 3. 신규 사용자인 경우
        else {
          // 새로운 사용자를 추가하면서, 이때만 기본 역할 'student'를 설정합니다.
          const { error: insertError } = await supabase
            .from('user')
            .insert({
              email: user.email,
              name: user.name,
              photo_url: user.image,
              role: 'student' // 신규 가입 시에만 역할 설정
            });

          if (insertError) {
            console.error('Supabase insert error:', insertError);
            return false; // 추가 실패 시 로그인 중단
          }
        }

        return true; // 모든 과정이 성공하면 로그인 허용
      } catch (e) {
        console.error('Sign in callback unexpected error:', e);
        return false;
      }
    },
    
    async jwt({ token, user }) {
      // DB에서 최신 역할 정보를 가져오는 로직 (기존과 동일)
      try {
        const { data } = await supabase
          .from('user')
          .select('role')
          .eq('email', token.email)
          .single();
        token.role = data?.role || 'student';
      } catch (e) {
        token.role = 'student';
      }
      return token;
    },

    async session({ session, token }) {
      // 세션에 역할 정보를 포함시키는 로직 (기존과 동일)
      if (token && session.user) {
          session.user.role = token.role;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
