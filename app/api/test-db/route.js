import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  try {
    // Test if phone_verifications table exists
    const { data, error } = await supabase
      .from('phone_verifications')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Table check error:', error);
      return NextResponse.json({
        tableExists: false,
        error: error.message || 'Table not found',
        details: error,
      });
    }

    // Also check table structure
    const { data: tableInfo, error: infoError } = await supabase
      .rpc('get_table_columns', { table_name: 'phone_verifications' })
      .catch(() => ({ data: null, error: 'RPC function not available' }));

    return NextResponse.json({
      tableExists: true,
      message: 'phone_verifications table exists',
      sampleData: data,
      tableInfo: tableInfo || 'Unable to fetch table structure',
    });
  } catch (error) {
    console.error('Test DB error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
