/**
 * Lesson Repository
 * 레슨 데이터 접근 레이어
 */

import { BaseRepository } from './base.repository';
import { supabase } from '@/app/lib/supabase/client';

export interface Lesson {
  id: string;
  course_id: string;
  topic_id?: string;
  title: string;
  description?: string;
  content_type: 'video' | 'quiz' | 'assignment' | 'text';
  content_data?: any;
  video_url?: string;
  duration?: string;
  order_index: number;
  is_preview?: boolean;
  is_completed?: boolean;
  created_at: string;
  updated_at: string;
}

export class LessonRepository extends BaseRepository<Lesson> {
  protected tableName = 'lessons';
  
  /**
   * 코스별 레슨 조회
   */
  async findByCourse(courseId: string): Promise<Lesson[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });
    
    if (error) {
      console.error('Error fetching lessons by course:', error);
      return [];
    }
    
    return (data || []) as Lesson[];
  }
  
  /**
   * 토픽별 레슨 조회
   */
  async findByTopic(topicId: string): Promise<Lesson[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('topic_id', topicId)
      .order('order_index', { ascending: true });
    
    if (error) {
      console.error('Error fetching lessons by topic:', error);
      return [];
    }
    
    return (data || []) as Lesson[];
  }
  
  /**
   * 코스와 토픽으로 레슨 조회
   */
  async findByCourseAndTopic(courseId: string, topicId: string): Promise<Lesson[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('course_id', courseId)
      .eq('topic_id', topicId)
      .order('order_index', { ascending: true });
    
    if (error) {
      console.error('Error fetching lessons by course and topic:', error);
      return [];
    }
    
    return (data || []) as Lesson[];
  }
  
  /**
   * 레슨 순서 재정렬
   */
  async reorder(lessonId: string, newIndex: number): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .update({ order_index: newIndex })
      .eq('id', lessonId);
    
    if (error) {
      console.error('Error reordering lesson:', error);
      throw error;
    }
  }
  
  /**
   * 레슨 순서 일괄 업데이트
   */
  async bulkReorder(updates: { id: string; order_index: number }[]): Promise<void> {
    const promises = updates.map(({ id, order_index }: any) =>
      supabase
        .from(this.tableName)
        .update({ order_index })
        .eq('id', id)
    );
    
    const results = await Promise.all(promises);
    const errors = results.filter((r: any) => r.error);
    
    if (errors.length > 0) {
      console.error('Errors during bulk reorder:', errors);
      throw new Error('Failed to reorder lessons');
    }
  }
  
  /**
   * 퀴즈 레슨 생성
   */
  async createQuizLesson(data: {
    course_id: string;
    topic_id?: string;
    title: string;
    description?: string;
    content_data: any;
    order_index: number;
  }): Promise<Lesson> {
    return this.create({
      ...data,
      content_type: 'quiz'
    });
  }
  
  /**
   * 비디오 레슨 생성
   */
  async createVideoLesson(data: {
    course_id: string;
    topic_id?: string;
    title: string;
    description?: string;
    video_url: string;
    duration?: string;
    order_index: number;
    is_preview?: boolean;
  }): Promise<Lesson> {
    return this.create({
      ...data,
      content_type: 'video'
    });
  }
  
  /**
   * 레슨 타입별 조회
   */
  async findByType(courseId: string, type: Lesson['content_type']): Promise<Lesson[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('course_id', courseId)
      .eq('content_type', type)
      .order('order_index', { ascending: true });
    
    if (error) {
      console.error(`Error fetching ${type} lessons:`, error);
      return [];
    }
    
    return (data || []) as Lesson[];
  }
  
  /**
   * 프리뷰 가능한 레슨 조회
   */
  async findPreviewLessons(courseId: string): Promise<Lesson[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('course_id', courseId)
      .eq('is_preview', true)
      .order('order_index', { ascending: true });
    
    if (error) {
      console.error('Error fetching preview lessons:', error);
      return [];
    }
    
    return (data || []) as Lesson[];
  }
}

// Singleton instance
export const lessonRepository = new LessonRepository();