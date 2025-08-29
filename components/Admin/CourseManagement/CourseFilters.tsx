'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type {
  CourseFilters as CourseFiltersType,
  CourseStatus,
} from '@/types/admin-course';
import {
  getCourseCategories,
  getInstructors,
} from '@/app/(dashboard)/(admin)/admin-courses/actions';

interface CourseFiltersProps {
  initialFilters: CourseFiltersType;
}

export default function CourseFilters({ initialFilters }: CourseFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState(initialFilters);
  const [categories, setCategories] = useState<string[]>([]);
  const [instructors, setInstructors] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load filter options
    const loadFilterOptions = async () => {
      setIsLoading(true);
      try {
        const [categoriesData, instructorsData] = await Promise.all([
          getCourseCategories(),
          getInstructors(),
        ]);
        setCategories(categoriesData);
        setInstructors(instructorsData);
      } catch (error) {
        console.error('Failed to load filter options:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  const handleFilterChange = (key: keyof CourseFiltersType, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams(searchParams);

    if (value && value !== 'all') {
      params.set(
        key === 'search' ? 'q' : key === 'sortBy' ? 'sort' : key,
        value
      );
    } else {
      params.delete(key === 'search' ? 'q' : key === 'sortBy' ? 'sort' : key);
    }

    // Reset to page 1 when filters change
    if (key !== 'page') {
      params.delete('page');
    }

    router.push(`?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchTerm = formData.get('search') as string;
    handleFilterChange('search', searchTerm);
  };

  const handleReset = () => {
    setFilters({});
    router.push('/admin-courses');
  };

  const statusOptions: Array<{
    value: CourseStatus | 'all';
    label: string;
    color: string;
  }> = [
    { value: 'all', label: 'All Status', color: '' },
    { value: 'published', label: 'Published', color: 'text-success' },
    { value: 'draft', label: 'Draft', color: 'text-warning' },
    { value: 'archived', label: 'Archived', color: 'text-secondary' },
  ];

  const sortOptions = [
    { value: 'created_desc', label: 'Newest First' },
    { value: 'created_asc', label: 'Oldest First' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'enrollment_desc', label: 'Most Enrolled' },
    { value: 'enrollment_asc', label: 'Least Enrolled' },
  ];

  return (
    <div className="rbt-dashboard-filter mb-4">
      <div className="card">
        <div className="card-body">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-3">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="feather-search"></i>
                  </span>
                  <input
                    type="text"
                    name="search"
                    className="form-control"
                    placeholder="Search courses by title..."
                    defaultValue={filters.search || ''}
                  />
                  <button className="btn btn-primary" type="submit">
                    Search
                  </button>
                </div>
              </div>
              <div className="col-md-6 text-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleReset}
                >
                  <i className="feather-refresh-cw me-1"></i>
                  Reset Filters
                </button>
              </div>
            </div>
          </form>

          {/* Filter Options */}
          <div className="row g-3">
            {/* Status Filter */}
            <div className="col-md-3">
              <label className="form-label small text-muted">Status</label>
              <select
                className="form-select"
                value={filters.status || 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="col-md-3">
              <label className="form-label small text-muted">Category</label>
              <select
                className="form-select"
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                disabled={isLoading || categories.length === 0}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Instructor Filter */}
            <div className="col-md-3">
              <label className="form-label small text-muted">Instructor</label>
              <select
                className="form-select"
                value={filters.instructorId || ''}
                onChange={(e) =>
                  handleFilterChange('instructorId', e.target.value)
                }
                disabled={isLoading || instructors.length === 0}
              >
                <option value="">All Instructors</option>
                {instructors.map((instructor) => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="col-md-3">
              <label className="form-label small text-muted">Sort By</label>
              <select
                className="form-select"
                value={filters.sortBy || 'created_desc'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="mt-3">
            <div className="d-flex gap-2 flex-wrap">
              <button
                className={`btn btn-sm ${
                  filters.isFeatured ? 'btn-warning' : 'btn-outline-warning'
                }`}
                onClick={() =>
                  handleFilterChange('isFeatured', !filters.isFeatured)
                }
              >
                <i className="feather-star me-1"></i>
                Featured Only
              </button>
              <div className="btn-group btn-group-sm" role="group">
                <button
                  type="button"
                  className={`btn ${
                    filters.status === 'published'
                      ? 'btn-success'
                      : 'btn-outline-success'
                  }`}
                  onClick={() =>
                    handleFilterChange(
                      'status',
                      filters.status === 'published' ? 'all' : 'published'
                    )
                  }
                >
                  Published
                </button>
                <button
                  type="button"
                  className={`btn ${
                    filters.status === 'draft'
                      ? 'btn-warning'
                      : 'btn-outline-warning'
                  }`}
                  onClick={() =>
                    handleFilterChange(
                      'status',
                      filters.status === 'draft' ? 'all' : 'draft'
                    )
                  }
                >
                  Draft
                </button>
                <button
                  type="button"
                  className={`btn ${
                    filters.status === 'archived'
                      ? 'btn-secondary'
                      : 'btn-outline-secondary'
                  }`}
                  onClick={() =>
                    handleFilterChange(
                      'status',
                      filters.status === 'archived' ? 'all' : 'archived'
                    )
                  }
                >
                  Archived
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
