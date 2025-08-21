/**
 * Enrollment Repository
 * 수강 등록 데이터 접근 레이어
 */

import { BaseRepository } from './base.repository';
import { supabase } from '@/app/lib/supabase/client';

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  progress: number;
  completed_at?: string;
  last_accessed_at?: string;
  certificate_issued?: boolean;
  certificate_url?: string;
  created_at: string;
  updated_at: string;
}

export class EnrollmentRepository extends BaseRepository<Enrollment> {
  protected tableName = 'enrollments';

  /**
   * 사용자의 등록 코스 조회
   */
  async findByUser(userId: string): Promise<Enrollment[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('enrolled_at', { ascending: false });

    if (error) {
      console.error('Error fetching user enrollments:', error);
      return [];
    }

    return (data || []) as Enrollment[];
  }

  /**
   * 코스의 등록 학생 조회
   */
  async findByCourse(courseId: string): Promise<Enrollment[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('course_id', courseId)
      .order('enrolled_at', { ascending: false });

    if (error) {
      console.error('Error fetching course enrollments:', error);
      return [];
    }

    return (data || []) as Enrollment[];
  }

  /**
   * 특정 사용자의 특정 코스 등록 조회
   */
  async findByUserAndCourse(
    userId: string,
    courseId: string
  ): Promise<Enrollment | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        // Not found is not an error
        console.error('Error fetching enrollment:', error);
      }
      return null;
    }

    return data as Enrollment;
  }

  /**
   * 수강 등록 생성
   */
  async enroll(userId: string, courseId: string): Promise<Enrollment> {
    return this.create({
      user_id: userId,
      course_id: courseId,
      enrolled_at: new Date().toISOString(),
      progress: 0,
      last_accessed_at: new Date().toISOString(),
    });
  }

  /**
   * 진도 업데이트
   */
  async updateProgress(
    enrollmentId: string,
    progress: number
  ): Promise<Enrollment> {
    const updates: Partial<Enrollment> = {
      progress,
      last_accessed_at: new Date().toISOString(),
    };

    // 100% 완료 시 완료 시간 기록
    if (progress >= 100) {
      updates.completed_at = new Date().toISOString();
    }

    return this.update(enrollmentId, updates);
  }

  /**
   * 최근 접속 시간 업데이트
   */
  async updateLastAccessed(enrollmentId: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', enrollmentId);

    if (error) {
      console.error('Error updating last accessed:', error);
    }
  }

  /**
   * 수료증 발급
   */
  async issueCertificate(
    enrollmentId: string,
    certificateUrl: string
  ): Promise<Enrollment> {
    return this.update(enrollmentId, {
      certificate_issued: true,
      certificate_url: certificateUrl,
    });
  }

  /**
   * 완료된 코스 조회
   */
  async findCompleted(userId: string): Promise<Enrollment[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching completed enrollments:', error);
      return [];
    }

    return (data || []) as Enrollment[];
  }

  /**
   * 진행 중인 코스 조회
   */
  async findInProgress(userId: string): Promise<Enrollment[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .is('completed_at', null)
      .gt('progress', 0)
      .order('last_accessed_at', { ascending: false });

    if (error) {
      console.error('Error fetching in-progress enrollments:', error);
      return [];
    }

    return (data || []) as Enrollment[];
  }

  /**
   * 등록 통계
   */
  async getStats(userId: string): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    notStarted: number;
  }> {
    const enrollments = await this.findByUser(userId);

    return {
      total: enrollments.length,
      completed: enrollments.filter((e) => e.completed_at).length,
      inProgress: enrollments.filter((e) => !e.completed_at && e.progress > 0)
        .length,
      notStarted: enrollments.filter((e) => !e.completed_at && e.progress === 0)
        .length,
    };
  }
}

// Singleton instance
export const enrollmentRepository = new EnrollmentRepository();
