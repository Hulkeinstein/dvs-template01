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
     * 여기서 DB에 사용자 정보를 추가하거나 업데이트(upsert)합니다.
     */
    async signIn({ user, account, profile }) {
      try {
        const { error } = await supabase
          .from('user') // DB 테이블 이름 'user'(단수형)으로 수정
          .upsert({
            email: user.email,
            name: user.name,
            photo_url: user.image, // DB 필드명 'photo_url'로 수정
            // 처음 가입하는 사용자는 기본적으로 'student' 역할을 가집니다.
            // onConflict: 'email'은 이미 해당 이메일이 존재할 경우 업데이트합니다.
            role: 'student' 
          }, {
            onConflict: 'email', // 이메일이 중복될 경우 업데이트
            ignoreDuplicates: false,
          });

        if (error) {
          console.error('Supabase upsert error:', error);
          return false;
        }

        return true; // 로그인 성공
      } catch (e) {
        console.error('Sign in callback error:', e);
        return false; // 예외 발생 시 로그인 실패 처리
      }
    },
    
    /**
     * JWT 토큰이 생성되거나 업데이트될 때 호출됩니다.
     */
    async jwt({ token, user }) {
      try {
        const { data, error } = await supabase
          .from('user') // DB 테이블 이름 'user'(단수형)으로 수정
          .select('role') // 역할 필드명은 'role'으로 일치합니다.
          .eq('email', token.email) 
          .single();

        if (error || !data) {
          token.role = 'student'; 
        } else {
          token.role = data.role;
        }
      } catch (e) {
        console.error("Role lookup error:", e);
        token.role = 'student';
      }
      return token;
    },

    /**
     * 클라이언트 측에서 세션을 확인할 때 호출됩니다.
     */
    async session({ session, token }) {
      if (token && session.user) {
          session.user.role = token.role;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
