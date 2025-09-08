'use client';

import React, { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  X,
  RefreshCw,
  SlidersHorizontal,
  Check,
} from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import type {
  CourseFilters as CourseFiltersType,
  CourseStatus,
} from '@/types/admin-course';
// Commented out unused imports
// import {
//   getCourseCategories,
//   getInstructors,
// } from '@/app/(dashboard)/(admin)/admin-courses/actions';

interface CourseFiltersProps {
  initialFilters: CourseFiltersType;
}

export default function CourseFilters({ initialFilters }: CourseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(initialFilters.search || '');
  const [selectedStatus, setSelectedStatus] = useState<CourseStatus | 'all'>(
    initialFilters.status || 'all'
  );
  // Commented out unused state variables to fix ESLint errors
  // These can be uncommented when filter implementation is complete
  // const [categories, setCategories] = useState<string[]>([]);
  // const [instructors, setInstructors] = useState<
  //   Array<{ id: string; name: string; email: string }>
  // >([]);
  // const [isLoading, setIsLoading] = useState(true);

  // Commented out useEffect that uses the unused state variables
  // This can be uncommented when filter implementation is complete
  // useEffect(() => {
  //   // Load filter options
  //   const loadFilterOptions = async () => {
  //     setIsLoading(true);
  //     try {
  //       const [categoriesData, instructorsData] = await Promise.all([
  //         getCourseCategories(),
  //         getInstructors(),
  //       ]);
  //       setCategories(categoriesData);
  //       setInstructors(instructorsData);
  //     } catch (error) {
  //       console.error('Failed to load filter options:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //
  //   loadFilterOptions();
  // }, []);

  const updateSearchParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Reset to page 1 when filters change
      params.set('page', '1');

      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const debouncedSearch = useDebouncedCallback((value: string) => {
    updateSearchParams({ q: value || undefined });
  }, 300);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleStatusChange = (status: CourseStatus | 'all') => {
    setSelectedStatus(status);
    updateSearchParams({ status: status === 'all' ? undefined : status });
  };

  const handleReset = () => {
    setSearchValue('');
    setSelectedStatus('all');
    router.push('/admin-courses');
  };

  const statusOptions: Array<{
    value: CourseStatus | 'all';
    label: string;
    count?: number;
    color: string;
    bgColor: string;
  }> = [
    {
      value: 'all',
      label: 'All Courses',
      color: 'text-gray-700',
      bgColor: 'bg-gray-100 hover:bg-gray-200',
    },
    {
      value: 'draft',
      label: 'Draft',
      color: 'text-amber-700',
      bgColor: 'bg-amber-50 hover:bg-amber-100',
    },
    {
      value: 'published',
      label: 'Published',
      color: 'text-emerald-700',
      bgColor: 'bg-emerald-50 hover:bg-emerald-100',
    },
    {
      value: 'archived',
      label: 'Archived',
      color: 'text-red-700',
      bgColor: 'bg-red-50 hover:bg-red-100',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main Filter Bar - Tweakcn Style */}
      <div className="rounded-md border border-border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Search Input - Minimal */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-9 bg-background border-border pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
              {searchValue && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons - Minimal */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-9 px-3 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Clear
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.reload()}
              className="h-9 px-3 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-9 border-border bg-transparent px-3 text-foreground hover:bg-accent"
            >
              <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
              Filters
            </Button>
          </div>
        </div>

        {/* Status Filter Pills - Tweakcn Minimal */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Status:
          </span>
          <div className="flex flex-wrap gap-1">
            {statusOptions.map((option) => {
              const isSelected = selectedStatus === option.value;
              const getDarkThemeColors = () => {
                switch (option.value) {
                  case 'draft':
                    return isSelected
                      ? 'bg-amber-400/10 text-amber-400 ring-1 ring-amber-400/20'
                      : 'bg-transparent text-muted-foreground hover:bg-accent';
                  case 'published':
                    return isSelected
                      ? 'bg-emerald-400/10 text-emerald-400 ring-1 ring-emerald-400/20'
                      : 'bg-transparent text-muted-foreground hover:bg-accent';
                  case 'archived':
                    return isSelected
                      ? 'bg-red-400/10 text-red-400 ring-1 ring-red-400/20'
                      : 'bg-transparent text-muted-foreground hover:bg-accent';
                  default:
                    return isSelected
                      ? 'bg-blue-400/10 text-blue-400 ring-1 ring-blue-400/20'
                      : 'bg-transparent text-muted-foreground hover:bg-accent';
                }
              };

              return (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={`
                    relative rounded-md px-3 py-1.5 text-xs font-medium transition-colors
                    ${getDarkThemeColors()}
                  `}
                >
                  <div className="flex items-center gap-2">
                    {isSelected && <Check className="h-3 w-3" />}
                    <span>{option.label}</span>
                    {option.count !== undefined && (
                      <span
                        className={`
                        ml-1 rounded px-1.5 py-0.5 text-xs
                        ${isSelected ? 'bg-black/10' : 'bg-muted/50'}
                      `}
                      >
                        {option.count}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Filters Display - Minimal */}
      {(searchValue || selectedStatus !== 'all') && (
        <div className="rounded-md border border-border bg-accent/50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Active:
              </span>
              <div className="flex flex-wrap gap-1">
                {searchValue && (
                  <Badge
                    className="cursor-pointer border-transparent bg-muted px-2 py-1 text-xs text-foreground hover:bg-muted/80"
                    onClick={() => handleSearchChange('')}
                  >
                    <Search className="mr-1 h-2.5 w-2.5" />
                    {searchValue}
                    <X className="ml-1 h-2.5 w-2.5" />
                  </Badge>
                )}
                {selectedStatus !== 'all' && (
                  <Badge
                    className="cursor-pointer border-transparent bg-muted px-2 py-1 text-xs text-foreground hover:bg-muted/80"
                    onClick={() => handleStatusChange('all')}
                  >
                    <Filter className="mr-1 h-2.5 w-2.5" />
                    {selectedStatus}
                    <X className="ml-1 h-2.5 w-2.5" />
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-7 px-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              Clear all
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
