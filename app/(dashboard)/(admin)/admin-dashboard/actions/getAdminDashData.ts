'use server';

import { supabase } from '@/app/lib/supabase/server';
import {
  AdminDashboardData,
  KPIData,
  LinePoint,
  Series,
  ActivityItem,
  TopCourse,
} from '@/types/dashboard';
import { format, subDays } from 'date-fns';

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  try {
    // Parallel queries for better performance
    const [
      usersData,
      coursesData,
      enrollmentsData,
      recentActivityData,
      topCoursesData,
    ] = await Promise.all([
      // User statistics
      supabase.from('user').select('id, created_at, role, last_sign_in_at'),

      // Course statistics
      supabase
        .from('courses')
        .select('id, created_at, status, price, instructor_id'),

      // Enrollment statistics
      supabase
        .from('enrollments')
        .select('id, created_at, progress, course_id'),

      // Recent activity (last 20 activities)
      supabase
        .from('user')
        .select('id, created_at, role, display_name')
        .order('created_at', { ascending: false })
        .limit(20),

      // Top courses by enrollment
      supabase
        .from('courses')
        .select(
          `
          id,
          title,
          price,
          status,
          instructor_id,
          enrollments(count)
        `
        )
        .limit(10),
    ]);

    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    // const sevenDaysAgo = subDays(today, 7); // For future use with activeUsersWeek

    // Process user data
    const users = usersData.data || [];
    const totalUsers = users.length;
    // These might be needed for future features - keeping for reference
    // const totalInstructors = users.filter(
    //   (u: any) => u.role === 'instructor'
    // ).length;
    // const totalStudents = users.filter((u: any) => u.role === 'student').length;
    // const newUsersToday = users.filter(
    //   (u: any) => new Date(u.created_at).toDateString() === today.toDateString()
    // ).length;
    // const activeUsersWeek = users.filter(
    //   (u: any) =>
    //     u.last_sign_in_at && new Date(u.last_sign_in_at) >= sevenDaysAgo
    // ).length;

    // Process course data
    const courses = coursesData.data || [];
    // const totalCourses = courses.length; // For future dashboard metrics
    const activeCourses = courses.filter(
      (c: any) => c.status === 'published'
    ).length;

    // Process enrollment data
    const enrollments = enrollmentsData.data || [];
    const totalEnrollments = enrollments.length;

    // Calculate revenue (simplified - you may want to use orders table)
    const totalRevenue = courses.reduce((sum: number, course: any) => {
      const courseEnrollments = enrollments.filter(
        (e: any) => e.course_id === course.id
      ).length;
      return sum + course.price * courseEnrollments;
    }, 0);

    // Generate KPIs with trends
    const kpis: KPIData[] = [
      {
        label: 'Total Users',
        value: totalUsers,
        deltaPct: calculateGrowthRate(users, thirtyDaysAgo),
        direction: getDirection(calculateGrowthRate(users, thirtyDaysAgo)),
        icon: 'feather-users',
        color: 'primary',
        sparkline: generateSparkline(users, 7),
      },
      {
        label: 'Active Courses',
        value: activeCourses,
        deltaPct: calculateGrowthRate(
          courses.filter((c: any) => c.status === 'published'),
          thirtyDaysAgo
        ),
        direction: getDirection(
          calculateGrowthRate(
            courses.filter((c: any) => c.status === 'published'),
            thirtyDaysAgo
          )
        ),
        icon: 'feather-monitor',
        color: 'success',
        sparkline: generateSparkline(
          courses.filter((c: any) => c.status === 'published'),
          7
        ),
      },
      {
        label: 'Total Enrollments',
        value: totalEnrollments,
        deltaPct: calculateGrowthRate(enrollments, thirtyDaysAgo),
        direction: getDirection(
          calculateGrowthRate(enrollments, thirtyDaysAgo)
        ),
        icon: 'feather-check-square',
        color: 'violet',
        sparkline: generateSparkline(enrollments, 7),
      },
      {
        label: 'Monthly Revenue',
        value: totalRevenue,
        deltaPct: 15.2, // Mock data - implement actual calculation
        direction: 'up',
        icon: 'feather-dollar-sign',
        color: 'coral',
      },
    ];

    // Generate user growth data (last 30 days)
    const userGrowthData: LinePoint[] = generateTimeSeriesData(users, 30);

    // Generate revenue data (last 30 days) - mock data
    const revenueData: LinePoint[] = Array.from({ length: 30 }, (_, i) => ({
      name: format(subDays(today, 29 - i), 'MMM dd'),
      value: Math.floor(Math.random() * 5000) + 2000,
    }));

    // Course distribution by status
    const courseDistribution: Series[] = [
      {
        label: 'Published',
        value: courses.filter((c: any) => c.status === 'published').length,
      },
      {
        label: 'Draft',
        value: courses.filter((c: any) => c.status === 'draft').length,
      },
      {
        label: 'Archived',
        value: courses.filter((c: any) => c.status === 'archived').length,
      },
    ].filter((item) => item.value > 0);

    // Course enrollments bar chart data
    const courseBarData: Series[] =
      topCoursesData.data?.slice(0, 5).map((course: any) => ({
        label: course.title?.substring(0, 20) || 'Unknown',
        value: course.enrollments?.[0]?.count || 0,
      })) || [];

    // Recent activity
    const recentActivity: ActivityItem[] = (recentActivityData.data || []).map(
      (item: any) => ({
        id: item.id,
        type: item.role === 'instructor' ? 'user' : 'enrollment',
        message: `New ${item.role} registered: ${item.display_name || 'Unknown User'}`,
        timestamp: item.created_at,
        icon:
          item.role === 'instructor' ? 'feather-award' : 'feather-user-plus',
      })
    );

    // Top courses
    const topCourses: TopCourse[] = await Promise.all(
      (topCoursesData.data || []).map(async (course: any) => {
        // Get instructor name
        const { data: instructor } = await supabase
          .from('user')
          .select('display_name')
          .eq('id', course.instructor_id)
          .single();

        const enrollmentCount = course.enrollments?.[0]?.count || 0;

        return {
          id: course.id,
          title: course.title || 'Unknown Course',
          instructor: instructor?.display_name || 'Unknown Instructor',
          enrollments: enrollmentCount,
          revenue: course.price * enrollmentCount,
          rating: Math.random() * 2 + 3, // Mock rating 3-5
          status: course.status as 'active' | 'pending' | 'archived',
        };
      })
    );

    return {
      kpis,
      userGrowthData,
      revenueData,
      courseDistribution,
      courseBarData,
      recentActivity,
      topCourses,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    // Return empty/default data structure on error
    return {
      kpis: [],
      userGrowthData: [],
      revenueData: [],
      courseDistribution: [],
      courseBarData: [],
      recentActivity: [],
      topCourses: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

// Helper functions
function calculateGrowthRate(items: any[], compareDate: Date): number {
  const recent = items.filter(
    (item) => new Date(item.created_at) >= compareDate
  ).length;
  const older = items.filter(
    (item) => new Date(item.created_at) < compareDate
  ).length;

  if (older === 0) return 100;
  return Math.round(((recent - older) / older) * 100 * 10) / 10;
}

function getDirection(growth: number): 'up' | 'down' | 'stable' {
  if (growth > 5) return 'up';
  if (growth < -5) return 'down';
  return 'stable';
}

function generateSparkline(items: any[], days: number): number[] {
  const sparkline: number[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const count = items.filter((item) => {
      const itemDate = new Date(item.created_at);
      return itemDate.toDateString() === date.toDateString();
    }).length;
    sparkline.push(count);
  }

  return sparkline;
}

function generateTimeSeriesData(items: any[], days: number): LinePoint[] {
  const data: LinePoint[] = [];
  const today = new Date();
  let cumulative = 0;

  // Count items before the period
  const startDate = subDays(today, days);
  cumulative = items.filter(
    (item) => new Date(item.created_at) < startDate
  ).length;

  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dailyCount = items.filter((item) => {
      const itemDate = new Date(item.created_at);
      return itemDate.toDateString() === date.toDateString();
    }).length;

    cumulative += dailyCount;

    data.push({
      name: format(date, 'MMM dd'),
      value: cumulative,
    });
  }

  return data;
}
