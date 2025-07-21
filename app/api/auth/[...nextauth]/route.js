import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from '@supabase/supabase-js';

// 환경 변수 확인 (초기 로드 시 한 번만)
if (!global._nextAuthInitialized) {
  console.log('NextAuth Configuration Check:');
  console.log('GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
  console.log('GOOGLE_CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);
  console.log('NEXTAUTH_SECRET exists:', !!process.env.NEXTAUTH_SECRET);
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  global._nextAuthInitialized = true;
}

// Supabase 클라이언트 생성
let supabase = null;
try {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase 환경 변수가 설정되지 않았습니다.');
  }
  
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
} catch (error) {
  console.error('Supabase 클라이언트 생성 오류:', error);
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user }) {
      if (!supabase) {
        console.error('Supabase 클라이언트가 초기화되지 않았습니다.');
        return false;
      }

      try {
        const { data, error } = await supabase
          .from('user')
          .select('email')
          .eq('email', user.email);

        if (error) { 
          console.error('Supabase select error:', error);
          return false; 
        }

        if (data && data.length > 0) {
          const { error: updateError } = await supabase
            .from('user')
            .update({ name: user.name, photo_url: user.image })
            .eq('email', user.email);
          if (updateError) { 
            console.error('Supabase update error:', updateError);
            return false; 
          }
        } else {
          const { error: insertError } = await supabase
            .from('user')
            .insert({
              email: user.email,
              name: user.name,
              photo_url: user.image,
              role: 'student'
            });
          if (insertError) { 
            console.error('Supabase insert error:', insertError);
            return false; 
          }
        }
        return true;
      } catch (e) {
        console.error('SignIn callback error:', e);
        return false;
      }
    },
    
    async jwt({ token, user }) {
      if (user && supabase) {
        try {
          const { data, error } = await supabase
            .from('user')
            .select('id, role')
            .eq('email', user.email)
            .single();

          if (error || !data) {
            console.error('JWT callback - user fetch error:', error);
            token.role = 'student';
          } else {
            token.id = data.id;
            token.role = data.role;
          }
        } catch (e) {
          console.error('JWT callback error:', e);
          token.role = 'student';
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
          session.user.id = token.id;
          session.user.role = token.role;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };