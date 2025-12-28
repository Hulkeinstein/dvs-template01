'use client';

import React from 'react';
import type { SuggestionItem } from '@/types/summary';

/**
 * YouTube URL인지 확인
 */
function isYouTubeUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)/.test(url);
}

/**
 * URL 타입 판별
 */
function getUrlType(
  url: string | null | undefined
): 'youtube' | 'web' | 'none' {
  if (!url) return 'none';
  return isYouTubeUrl(url) ? 'youtube' : 'web';
}

interface SuggestionEditorProps {
  suggestions: SuggestionItem[];
  onChange: (suggestions: SuggestionItem[]) => void;
  disabled?: boolean;
}

/**
 * 강사용 관련 질문 편집 컴포넌트
 * - 질문 텍스트 + URL 입력
 * - 최대 5개 제한
 * - YouTube URL 자동 감지
 */
export default function SuggestionEditor({
  suggestions,
  onChange,
  disabled = false,
}: SuggestionEditorProps) {
  const handleQuestionChange = (index: number, question: string) => {
    const updated = [...suggestions];
    updated[index] = { ...updated[index], question };
    onChange(updated);
  };

  const handleUrlChange = (index: number, url: string) => {
    const updated = [...suggestions];
    const urlType = getUrlType(url);
    updated[index] = {
      ...updated[index],
      url: url || null,
      urlType,
    };
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    onChange(suggestions.filter((_, i) => i !== index));
  };

  const handleAdd = () => {
    onChange([...suggestions, { question: '', url: null, urlType: 'none' }]);
  };

  return (
    <div className="suggestion-editor">
      <h6 className="mb-3">
        <i className="bi bi-question-circle me-2"></i>관련 질문 편집
      </h6>

      {suggestions.length === 0 && (
        <p className="text-muted small mb-3">
          관련 질문이 없습니다. 아래 버튼으로 추가하세요.
        </p>
      )}

      {suggestions.map((item, index) => (
        <div
          key={index}
          className="suggestion-item mb-3 p-3 border rounded bg-light"
        >
          <div className="d-flex justify-content-between align-items-start mb-2">
            <label className="form-label mb-0 small fw-semibold">
              질문 {index + 1}
            </label>
            <button
              type="button"
              className="btn btn-link btn-sm text-danger p-0"
              onClick={() => handleRemove(index)}
              disabled={disabled}
              title="삭제"
            >
              <i className="feather-trash-2"></i>
            </button>
          </div>

          <input
            type="text"
            className="form-control mb-2"
            placeholder="관련 질문을 입력하세요"
            value={item.question}
            onChange={(e) => handleQuestionChange(index, e.target.value)}
            disabled={disabled}
          />

          <input
            type="url"
            className="form-control"
            placeholder="답변 링크 (YouTube 또는 웹 URL, 선택사항)"
            value={item.url || ''}
            onChange={(e) => handleUrlChange(index, e.target.value)}
            disabled={disabled}
          />

          {item.url && item.urlType === 'youtube' && (
            <small className="text-success mt-1 d-block">
              <i className="bi bi-check-circle me-1"></i>YouTube 링크가
              감지되었습니다
            </small>
          )}
        </div>
      ))}

      <button
        type="button"
        className="btn btn-outline-primary btn-sm"
        onClick={handleAdd}
        disabled={disabled || suggestions.length >= 5}
      >
        <i className="feather-plus me-1"></i>질문 추가
      </button>

      {suggestions.length >= 5 && (
        <small className="text-muted ms-2">최대 5개까지 추가 가능합니다</small>
      )}
    </div>
  );
}
