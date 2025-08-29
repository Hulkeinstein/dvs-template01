import type { Metadata } from 'next';
import { getAdminCourses } from './actions';
import CourseTable from '@/components/Admin/CourseManagement/CourseTable';
import CourseFilters from '@/components/Admin/CourseManagement/CourseFilters';
import type {
  CourseFilters as CourseFiltersType,
  CourseStatus,
} from '@/types/admin-course';

export const metadata: Metadata = {
  title: 'Course Management - Admin Dashboard',
  description: 'Manage courses, approvals, and categories',
};

interface PageProps {
  searchParams: {
    q?: string;
    status?: string;
    category?: string;
    instructorId?: string;
    sort?: string;
    page?: string;
    featured?: string;
  };
}

export default async function AdminCoursesPage({ searchParams }: PageProps) {
  // Parse filters from search params
  const filters: CourseFiltersType = {
    search: searchParams.q,
    status: (searchParams.status as CourseStatus | 'all') || 'all',
    category: searchParams.category,
    instructorId: searchParams.instructorId,
    sortBy: (searchParams.sort as any) || 'created_desc',
    page: Number(searchParams.page) || 1,
    isFeatured: searchParams.featured === 'true',
    limit: 20,
  };

  // Fetch courses
  const { courses, total, page, limit, totalPages } =
    await getAdminCourses(filters);

  return (
    <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
      <div className="content">
        <div className="section-title mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="rbt-title-style-3">Course Management</h4>
              <p className="b3 text-muted mb-0">
                Review, approve, and manage all courses on the platform
              </p>
            </div>
            <div className="d-flex gap-2">
              <a href="/create-course" className="rbt-btn btn-sm">
                <i className="feather-plus me-1"></i>
                New Course
              </a>
              <button
                className="rbt-btn btn-sm btn-outline-primary"
                onClick={() => window.location.reload()}
              >
                <i className="feather-refresh-cw"></i>
              </button>
            </div>
          </div>
        </div>

        <CourseFilters initialFilters={filters} />
        <CourseTable
          initialCourses={courses}
          total={total}
          currentPage={page}
          limit={limit}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
