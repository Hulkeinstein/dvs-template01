/**
 * User Repository
 * 사용자 데이터 접근 레이어
 */

import { BaseRepository } from './base.repository';
import { supabase } from '@/app/lib/supabase/client';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'student' | 'instructor' | 'admin';
  phone?: string;
  phone_verified?: boolean;
  avatar_url?: string;
  bio?: string;
  expertise?: string[];
  social_links?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  created_at: string;
  updated_at: string;
}

export class UserRepository extends BaseRepository<User> {
  protected tableName = 'user';

  /**
   * 이메일로 사용자 조회
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.findOneByField('email', email);
  }

  /**
   * 역할별 사용자 조회
   */
  async findByRole(role: User['role']): Promise<User[]> {
    return this.findByField('role', role);
  }

  /**
   * 전화번호로 사용자 조회
   */
  async findByPhone(phone: string): Promise<User | null> {
    return this.findOneByField('phone', phone);
  }

  /**
   * 사용자 생성 또는 업데이트 (upsert)
   */
  async upsert(data: Partial<User>): Promise<User> {
    const { data: upserted, error } = await supabase
      .from(this.tableName)
      .upsert(data)
      .select()
      .single();

    if (error) {
      console.error('Error upserting user:', error);
      throw error;
    }

    return upserted as User;
  }

  /**
   * 사용자 역할 변경
   */
  async updateRole(userId: string, role: User['role']): Promise<User> {
    return this.update(userId, { role });
  }

  /**
   * 전화번호 인증 상태 업데이트
   */
  async verifyPhone(userId: string, phone: string): Promise<User> {
    return this.update(userId, {
      phone,
      phone_verified: true,
    });
  }

  /**
   * 프로필 업데이트
   */
  async updateProfile(
    userId: string,
    profile: {
      name?: string;
      bio?: string;
      avatar_url?: string;
      expertise?: string[];
      social_links?: User['social_links'];
    }
  ): Promise<User> {
    return this.update(userId, profile);
  }

  /**
   * 강사 목록 조회
   */
  async findInstructors(): Promise<User[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('role', 'instructor')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching instructors:', error);
      return [];
    }

    return (data || []) as User[];
  }

  /**
   * 활성 사용자 수 조회
   */
  async countActiveUsers(since?: Date): Promise<number> {
    let query = supabase
      .from(this.tableName)
      .select('id', { count: 'exact', head: true });

    if (since) {
      query = query.gte('updated_at', since.toISOString());
    }

    const { count, error } = await query;

    if (error) {
      console.error('Error counting active users:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * 사용자 검색
   */
  async search(query: string): Promise<User[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`);

    if (error) {
      console.error('Error searching users:', error);
      return [];
    }

    return (data || []) as User[];
  }
}

// Singleton instance
export const userRepository = new UserRepository();
