import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'student' | 'instructor' | 'admin';
      phoneVerified?: boolean;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    role: 'student' | 'instructor' | 'admin';
    phoneVerified?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'student' | 'instructor' | 'admin';
    phoneVerified?: boolean;
  }
}
