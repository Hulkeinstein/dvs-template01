import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClient } from '@supabase/supabase-js';
import twilio from 'twilio';
import { generateOTP, getOTPExpiryTime, normalizePhoneNumber } from '@/app/lib/utils/otp';

// Supabase 클라이언트
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Twilio 클라이언트 (환경변수가 설정된 경우에만 초기화)
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

export async function POST(request) {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phone } = await request.json();
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // 전화번호 정규화
    const normalizedPhone = normalizePhoneNumber(phone);
    if (!normalizedPhone) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }

    // Rate limiting: 같은 번호로 1분 내 재요청 방지
    const oneMinuteAgo = new Date();
    oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);

    const { data: recentVerifications } = await supabase
      .from('phone_verifications')
      .select('*')
      .eq('phone', normalizedPhone)
      .gte('created_at', oneMinuteAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (recentVerifications && recentVerifications.length > 0) {
      const secondsLeft = 60 - Math.floor((new Date() - new Date(recentVerifications[0].created_at)) / 1000);
      return NextResponse.json({ 
        error: `Please wait ${secondsLeft} seconds before requesting a new code` 
      }, { status: 429 });
    }

    // 전화번호 중복 체크
    const { data: existingUser } = await supabase
      .from('user')
      .select('id')
      .eq('phone', normalizedPhone)
      .neq('id', session.user.id)
      .single();

    if (existingUser) {
      return NextResponse.json({ 
        error: 'This phone number is already registered with another account' 
      }, { status: 409 });
    }

    // OTP 생성
    const otp = generateOTP();
    const expiresAt = getOTPExpiryTime(5); // 5분 후 만료

    // 이전 미사용 OTP 삭제
    await supabase
      .from('phone_verifications')
      .delete()
      .eq('user_id', session.user.id)
      .eq('verified', false);

    // 새 OTP 저장
    const { error: insertError } = await supabase
      .from('phone_verifications')
      .insert({
        user_id: session.user.id,
        phone: normalizedPhone,
        otp: otp,
        expires_at: expiresAt.toISOString(),
        verified: false,
        attempts: 0
      });

    if (insertError) {
      console.error('Error saving OTP:', insertError);
      return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
    }

    // SMS 전송
    if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
      try {
        await twilioClient.messages.create({
          body: `Your verification code is: ${otp}. It will expire in 5 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: normalizedPhone
        });
      } catch (twilioError) {
        console.error('Twilio error:', twilioError);
        // 개발 환경에서는 콘솔에 OTP 출력
        if (process.env.NODE_ENV === 'development') {
          console.log(`Development OTP for ${normalizedPhone}: ${otp}`);
        }
      }
    } else {
      // Twilio가 설정되지 않은 경우 (개발 환경)
      console.log(`Development OTP for ${normalizedPhone}: ${otp}`);
    }

    return NextResponse.json({ 
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 300 // 5분 (초 단위)
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}