import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { supabaseServer as supabase } from '@/app/lib/supabase/server';
import { verifyOTP, normalizePhoneNumber } from '@/app/lib/utils/otp';

export async function POST(request) {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phone, otp } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    // 전화번호 정규화
    const normalizedPhone = normalizePhoneNumber(phone);
    if (!normalizedPhone) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // 가장 최근의 OTP 조회
    const { data: verificationData, error: fetchError } = await supabase
      .from('phone_verifications')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('phone', normalizedPhone)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError) {
      console.error(
        'Error fetching verification:',
        JSON.stringify(fetchError, null, 2)
      );
      return NextResponse.json(
        {
          error:
            'Database error. Please ensure phone_verifications table exists.',
          details: fetchError.message,
        },
        { status: 500 }
      );
    }

    if (!verificationData) {
      return NextResponse.json(
        {
          error: 'No verification code found. Please request a new one.',
        },
        { status: 404 }
      );
    }

    // 시도 횟수 확인 (최대 3회)
    if (verificationData.attempts >= 3) {
      return NextResponse.json(
        {
          error: 'Too many attempts. Please request a new code.',
        },
        { status: 429 }
      );
    }

    // 시도 횟수 증가
    await supabase
      .from('phone_verifications')
      .update({ attempts: verificationData.attempts + 1 })
      .eq('id', verificationData.id);

    // OTP 검증
    const verification = verifyOTP(
      otp,
      verificationData.otp,
      verificationData.expires_at
    );

    if (!verification.valid) {
      return NextResponse.json({ error: verification.error }, { status: 400 });
    }

    // 검증 성공 - verified 상태 업데이트
    await supabase
      .from('phone_verifications')
      .update({ verified: true })
      .eq('id', verificationData.id);

    // 사용자 프로필에 전화번호 업데이트 및 인증 상태 설정
    const { error: updateError } = await supabase
      .from('user')
      .update({
        phone: normalizedPhone,
        is_phone_verified: true, // 전화번호 인증 완료 상태로 업데이트
        is_profile_complete: true,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq('id', session.user.id);

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      return NextResponse.json(
        {
          error: 'Failed to update profile',
        },
        { status: 500 }
      );
    }

    // 사용된 OTP 삭제 (선택사항)
    await supabase
      .from('phone_verifications')
      .delete()
      .eq('id', verificationData.id);

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully',
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
