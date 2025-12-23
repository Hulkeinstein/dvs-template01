'use client';

import React, { useState, useEffect } from 'react';
import type { AnySummaryData } from '@/types/summary';
import { isLilysFormat } from '@/types/summary';
import './SummaryDisplay.scss';

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

        {/* 5. 🗂️ Timeline Notes */}
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
              className="card mb-4 border-0 shadow-sm"
            >
              <div className="card-header bg-white border-bottom py-3">
                <div className="d-flex align-items-center gap-2">
                  <h6 className="mb-0 fw-bold fs-5 flex-grow-1">
                    <span className="me-2">{section.emoji}</span>
                    {section.title}
                  </h6>
                  {section.timestamp && (
                    <button
                      className="btn btn-sm btn-outline-primary rounded-pill px-2 py-1 flex-shrink-0"
                      onClick={() =>
                        onTimestampClick?.(section.timestamp_seconds)
                      }
                      style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                    >
                      <i className="bi bi-play-fill me-1"></i>
                      {section.timestamp}
                    </button>
                  )}
                </div>
              </div>
              <div className="card-body">
                {section.subsections.map((sub, j) => (
                  <div
                    key={j}
                    className="subsection mb-3 p-3 rounded bg-light bg-opacity-50"
                  >
                    <div className="d-flex align-items-center mb-2">
                      <button
                        className="btn btn-xs btn-link text-decoration-none p-0 me-2 text-muted fw-bold font-monospace"
                        onClick={() =>
                          onTimestampClick?.(sub.timestamp_seconds)
                        }
                        style={{ fontSize: '0.85rem' }}
                      >
                        {sub.timestamp}
                      </button>
                      <span className="fw-bold text-dark">{sub.title}</span>
                    </div>
                    <p
                      className="mb-0 text-secondary ps-4 small"
                      style={{ lineHeight: '1.6' }}
                    >
                      {sub.content}
                    </p>
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
              {data.suggestions.map((qs, i) => (
                <span
                  key={i}
                  className="badge bg-light text-dark border p-2 fw-normal fs-6"
                >
                  {qs}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Meta Info */}
        <div className="text-end text-muted small mt-4 pt-3 border-top">
          <i className="bi bi-robot me-1"></i> Generated by {data.meta.model}
        </div>
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

      {/* Meta Info (Optional, debug purpose) */}
      <div className="text-end text-muted small mt-2">
        <i className="bi bi-robot"></i> Generated by {data.meta.model}
      </div>
    </div>
  );
}
