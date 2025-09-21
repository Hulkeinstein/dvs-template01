'use server';

import { supabaseServer as supabase } from '@/app/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { revalidatePath } from 'next/cache';
import type {
  AdminCourse,
  CourseFilters,
  AdminCoursesResponse,
  CourseStatus,
  CourseActionResult,
} from '@/types/admin-course';

// Helper function to check admin permissions
async function assertAdmin(): Promise<string> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error('Unauthorized: Please login');
  }

  // Get user from database
  const { data: userData, error } = await supabase
    .from('user')
    .select('id, role')
    .eq('email', session.user.email)
    .single();

  if (error || !userData || userData.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  return userData.id;
}

// Helper function to log admin actions
async function logAdminAction(
  adminId: string,
  action: string,
  details: unknown
): Promise<void> {
  try {
    await supabase.from('admin_audit_logs').insert({
      admin_id: adminId,
      action,
      details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
    // Don't throw - logging failure shouldn't break the main action
  }
}

// Get all courses with filters, sorting, and pagination
export async function getAdminCourses(
  filters: CourseFilters = {}
): Promise<AdminCoursesResponse> {
  await assertAdmin();

  const {
    search,
    status = 'all',
    category,
    instructorId,
    isFeatured,
    sortBy = 'created_desc',
    page = 1,
    limit = 20,
  } = filters;

  // Build query
  let query = supabase
    .from('admin_courses_view')
    .select('*', { count: 'exact' });

  // Apply filters
  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  if (category) {
    query = query.eq('category', category);
  }

  if (instructorId) {
    query = query.eq('instructor_id', instructorId);
  }

  if (isFeatured !== undefined) {
    query = query.eq('is_featured', isFeatured);
  }

  // Apply sorting
  switch (sortBy) {
    case 'created_asc':
      query = query.order('created_at', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price', { ascending: false, nullsFirst: false });
      break;
    case 'price_asc':
      query = query.order('price', { ascending: true, nullsFirst: true });
      break;
    case 'enrollment_desc':
      query = query.order('actual_enrollment_count', { ascending: false });
      break;
    case 'enrollment_asc':
      query = query.order('actual_enrollment_count', { ascending: true });
      break;
    default: // created_desc
      query = query.order('created_at', { ascending: false });
  }

  // Apply pagination
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching courses:', error);
    throw new Error('Failed to fetch courses');
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    courses: (data as AdminCourse[]) || [],
    total,
    page,
    limit,
    totalPages,
  };
}

// Update course status (approve/suspend/archive)
export async function updateCourseStatus(
  courseId: string,
  status: CourseStatus
): Promise<CourseActionResult> {
  try {
    const adminId = await assertAdmin();

    // Get current course data for audit
    const { data: before, error: fetchError } = await supabase
      .from('courses')
      .select('status, title')
      .eq('id', courseId)
      .single();

    if (fetchError) {
      return { success: false, error: 'Course not found' };
    }

    // Update course status
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Set published_at when publishing
    if (status === 'published' && before.status !== 'published') {
      updateData.published_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', courseId)
      .select()
      .single();

    if (error) {
      return { success: false, error: 'Failed to update course status' };
    }

    // Log admin action
    await logAdminAction(adminId, 'course_status_change', {
      course_id: courseId,
      course_title: before.title,
      before: before.status,
      after: status,
    });

    // Revalidate affected pages
    revalidatePath('/admin-courses');
    revalidatePath(`/courses/${courseId}`);

    return { success: true, data: data as AdminCourse };
  } catch (error) {
    console.error('Error updating course status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
}

// Update course price
export async function updateCoursePrice(
  courseId: string,
  price: number
): Promise<CourseActionResult> {
  try {
    const adminId = await assertAdmin();

    // Validate price
    if (price < 0) {
      return { success: false, error: 'Price cannot be negative' };
    }

    // Get current course data for audit
    const { data: before, error: fetchError } = await supabase
      .from('courses')
      .select('price, title')
      .eq('id', courseId)
      .single();

    if (fetchError) {
      return { success: false, error: 'Course not found' };
    }

    // Update course price
    const { data, error } = await supabase
      .from('courses')
      .update({
        price,
        updated_at: new Date().toISOString(),
      })
      .eq('id', courseId)
      .select()
      .single();

    if (error) {
      return { success: false, error: 'Failed to update course price' };
    }

    // Log admin action
    await logAdminAction(adminId, 'course_price_change', {
      course_id: courseId,
      course_title: before.title,
      before: before.price,
      after: price,
    });

    // Revalidate affected pages
    revalidatePath('/admin-courses');
    revalidatePath(`/courses/${courseId}`);

    return { success: true, data: data as AdminCourse };
  } catch (error) {
    console.error('Error updating course price:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
}

// Update course category
export async function updateCourseCategory(
  courseId: string,
  category: string
): Promise<CourseActionResult> {
  try {
    const adminId = await assertAdmin();

    // Get current course data for audit
    const { data: before, error: fetchError } = await supabase
      .from('courses')
      .select('category, title')
      .eq('id', courseId)
      .single();

    if (fetchError) {
      return { success: false, error: 'Course not found' };
    }

    // Update course category
    const { data, error } = await supabase
      .from('courses')
      .update({
        category,
        updated_at: new Date().toISOString(),
      })
      .eq('id', courseId)
      .select()
      .single();

    if (error) {
      return { success: false, error: 'Failed to update course category' };
    }

    // Log admin action
    await logAdminAction(adminId, 'course_category_change', {
      course_id: courseId,
      course_title: before.title,
      before: before.category,
      after: category,
    });

    // Revalidate affected pages
    revalidatePath('/admin-courses');
    revalidatePath(`/courses/${courseId}`);

    return { success: true, data: data as AdminCourse };
  } catch (error) {
    console.error('Error updating course category:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
}

// Toggle featured status
export async function toggleCourseFeatured(
  courseId: string
): Promise<CourseActionResult> {
  try {
    const adminId = await assertAdmin();

    // Get current course data
    const { data: before, error: fetchError } = await supabase
      .from('courses')
      .select('is_featured, title')
      .eq('id', courseId)
      .single();

    if (fetchError) {
      return { success: false, error: 'Course not found' };
    }

    const newFeaturedStatus = !before.is_featured;

    // Update featured status
    const { data, error } = await supabase
      .from('courses')
      .update({
        is_featured: newFeaturedStatus,
        featured_until: newFeaturedStatus
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', courseId)
      .select()
      .single();

    if (error) {
      return { success: false, error: 'Failed to update featured status' };
    }

    // Log admin action
    await logAdminAction(adminId, 'course_featured_toggle', {
      course_id: courseId,
      course_title: before.title,
      before: before.is_featured,
      after: newFeaturedStatus,
    });

    // Revalidate affected pages
    revalidatePath('/admin-courses');
    revalidatePath('/courses');

    return { success: true, data: data as AdminCourse };
  } catch (error) {
    console.error('Error toggling featured status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred',
    };
  }
}

// Get course categories for filter dropdown
export async function getCourseCategories(): Promise<string[]> {
  await assertAdmin();

  const { data, error } = await supabase
    .from('courses')
    .select('category')
    .not('category', 'is', null)
    .order('category');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  // Get unique categories
  const uniqueCategories = [...new Set(data.map((item) => item.category))];
  return uniqueCategories.filter(Boolean) as string[];
}

// Get instructors for filter dropdown
export async function getInstructors(): Promise<
  Array<{ id: string; name: string; email: string }>
> {
  await assertAdmin();

  const { data, error } = await supabase
    .from('user')
    .select('id, name, email')
    .or('role.eq.instructor,role.eq.admin')
    .order('name');

  if (error) {
    console.error('Error fetching instructors:', error);
    return [];
  }

  return data.map((user) => ({
    id: user.id,
    name: user.name || user.email,
    email: user.email,
  }));
}
