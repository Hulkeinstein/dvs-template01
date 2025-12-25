'use client';

import React, { useState, useEffect } from 'react';
import type { AnySummaryData, Subsection } from '@/types/summary';
import { isLilysFormat, normalizeSuggestions } from '@/types/summary';

/**
 * **볼드** 마크다운을 <strong>으로 변환
 */
function renderBoldText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

interface SummaryDisplayProps {
  data: AnySummaryData | null;
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
  onTimestampClick?: (seconds: number) => void;
}

export default function SummaryDisplay({
  data,
  isLoading,
  error,
  onRetry,
  onTimestampClick,
}: SummaryDisplayProps) {
  const [loadingMessage, setLoadingMessage] =
    useState('자막을 추출하고 있습니다...');

  // Simple loading message rotation
  useEffect(() => {
    if (!isLoading) return;

    const messages = [
      '자막을 추출하고 있습니다...',
      'AI가 영상을 분석하고 있습니다...',
      '요약을 생성하고 있습니다...',
    ];
    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % messages.length;
      setLoadingMessage(messages[index]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="summary-display__loading text-center p-4">
        <div className="spinner-border text-primary mb-2" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">{loadingMessage}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="summary-display__error alert alert-danger d-flex align-items-center justify-content-between">
        <div>
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
        {onRetry && (
          <button className="btn btn-outline-danger btn-sm" onClick={onRetry}>
            재시도
          </button>
        )}
      </div>
    );
  }

  if (!data) return null;

  // Lilys Style Rendering
  if (isLilysFormat(data)) {
    return (
      <div className="summary-display summary-display--lilys mt-4">
        {/* 1. 📌 Core Q&A */}
        <section
          className="summary-display__core-qa mb-4 p-4 rounded-3 border-start border-4 border-danger bg-opacity-10 bg-danger"
          style={{ backgroundColor: '#fff8e1' }}
        >
          <h5 className="fw-bold mb-3 text-danger">
            <i className="bi bi-pin-fill me-2"></i>핵심 Q&A
          </h5>
          <div className="qa-content">
            <p className="mb-2 fs-5 fw-bold text-dark">
              Q: {data.core_qa.question}
            </p>
            <p className="mb-0 text-secondary">A: {data.core_qa.answer}</p>
          </div>
        </section>

        {/* 2. 💡 Action Points */}
        <section
          className="summary-display__action-points mb-4 p-4 rounded-3 border-start border-4 border-warning"
          style={{ backgroundColor: '#fffde7' }}
        >
          <h5 className="fw-bold mb-3 text-warning-emphasis">
            <i className="bi bi-lightbulb-fill me-2"></i>액션 포인트
          </h5>
          <ul className="list-unstyled mb-0 ps-2">
            {data.action_points.items.map((item, idx) => (
              <li key={idx} className="mb-2 position-relative ps-4">
                <span className="position-absolute start-0 text-warning fw-bold">
                  •
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* 3. 📑 TOC (목차) */}
        <section className="summary-display__toc mb-4 p-4 rounded-3 bg-light border">
          <h5 className="fw-bold mb-3 text-secondary">
            <i className="bi bi-list-ul me-2"></i>목차
          </h5>
          <div className="toc-list">
            {data.sections.map((section, idx) => (
              <a
                key={idx}
                href={`#section-${idx}`}
                className="d-block text-decoration-none text-primary mb-1 hover-underline"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById(`section-${idx}`)
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {/* 섹션 번호는 없으므로 인덱스+1 사용하거나 이모지만 표시 */}
                {idx + 1}. {section.emoji} {section.title}
              </a>
            ))}
          </div>
        </section>

        {/* 4. 📝 Overview */}
        <section className="summary-display__overview mb-4 p-4 rounded-3 border-start border-4 border-primary bg-primary bg-opacity-10">
          <h5 className="fw-bold mb-3 text-primary">
            <i className="bi bi-file-text-fill me-2"></i>개요
          </h5>
          <p className="mb-0 fst-italic text-dark">{data.overview}</p>
        </section>

        {/* 5. 🗂️ Timeline Notes - 릴리스AI 스타일 */}
        <section className="summary-display__timeline">
          <div className="timeline-header mb-4">
            <h5 className="fw-bold mb-2">
              <i className="bi bi-journal-text me-2 text-success"></i>타임라인
              노트
            </h5>
            <p className="text-muted small ms-4 mb-0 bg-light p-2 rounded">
              {data.timeline_intro.text}
            </p>
          </div>

          {data.sections.map((section, idx) => (
            <div
              key={idx}
              id={`section-${idx}`}
              className="timeline-section mb-4"
            >
              {/* 섹션 헤더 - 타임스탬프 뱃지 */}
              <div className="timeline-section__header mb-2">
                <a
                  href="#"
                  className="timestamp-badge"
                  onClick={(e) => {
                    e.preventDefault();
                    onTimestampClick?.(section.timestamp_seconds);
                  }}
                  title="클릭하여 재생"
                >
                  <i className="bi bi-play-circle-fill"></i>
                  {section.timestamp}
                </a>
              </div>

              {/* 섹션 제목 + 요약 */}
              <h6 className="timeline-section__title fw-bold mb-2">
                <span className="me-2">{section.emoji}</span>
                {renderBoldText(section.title)}
              </h6>

              {section.summary && (
                <p className="timeline-section__summary text-dark mb-3 ps-4">
                  {renderBoldText(section.summary)}
                </p>
              )}

              {/* 서브섹션들 - 아웃라인 스타일 */}
              <div className="timeline-subsections ps-4">
                {section.subsections.map((sub: Subsection, j: number) => (
                  <div key={j} className="timeline-subsection mb-3">
                    {/* 서브섹션 헤더 */}
                    <div className="mb-1">
                      <span className="fw-semibold text-dark">
                        {renderBoldText(sub.title)}
                      </span>
                    </div>

                    {/* 서브섹션 내용 */}
                    <p className="timeline-subsection__content text-secondary mb-2 ps-5">
                      {renderBoldText(sub.content)}
                    </p>

                    {/* 서브포인트들 (3단계) */}
                    {sub.subpoints && sub.subpoints.length > 0 && (
                      <ul className="timeline-subpoints list-unstyled ps-5 mb-0">
                        {sub.subpoints.map((point, k) => (
                          <li
                            key={k}
                            className="timeline-subpoint text-secondary mb-1 ps-3 position-relative"
                          >
                            <span
                              className="position-absolute text-muted"
                              style={{ left: 0 }}
                            >
                              {String.fromCharCode(105 + k)}.
                            </span>
                            {renderBoldText(point.text)}
                            {point.reference && (
                              <sup className="text-primary ms-1">
                                [{point.reference}]
                              </sup>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* 6. 💭 Suggestions (Optional) */}
        {data.suggestions && data.suggestions.length > 0 && (
          <section className="summary-display__suggestions mt-5 pt-4 border-top">
            <h5 className="fw-bold mb-3 text-secondary">
              <i className="bi bi-question-circle-fill me-2"></i>관련 질문
            </h5>
            <div className="d-flex flex-wrap gap-2">
              {normalizeSuggestions(data.suggestions).map((item, i) =>
                item.url ? (
                  <a
                    key={i}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="suggestion-link badge bg-light text-dark border p-2 fw-normal text-decoration-none"
                  >
                    <i
                      className={`bi ${item.urlType === 'youtube' ? 'bi-youtube text-danger' : 'bi-link-45deg'} me-1`}
                    ></i>
                    {item.question}
                    <i className="bi bi-box-arrow-up-right ms-1 opacity-50"></i>
                  </a>
                ) : (
                  <span
                    key={i}
                    className="badge bg-light text-dark border p-2 fw-normal"
                  >
                    {item.question}
                  </span>
                )
              )}
            </div>
          </section>
        )}
      </div>
    );
  }

  // Legacy Rendering
  return (
    <div className="summary-display mt-4">
      {/* Key Notes */}
      <div className="summary-display__section mb-4">
        <h5 className="summary-display__title d-flex align-items-center gap-2 mb-3">
          <i className="bi bi-lightbulb-fill text-warning"></i>
          핵심 요약
        </h5>
        <ul className="summary-display__key-notes list-group">
          {data.key_notes.map((note, idx) => (
            <li key={idx} className="list-group-item">
              • {note}
            </li>
          ))}
        </ul>
      </div>

      {/* Detailed Notes */}
      <div className="summary-display__section">
        <h5 className="summary-display__title d-flex align-items-center gap-2 mb-3">
          <i className="bi bi-journal-text text-primary"></i>
          상세 노트
        </h5>
        <div className="summary-display__detailed-notes">
          {data.detailed_notes.map((note, idx) => (
            <div key={idx} className="card mb-3">
              <div className="card-body">
                <div className="d-flex align-items-center mb-2">
                  <button
                    className="btn btn-sm btn-light text-primary fw-bold me-2"
                    onClick={() => onTimestampClick?.(note.timestamp_seconds)}
                  >
                    <i className="bi bi-play-fill"></i> {note.timestamp}
                  </button>
                  <h6 className="card-title mb-0">{note.title}</h6>
                </div>
                <p className="card-text text-muted small">{note.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
