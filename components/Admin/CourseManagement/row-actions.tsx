'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Edit,
  Eye,
  Archive,
  CheckCircle,
  XCircle,
  Star,
} from 'lucide-react';
import type { AdminCourse } from '@/types/admin-course';
import {
  updateCourseStatus,
  toggleCourseFeatured,
} from '@/app/(dashboard)/(admin)/admin-courses/actions';

interface CourseRowActionsProps {
  course: AdminCourse;
}

export function CourseRowActions({ course }: CourseRowActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (newStatus: AdminCourse['status']) => {
    if (
      !confirm(`Are you sure you want to change the status to ${newStatus}?`)
    ) {
      return;
    }

    startTransition(async () => {
      try {
        await updateCourseStatus(course.id, newStatus);
        // In a real app, you'd show a toast notification here
        window.location.reload(); // Temporary solution
      } catch (error) {
        console.error('Failed to update status:', error);
        alert('Failed to update status');
      }
    });
  };

  const handleToggleFeatured = () => {
    startTransition(async () => {
      try {
        await toggleCourseFeatured(course.id);
        window.location.reload(); // Temporary solution
      } catch (error) {
        console.error('Failed to toggle featured:', error);
        alert('Failed to toggle featured status');
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={isPending}>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-card border-border">
        <DropdownMenuLabel className="text-muted-foreground">
          Actions
        </DropdownMenuLabel>

        <DropdownMenuItem asChild>
          <a
            href={`/courses/${course.id}`}
            target="_blank"
            className="flex items-center text-foreground hover:text-foreground"
          >
            <Eye className="mr-2 h-4 w-4" />
            View Course
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a
            href={`/instructor/courses/${course.id}/edit`}
            className="flex items-center text-foreground hover:text-foreground"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Details
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border" />

        <DropdownMenuItem
          onClick={handleToggleFeatured}
          className="flex items-center text-foreground hover:text-foreground"
        >
          <Star
            className={`mr-2 h-4 w-4 ${course.is_featured ? 'fill-current text-yellow-400' : ''}`}
          />
          {course.is_featured ? 'Remove from Featured' : 'Mark as Featured'}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border" />

        {course.status === 'draft' && (
          <DropdownMenuItem
            onClick={() => handleStatusChange('published')}
            className="flex items-center text-emerald-400 hover:text-emerald-400"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Publish Course
          </DropdownMenuItem>
        )}

        {course.status === 'published' && (
          <DropdownMenuItem
            onClick={() => handleStatusChange('draft')}
            className="flex items-center text-amber-400 hover:text-amber-400"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Unpublish Course
          </DropdownMenuItem>
        )}

        {course.status !== 'archived' && (
          <DropdownMenuItem
            onClick={() => handleStatusChange('archived')}
            className="flex items-center text-red-400 hover:text-red-400"
          >
            <Archive className="mr-2 h-4 w-4" />
            Archive Course
          </DropdownMenuItem>
        )}

        {course.status === 'archived' && (
          <DropdownMenuItem
            onClick={() => handleStatusChange('draft')}
            className="flex items-center text-foreground hover:text-foreground"
          >
            <Archive className="mr-2 h-4 w-4" />
            Restore Course
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
