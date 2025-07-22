import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    console.log('Updating with data:', data);

    // 임시 해결책: RPC 함수 사용
    if (data.username && !data.phone) {
      // username만 업데이트하는 경우
      const { error } = await supabase.rpc('update_user_username', {
        user_id: session.user.id,
        new_username: data.username
      });

      if (error) {
        console.error('RPC error:', error);
        // 폴백: 직접 SQL 실행
        const { error: sqlError } = await supabase
          .from('user')
          .update({ username: data.username })
          .eq('id', session.user.id);
        
        if (sqlError) {
          return NextResponse.json({ error: sqlError.message }, { status: 400 });
        }
      }
    } else {
      // 전체 프로필 업데이트
      const { error } = await supabase.rpc('update_user_profile', {
        user_id: session.user.id,
        new_username: data.username || null,
        new_phone: data.phone || null,
        new_skill_occupation: data.skill_occupation || null,
        new_bio: data.bio || null,
        new_is_profile_complete: data.is_profile_complete || null
      });

      if (error) {
        console.error('RPC error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}