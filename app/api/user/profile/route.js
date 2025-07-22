import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 생성
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 현재 데이터베이스에 존재하는 필드만 업데이트하는 헬퍼 함수
async function getExistingColumns() {
  try {
    // user 테이블의 첫 번째 행을 가져와서 어떤 컬럼이 있는지 확인
    const { data, error } = await supabase
      .from('user')
      .select('*')
      .limit(1);
    
    if (error || !data || data.length === 0) {
      // 기본 필드만 반환
      return ['id', 'email', 'name', 'photo_url', 'role', 'created_at', 'username', 'phone', 'is_profile_complete', 'onboarding_completed_at'];
    }
    
    return Object.keys(data[0]);
  } catch (error) {
    console.error('Error fetching columns:', error);
    return ['id', 'email', 'name', 'photo_url', 'role', 'created_at', 'username', 'phone', 'is_profile_complete', 'onboarding_completed_at'];
  }
}

export async function PUT(request) {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // session.user.id가 없으면 email로 사용자 찾기
    let userId = session.user.id;
    
    if (!userId && session.user.email) {
      console.log('User ID not in session, fetching by email:', session.user.email);
      const { data: userData, error: userError } = await supabase
        .from('user')
        .select('id')
        .eq('email', session.user.email)
        .single();
      
      if (userError || !userData) {
        console.error('Failed to fetch user by email:', userError);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      userId = userData.id;
      console.log('Found user ID:', userId);
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }

    const data = await request.json();

    // 현재 존재하는 컬럼 확인
    const existingColumns = await getExistingColumns();
    console.log('Existing columns:', existingColumns);

    // 업데이트할 필드 준비
    const updateData = {};
    
    // Username 필드 처리 (선택사항)
    if (data.username !== undefined) {
      // Username이 제공되면 중복 체크
      if (data.username.trim()) {
        const { data: existingUser } = await supabase
          .from('user')
          .select('id')
          .eq('username', data.username)
          .neq('id', userId)
          .single();
        
        if (existingUser) {
          return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
        }
        updateData.username = data.username.trim();
      } else {
        // 빈 문자열이면 null로 설정
        updateData.username = null;
      }
    }

    if (data.phone !== undefined) {
      if (!data.phone.trim()) {
        return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
      }
      updateData.phone = data.phone.trim();
    }

    // 선택 필드 - 존재하는 컬럼만 업데이트
    const optionalFields = [
      'skill_occupation',
      'bio',
      'first_name',
      'last_name',
      'name',
      'facebook_url',
      'twitter_url',
      'linkedin_url',
      'website_url',
      'github_url'
    ];

    optionalFields.forEach(field => {
      if (data[field] !== undefined && existingColumns.includes(field)) {
        updateData[field] = data[field].trim();
      }
    });

    // 프로필 완성 상태 체크
    if (existingColumns.includes('is_profile_complete')) {
      const { data: currentUser } = await supabase
        .from('user')
        .select('username, phone')
        .eq('id', userId)
        .single();

      const willHaveUsername = updateData.username || currentUser?.username;
      const willHavePhone = updateData.phone || currentUser?.phone;

      if (willHaveUsername && willHavePhone) {
        updateData.is_profile_complete = true;
        if (existingColumns.includes('onboarding_completed_at')) {
          updateData.onboarding_completed_at = new Date().toISOString();
        }
      }
    }

    // 업데이트할 필드가 없으면 성공으로 처리 (Skip 기능을 위해)
    if (Object.keys(updateData).length === 0) {
      console.log('No fields to update, returning current user data');
      
      // 현재 사용자 정보 반환
      const { data: currentUser, error: fetchError } = await supabase
        .from('user')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (fetchError) {
        return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
      }
      
      return NextResponse.json({ 
        success: true, 
        user: currentUser,
        profileComplete: currentUser.is_profile_complete || false
      });
    }

    console.log('Updating with data:', updateData);
    console.log('User ID for update:', userId);

    // 사용자 정보 업데이트
    const { data: updatedUser, error } = await supabase
      .from('user')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ 
        error: 'Failed to update profile', 
        details: error.message 
      }, { status: 500 });
    }

    console.log('Update successful:', updatedUser);

    return NextResponse.json({ 
      success: true, 
      user: updatedUser,
      profileComplete: updateData.is_profile_complete || false
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // session.user.id가 없으면 email로 사용자 찾기
    let userId = session.user.id;
    
    if (!userId && session.user.email) {
      const { data: userData, error: userError } = await supabase
        .from('user')
        .select('id')
        .eq('email', session.user.email)
        .single();
      
      if (userError || !userData) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      userId = userData.id;
    }
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from('user')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}