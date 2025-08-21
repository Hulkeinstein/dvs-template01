/**
 * Course Repository
 * 코스 데이터 접근 레이어
 */

import { BaseRepository } from './base.repository';
import { supabase } from '@/app/lib/supabase/client';

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  price: number;
  currency?: string;
  thumbnail_url?: string;
  intro_video_url?: string;
  duration?: string;
  level?: string;
  language?: string;
  category?: string;
  is_published: boolean;
  is_featured?: boolean;
  is_new?: boolean;
  is_hot?: boolean;
  is_bestseller?: boolean;
  enrolled_count?: number;
  rating?: number;
  created_at: string;
  updated_at: string;
}

export class CourseRepository extends BaseRepository<Course> {
  protected tableName = 'courses';

  /**
   * 강사별 코스 조회
   */
  async findByInstructor(instructorId: string): Promise<Course[]> {
    return this.findByField('instructor_id', instructorId);
  }

  /**
   * 발행된 코스만 조회
   */
  async findPublished(): Promise<Course[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching published courses:', error);
      return [];
    }

    return (data || []) as Course[];
  }

  /**
   * 카테고리별 코스 조회
   */
  async findByCategory(category: string): Promise<Course[]> {
    return this.findByField('category', category);
  }

  /**
   * Featured 코스 조회
   */
  async findFeatured(): Promise<Course[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('is_featured', true)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching featured courses:', error);
      return [];
    }

    return (data || []) as Course[];
  }

  /**
   * 검색
   */
  async search(query: string): Promise<Course[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('is_published', true);

    if (error) {
      console.error('Error searching courses:', error);
      return [];
    }

    return (data || []) as Course[];
  }

  /**
   * 코스 통계 업데이트
   */
  async incrementEnrollment(courseId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_enrolled_count', {
      course_id: courseId,
    });

    if (error) {
      console.error('Error incrementing enrollment:', error);
    }
  }

  /**
   * 배지 업데이트
   */
  async updateBadges(
    courseId: string,
    badges: {
      is_featured?: boolean;
      is_new?: boolean;
      is_hot?: boolean;
      is_bestseller?: boolean;
    }
  ): Promise<Course> {
    return this.update(courseId, badges);
  }
}

// Singleton instance
export const courseRepository = new CourseRepository();
