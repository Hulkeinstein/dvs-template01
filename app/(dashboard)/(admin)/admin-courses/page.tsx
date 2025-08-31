import type { Metadata } from 'next';
import Link from 'next/link';
import { getAdminCourses } from './actions';
import CourseTable from '@/components/Admin/CourseManagement/CourseTable';
import CourseFilters from '@/components/Admin/CourseManagement/CourseFilters';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  DollarSign 
} from 'lucide-react';
import type {
  CourseFilters as CourseFiltersType,
  CourseStatus,
} from '@/types/admin-course';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'Course Management - Admin Dashboard',
  description: 'Review, approve, and manage all courses on the platform',
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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-card rounded-xl border border-border p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">
              Course Management
            </h1>
            <p className="mt-2 text-xl text-muted-foreground">
              Review, approve, and manage all courses on the platform
            </p>
          </div>
          <Link href="/create-course">
            <Button 
              size="lg"
              className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
            >
              <Plus className="h-6 w-6 mr-2" />
              New Course
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg text-muted-foreground">Total Courses</p>
              <p className="text-3xl font-bold text-foreground mt-2">{total}</p>
            </div>
            <div className="w-14 h-14 bg-blue-500/5 rounded-lg flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg text-muted-foreground">Published</p>
              <p className="text-3xl font-bold text-green-500 mt-2">
                {courses.filter(c => c.status === 'published').length}
              </p>
            </div>
            <div className="w-14 h-14 bg-green-500/5 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg text-muted-foreground">Pending</p>
              <p className="text-3xl font-bold text-yellow-500 mt-2">
                {courses.filter(c => c.status === 'pending').length}
              </p>
            </div>
            <div className="w-14 h-14 bg-yellow-500/5 rounded-lg flex items-center justify-center">
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg text-muted-foreground">Revenue</p>
              <p className="text-3xl font-bold text-foreground mt-2">$0</p>
            </div>
            <div className="w-14 h-14 bg-purple-500/5 rounded-lg flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-card rounded-xl border border-border p-6">
        <CourseFilters initialFilters={filters} />
      </div>

      {/* Table Section */}
      <div className="bg-card rounded-xl border border-border">
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