import { NextResponse } from 'next/server';
import { getServerClient } from '@/app/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { slug, excludeId } = await request.json();

    if (!slug) {
      return NextResponse.json({ available: false, error: 'Slug is required' });
    }

    const supabase = getServerClient();
    let query = supabase
      .from('courses')
      .select('id', { count: 'exact', head: true })
      .eq('slug', slug);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { count, error } = await query;

    if (error) {
      console.error('Error checking slug availability:', error);
      return NextResponse.json({
        available: false,
        error: error.message,
      });
    }

    const isAvailable = (count ?? 0) === 0;

    // If not available, suggest an alternative
    let suggestion = null;
    if (!isAvailable && count) {
      suggestion = `${slug}-${count + 1}`;
    }

    return NextResponse.json({
      available: isAvailable,
      suggestion,
    });
  } catch (error) {
    console.error('Slug check API error:', error);
    return NextResponse.json(
      {
        available: false,
        error: 'Server error occurred',
      },
      {
        status: 500,
      }
    );
  }
}
