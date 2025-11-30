'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// ============================================================================
// Types
// ============================================================================

type AutoSaveStatus = 'idle' | 'dirty' | 'saving' | 'saved' | 'error';

interface SaveData<T> {
  __meta: {
    schemaVersion: string;
    timestamp: number;
    url: string;
  };
  data: T;
}

interface UseAutoSaveOptions {
  storageKey?: string;
  debounceMs?: number;
  intervalMs?: number;
  schemaVersion?: string;
  excludeFields?: string[];
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  status: AutoSaveStatus;
  lastSavedAt: number | null;
  saveNow: (payload?: unknown) => void;
  recover: () => void;
  getRecoverable: () => { data: unknown | null; timestamp: number | null };
  clearDraft: () => void;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * 자동 저장 훅 - localStorage 기반 임시 저장 기능
 */
export function useAutoSave<T = unknown>(
  formData: T,
  setFormData: (data: T) => void,
  {
    storageKey,
    debounceMs = 3000,
    intervalMs = 15000, // 15초로 단축 (이전: 30000)
    schemaVersion = 'v2', // v1 → v2 업그레이드
    excludeFields = [], // 제외할 필드 (예: thumbnailPreview 같은 큰 데이터)
    enabled = true, // 자동 저장 활성화 여부
  }: UseAutoSaveOptions = {}
): UseAutoSaveReturn {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const isClient = typeof window !== 'undefined';

  // 스키마 버전이 포함된 전체 키
  const fullKey = useMemo(
    () => `${storageKey}::${schemaVersion}`,
    [storageKey, schemaVersion]
  );

  // 저장할 데이터 정리 (큰 필드 제외)
  const cleanDataForSave = useCallback(
    (data: unknown): unknown => {
      if (!data) return data;
      const cleaned = { ...(data as Record<string, unknown>) };
      excludeFields.forEach((field) => {
        delete cleaned[field];
      });
      // 썸네일 프리뷰 같은 base64 데이터는 제외
      if (cleaned.thumbnailPreview) {
        delete cleaned.thumbnailPreview;
      }
      return cleaned;
    },
    [excludeFields]
  );

  // 스키마 마이그레이션 함수
  const migrate = useCallback(
    (data: unknown, fromVersion: string, toVersion: string): unknown | null => {
      if (!data) return data;

      try {
        // v1 → v2 마이그레이션
        if (fromVersion === 'v1' && toVersion === 'v2') {
          const migrated = { ...(data as Record<string, unknown>) };
          // v1과 v2는 현재 동일한 구조이므로 그대로 반환
          // 향후 스키마 변경 시 여기에 마이그레이션 로직 추가
          if (process.env.NODE_ENV === 'development') {
            console.log('[AutoSave] Migrated data from v1 to v2');
          }
          return migrated;
        }

        // 지원하지 않는 마이그레이션
        console.warn(
          `[AutoSave] Unsupported migration: ${fromVersion} → ${toVersion}`
        );
        return null;
      } catch (error) {
        console.error('[AutoSave] Migration error:', error);
        return null;
      }
    },
    []
  );

  // 즉시 저장 함수
  const saveNow = useCallback(
    (payload: unknown = null): void => {
      if (!isClient || !storageKey || !enabled) {
        if (process.env.NODE_ENV === 'development') {
          console.log(
            '[AutoSave] Save skipped - enabled:',
            enabled,
            'storageKey:',
            !!storageKey
          );
        }
        return;
      }

      try {
        setStatus('saving');
        const dataToSave = cleanDataForSave(payload || formData);
        const saveData: SaveData<unknown> = {
          __meta: {
            schemaVersion,
            timestamp: Date.now(),
            url: window.location.href,
          },
          data: dataToSave,
        };

        window.localStorage.setItem(fullKey, JSON.stringify(saveData));
        const now = Date.now();
        setLastSavedAt(now);
        setStatus('saved');

        // 2초 후 상태를 idle로
        setTimeout(() => {
          setStatus((prev) => (prev === 'saved' ? 'idle' : prev));
        }, 2000);
      } catch (error) {
        console.error('Auto-save error:', error);
        setStatus('error');
        // 5초 후 에러 상태 초기화
        setTimeout(() => {
          setStatus((prev) => (prev === 'error' ? 'idle' : prev));
        }, 5000);
      }
    },
    [
      formData,
      fullKey,
      isClient,
      schemaVersion,
      storageKey,
      cleanDataForSave,
      enabled,
    ]
  );

  // 디바운스 저장 (입력 변경 3초 후)
  useEffect(() => {
    if (
      !isClient ||
      !enabled ||
      !storageKey ||
      !formData ||
      (formData &&
        typeof formData === 'object' &&
        Object.keys(formData).length === 0)
    )
      return;

    // 변경사항 있음 표시
    setStatus((prev) => (prev === 'saving' ? prev : 'dirty'));

    // 이전 타이머 취소
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    // 새 타이머 설정
    timerRef.current = window.setTimeout(() => {
      saveNow();
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [formData, debounceMs, saveNow, isClient]);

  // 15초 주기 자동 저장
  useEffect(() => {
    if (!isClient || !enabled || !storageKey) return;

    intervalRef.current = window.setInterval(() => {
      if (
        formData &&
        typeof formData === 'object' &&
        Object.keys(formData).length > 0
      ) {
        saveNow();
      }
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [intervalMs, saveNow, isClient, formData, storageKey]);

  // 페이지 이탈/탭 전환 시 즉시 저장
  useEffect(() => {
    if (!isClient || !enabled || !storageKey) return;

    const handleVisibilityChange = (): void => {
      if (
        document.hidden &&
        formData &&
        typeof formData === 'object' &&
        Object.keys(formData).length > 0
      ) {
        saveNow();
      }
    };

    const handleBeforeUnload = (): void => {
      if (
        formData &&
        typeof formData === 'object' &&
        Object.keys(formData).length > 0
      ) {
        saveNow();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveNow, isClient, formData, storageKey]);

  // 복구 가능한 데이터 가져오기
  const getRecoverable = useCallback((): {
    data: unknown | null;
    timestamp: number | null;
  } => {
    if (!isClient || !enabled || !storageKey)
      return { data: null, timestamp: null };

    try {
      let raw = window.localStorage.getItem(fullKey);
      let foundVersion = schemaVersion;

      // 현재 버전이 없으면 구버전 찾기
      if (!raw) {
        const oldKey = `${storageKey}::v1`;
        raw = window.localStorage.getItem(oldKey);
        if (raw) {
          foundVersion = 'v1';
        }
      }

      if (!raw) return { data: null, timestamp: null };

      const parsed: SaveData<unknown> = JSON.parse(raw);
      const dataVersion = parsed?.__meta?.schemaVersion || foundVersion;

      // 스키마 버전 체크 및 자동 마이그레이션
      if (dataVersion !== schemaVersion) {
        // 자동 마이그레이션 시도
        const migrated = migrate(parsed.data, dataVersion, schemaVersion);
        if (migrated) {
          return {
            data: migrated,
            timestamp: parsed.__meta?.timestamp || null,
          };
        }

        // 마이그레이션 실패 시 null 반환
        console.warn('[AutoSave] Failed to migrate data');
        return { data: null, timestamp: null };
      }

      return {
        data: parsed.data || null,
        timestamp: parsed.__meta?.timestamp || null,
      };
    } catch (error) {
      console.error('Failed to parse saved draft:', error);
      return { data: null, timestamp: null };
    }
  }, [fullKey, isClient, schemaVersion, storageKey, migrate]);

  // 데이터 복구
  const recover = useCallback((): void => {
    const { data } = getRecoverable();
    if (data) {
      setFormData(data as T);
      setStatus('idle');
    }
  }, [getRecoverable, setFormData]);

  // 임시 저장 데이터 삭제
  const clearDraft = useCallback((): void => {
    if (!isClient || !storageKey) return;

    try {
      window.localStorage.removeItem(fullKey);
      setStatus('idle');
      setLastSavedAt(null);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, [fullKey, isClient, storageKey]);

  return {
    status,
    lastSavedAt,
    saveNow,
    recover,
    getRecoverable,
    clearDraft,
  };
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * 마지막 저장 시간을 상대적 시간으로 변환
 */
export function getRelativeTime(timestamp: number | null): string {
  if (!timestamp) return '';

  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (seconds < 10) return '방금';
  if (seconds < 60) return `${seconds}초 전`;
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;

  return new Date(timestamp).toLocaleString('ko-KR');
}
