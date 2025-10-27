import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { getServerClient } from '@/app/lib/supabase/server';

/**
 * GET /api/enrollments/check
 * 사용자의 코스 등록 여부 확인 (클라이언트 컴포넌트용)
 *
 * @param courseId - 코스 ID (query parameter)
 * @returns { isEnrolled: boolean, status: string | null }
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !courseId) {
      return NextResponse.json({ isEnrolled: false, status: null });
    }

    const supabase = getServerClient();
    const { data, error } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('user_id', session.user.id)
      .eq('course_id', courseId)
      .maybeSingle();

    if (error) {
      console.error('Error checking enrollment:', error);
      return NextResponse.json({ isEnrolled: false, status: null });
    }

    return NextResponse.json({
      isEnrolled: !!data,
      status: data?.status || null,
    });
  } catch (error) {
    console.error('Error in enrollment check API:', error);
    return NextResponse.json({ isEnrolled: false, status: null });
  }
}
