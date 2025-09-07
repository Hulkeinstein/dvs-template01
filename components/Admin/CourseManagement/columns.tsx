'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber, getInitials } from './utils';
import type { AdminCourse } from '@/types/admin-course';
import { CourseRowActions } from './row-actions';

function StatusBadge({ status }: { status: AdminCourse['status'] }) {
  const statusConfig: Record<
    string,
    { label: string; className: string }
  > = {
    draft: { 
      label: 'Draft', 
      className: 'border-amber-400/20 bg-amber-400/5 text-amber-400'
    },
    published: { 
      label: 'Published', 
      className: 'border-emerald-400/20 bg-emerald-400/5 text-emerald-400'
    },
    archived: { 
      label: 'Archived', 
      className: 'border-red-400/20 bg-red-400/5 text-red-400'
    },
  };
  
  const config = statusConfig[status] || statusConfig.draft;
  return (
    <Badge 
      variant="outline" 
      className={`px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </Badge>
  );
}

function FeatureBadge({ isFeatured }: { isFeatured: boolean }) {
  if (!isFeatured) return null;
  return (
    <Badge 
      variant="secondary" 
      className="ml-1.5 border-yellow-400/20 bg-yellow-400/5 px-1.5 py-0.5 text-xs font-medium text-yellow-400"
    >
      <svg
        className="mr-0.5 h-2.5 w-2.5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      Featured
    </Badge>
  );
}

export const columns: ColumnDef<AdminCourse>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="h-4 w-4"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="h-4 w-4"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: 'Course',
    cell: ({ row }) => {
      const course = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-20 overflow-hidden rounded-md border border-border bg-muted">
            {course.thumbnail_url ? (
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center">
              <span className="text-sm font-medium text-foreground">{course.title}</span>
              <FeatureBadge isFeatured={course.is_featured} />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs text-muted-foreground">
                {course.difficulty_level || 'All Levels'}
              </span>
              <span className="text-muted-foreground/50">•</span>
              <span className="inline-flex items-center rounded px-1.5 py-0.5 text-xs text-muted-foreground">
                {course.language || 'English'}
              </span>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    id: 'instructor',
    header: 'Instructor',
    cell: ({ row }) => {
      const instructor = row.original.instructor_info;
      const name = instructor?.name || 'Unknown';
      const email = instructor?.email || '';
      
      return (
        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8 overflow-hidden rounded-full bg-muted">
            {instructor?.avatar_url ? (
              <img
                src={instructor.avatar_url}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs font-medium text-foreground">
                {getInitials(name)}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-foreground">{name}</span>
            <span className="text-xs text-muted-foreground/70">{email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ getValue }) => {
      const category = getValue<string | null>();
      if (!category) return <span className="text-muted-foreground">—</span>;
      return (
        <Badge 
          variant="outline" 
          className="border-border bg-accent/50 px-2 py-0.5 text-xs font-medium text-foreground"
        >
          {category}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ getValue }) => {
      const price = getValue<number | null>();
      return (
        <span className="text-sm font-medium text-foreground">
          {formatCurrency(price)}
        </span>
      );
    },
  },
  {
    accessorKey: 'actual_enrollment_count',
    header: 'Students',
    cell: ({ getValue }) => {
      const count = getValue<number>();
      return (
        <div className="inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1 text-xs">
          <svg className="h-3.5 w-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="font-medium text-foreground">{formatNumber(count)}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'estimated_revenue',
    header: 'Revenue',
    cell: ({ getValue }) => {
      const revenue = getValue<number>();
      return (
        <span className="text-sm font-medium text-emerald-400">
          {formatCurrency(revenue)}
        </span>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => {
      const status = getValue<AdminCourse['status']>();
      return <StatusBadge status={status} />;
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Created',
    cell: ({ getValue }) => {
      const date = getValue<string>();
      return (
        <div className="text-xs text-muted-foreground">
          {new Date(date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => <CourseRowActions course={row.original} />,
    enableSorting: false,
    enableHiding: false,
  },
];