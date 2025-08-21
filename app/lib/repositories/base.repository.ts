/**
 * Base Repository Interface and Implementation
 * 모든 데이터 접근을 추상화하는 기본 레포지토리
 */

import { supabase } from '@/app/lib/supabase/client';

/**
 * Repository 기본 인터페이스
 */
export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}

/**
 * Supabase를 사용하는 기본 Repository 구현
 */
export abstract class BaseRepository<T> implements IRepository<T> {
  protected abstract tableName: string;

  /**
   * ID로 단일 레코드 조회
   */
  async findById(id: string): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching ${this.tableName} by id:`, error);
      return null;
    }

    return data as T;
  }

  /**
   * 모든 레코드 조회
   */
  async findAll(): Promise<T[]> {
    const { data, error } = await supabase.from(this.tableName).select('*');

    if (error) {
      console.error(`Error fetching all ${this.tableName}:`, error);
      return [];
    }

    return (data || []) as T[];
  }

  /**
   * 새 레코드 생성
   */
  async create(data: Partial<T>): Promise<T> {
    const { data: created, error } = await supabase
      .from(this.tableName)
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      throw error;
    }

    return created as T;
  }

  /**
   * 레코드 업데이트
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    const { data: updated, error } = await supabase
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      throw error;
    }

    return updated as T;
  }

  /**
   * 레코드 삭제
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from(this.tableName).delete().eq('id', id);

    if (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      return false;
    }

    return true;
  }

  /**
   * 조건부 조회 헬퍼
   */
  protected async findByField(field: string, value: any): Promise<T[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq(field, value);

    if (error) {
      console.error(`Error fetching ${this.tableName} by ${field}:`, error);
      return [];
    }

    return (data || []) as T[];
  }

  /**
   * 단일 레코드 조건부 조회
   */
  protected async findOneByField(field: string, value: any): Promise<T | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq(field, value)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        // Not found is not an error
        console.error(`Error fetching ${this.tableName} by ${field}:`, error);
      }
      return null;
    }

    return data as T;
  }
}
