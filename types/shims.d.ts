// Supabase 클라이언트 (실행은 모킹/런타임에서 처리, 여기선 타입만 막음)
declare module '@/app/lib/supabase/client' {
  const client: any;
  export default client;
  export const supabase: any;
}

// 서버 액션들
declare module '@/app/lib/actions/*' {
  const anyModule: any;
  export = anyModule;
}

// 전역 타입 모듈
declare module '@/types' {
  export type ContentItem = { 
    id: string;
    content_type: string;
    [key: string]: any;
  };
  export type UserProfile = { phone?: string; [key: string]: any };
  export type Lesson = any;
  export type CourseTopic = any;
  export type User = any;
}