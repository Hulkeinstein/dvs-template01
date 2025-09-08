'use client';

import React from 'react';
import { DataTable } from './data-table';
import { columns } from './columns';
import type { AdminCourse } from '@/types/admin-course';
import { formatNumber, formatCurrency } from './utils';
// import { Badge } from '@/components/ui/badge';  // Commented out unused import
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  BookOpen,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface CourseTableProps {
  initialCourses: AdminCourse[];
  total: number;
  currentPage: number;
  limit: number;
  totalPages: number;
}

export default function CourseTable({
  initialCourses,
  total,
  // currentPage,  // Commented out unused props
  limit,
  // totalPages,  // Commented out unused props
}: CourseTableProps) {
  // Calculate statistics
  const publishedCount = initialCourses.filter(
    (c) => c.status === 'published'
  ).length;
  const totalStudents = initialCourses.reduce(
    (acc, c) => acc + (c.actual_enrollment_count || 0),
    0
  );
  const totalRevenue = initialCourses.reduce(
    (acc, c) => acc + (c.estimated_revenue || 0),
    0
  );

  const stats = [
    {
      label: 'Total Courses',
      value: formatNumber(total),
      icon: BookOpen,
      trend: '+12%',
      trendUp: true,
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-400/5',
    },
    {
      label: 'Published',
      value: formatNumber(publishedCount),
      icon: TrendingUp,
      trend: '+8%',
      trendUp: true,
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-400/5',
    },
    {
      label: 'Total Students',
      value: formatNumber(totalStudents),
      icon: Users,
      trend: '+25%',
      trendUp: true,
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-400/5',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      trend: '-5%',
      trendUp: false,
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-400/5',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Statistics Cards - Tweakcn Minimal Design */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trendUp ? ArrowUpRight : ArrowDownRight;
          return (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-md border border-border bg-card p-6 transition-all hover:border-border/80"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  {/* Icon */}
                  <div className={`inline-flex rounded-md p-2 ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>

                  {/* Label */}
                  <p className="text-xs font-medium text-muted-foreground">
                    {stat.label}
                  </p>

                  {/* Value */}
                  <h3 className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </h3>
                </div>

                {/* Trend */}
                <div
                  className={`flex items-center gap-0.5 text-xs font-medium ${
                    stat.trendUp ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  <TrendIcon className="h-3 w-3" />
                  <span>{stat.trend}</span>
                </div>
              </div>

              {/* Subtle hover effect */}
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          );
        })}
      </div>

      {/* Data Table with Tweakcn design */}
      <div className="space-y-4">
        {/* Table Header Bar */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">
              All Courses
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage and review all courses on the platform
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <svg
                className="mr-1.5 h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <svg
                className="mr-1.5 h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
              Export
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <DataTable columns={columns} data={initialCourses} pageSize={limit} />
      </div>
    </div>
  );
}
