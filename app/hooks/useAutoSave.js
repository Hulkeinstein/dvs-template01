'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * 자동 저장 훅 - localStorage 기반 임시 저장 기능
 * @param {Object} formData - 저장할 폼 데이터
 * @param {Function} setFormData - 폼 데이터 설정 함수
 * @param {Object} options - 설정 옵션
 * @returns {Object} 저장 상태 및 함수들
 */
export function useAutoSave(
  formData,
  setFormData,
  {
    storageKey,
    debounceMs = 3000,
    intervalMs = 30000,
    schemaVersion = 'v1',
    excludeFields = [], // 제외할 필드 (예: thumbnailPreview 같은 큰 데이터)
    enabled = true, // 자동 저장 활성화 여부
  } = {}
) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'dirty' | 'saving' | 'saved' | 'error'
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const isClient = typeof window !== 'undefined';

  // 스키마 버전이 포함된 전체 키
  const fullKey = useMemo(
    () => `${storageKey}::${schemaVersion}`,
    [storageKey, schemaVersion]
  );

  // 저장할 데이터 정리 (큰 필드 제외)
  const cleanDataForSave = useCallback(
    (data) => {
      if (!data) return data;
      const cleaned = { ...data };
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

  // 즉시 저장 함수
  const saveNow = useCallback(
    (payload = null) => {
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
        const saveData = {
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
      Object.keys(formData).length === 0
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

  // 30초 주기 자동 저장
  useEffect(() => {
    if (!isClient || !enabled || !storageKey) return;

    intervalRef.current = window.setInterval(() => {
      if (formData && Object.keys(formData).length > 0) {
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

    const handleVisibilityChange = () => {
      if (document.hidden && formData && Object.keys(formData).length > 0) {
        saveNow();
      }
    };

    const handleBeforeUnload = () => {
      if (formData && Object.keys(formData).length > 0) {
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
  const getRecoverable = useCallback(() => {
    if (!isClient || !enabled || !storageKey)
      return { data: null, timestamp: null };

    try {
      const raw = window.localStorage.getItem(fullKey);
      if (!raw) return { data: null, timestamp: null };

      const parsed = JSON.parse(raw);

      // 스키마 버전 체크
      if (parsed?.__meta?.schemaVersion !== schemaVersion) {
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
  }, [fullKey, isClient, schemaVersion, storageKey]);

  // 데이터 복구
  const recover = useCallback(() => {
    const { data } = getRecoverable();
    if (data) {
      setFormData(data);
      setStatus('idle');
    }
  }, [getRecoverable, setFormData]);

  // 임시 저장 데이터 삭제
  const clearDraft = useCallback(() => {
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

/**
 * 마지막 저장 시간을 상대적 시간으로 변환
 * @param {number} timestamp - 타임스탬프
 * @returns {string} 상대적 시간 문자열
 */
export function getRelativeTime(timestamp) {
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
