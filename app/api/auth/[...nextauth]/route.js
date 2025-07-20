import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// <<<--- 문제의 원인이었던 이 부분을 수정했습니다. ---<<<
// Supabase 클라이언트를 올바른 방식으로 import 합니다.
import { supabase } from '@/app/lib/supabase/client';

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
    async signIn({ user }) {
      try {
        const { data, error } = await supabase
          .from('user')
          .select('email')
          .eq('email', user.email);

        if (error) { return false; }

        if (data && data.length > 0) {
          const { error: updateError } = await supabase
            .from('user')
            .update({ name: user.name, photo_url: user.image })
            .eq('email', user.email);
          if (updateError) { return false; }
        } else {
          const { error: insertError } = await supabase
            .from('user')
            .insert({
              email: user.email,
              name: user.name,
              photo_url: user.image,
              role: 'student'
            });
          if (insertError) { return false; }
        }
        return true;
      } catch (e) {
        return false;
      }
    },
    
    async jwt({ token, user }) {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user')
            .select('role')
            .eq('email', user.email)
            .single();

          if (error || !data) {
            token.role = 'student';
          } else {
            token.role = data.role;
          }
        } catch (e) {
          token.role = 'student';
        }
      }
      return token;
    },

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
