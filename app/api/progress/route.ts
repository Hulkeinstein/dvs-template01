import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { updateLessonProgress } from '@/app/lib/adapters/progressAdapter';
import { z } from 'zod';

// Request validation schema
const ProgressUpdateSchema = z.object({
  lessonId: z.string().uuid(),
  enrollmentId: z.string().uuid(),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  progressPercentage: z.number().min(0).max(100).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request
    const body = await request.json();
    const validation = ProgressUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { lessonId, enrollmentId, status, progressPercentage } =
      validation.data;

    // Update progress (no debounce here, handled by client hook)
    await updateLessonProgress(
      session.user.id, // Use typed session
      lessonId,
      enrollmentId,
      status,
      progressPercentage
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Progress update error:', error);

    // Check for specific errors
    if (error instanceof Error) {
      if (error.message.includes('unauthorized')) {
        return NextResponse.json(
          { error: 'Unauthorized access to enrollment' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Health check endpoint
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
