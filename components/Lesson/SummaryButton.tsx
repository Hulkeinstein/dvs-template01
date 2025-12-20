'use client';

import React from 'react';

interface SummaryButtonProps {
  youtubeUrl: string;
  onGenerateSummary: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function SummaryButton({ 
  youtubeUrl, 
  onGenerateSummary, 
  isLoading, 
  disabled 
}: SummaryButtonProps) {
  const isDisabled = disabled || !youtubeUrl || isLoading;

  return (
    <button
      className="btn btn-primary d-flex align-items-center gap-2"
      onClick={onGenerateSummary}
      disabled={isDisabled}
      type="button"
    >
      {isLoading ? (
        <>
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          <span>생성 중...</span>
        </>
      ) : (
        <>
          <i className="bi bi-stars"></i>
          <span>AI 요약</span>
        </>
      )}
    </button>
  );
}
