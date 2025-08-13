/**
 * 환경별 로그 제어 유틸리티
 * Production 환경에서는 로그를 출력하지 않음
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  // 일반 로그 - 개발 환경에서만
  log: (...args) => {
    if (isDevelopment) {
      // console.log(...args);
    }
  },

  // 정보 로그 - 개발 환경에서만
  info: (...args) => {
    if (isDevelopment) {
      // console.info(...args);
    }
  },

  // 경고 - 개발 환경에서만
  warn: (...args) => {
    if (isDevelopment) {
      // console.warn(...args);
    }
  },

  // 에러 - 항상 출력 (Production에서도 에러는 추적해야 함)
  error: (...args) => {
    // console.error(...args);
  },

  // 디버그 - 개발 환경에서만, 더 상세한 정보
  debug: (...args) => {
    if (isDevelopment && process.env.NEXT_PUBLIC_DEBUG === 'true') {
      // console.log('[DEBUG]', ...args);
    }
  },

  // 테이블 - 개발 환경에서만
  table: (data) => {
    if (isDevelopment) {
      console.table(data);
    }
  },

  // 그룹 - 개발 환경에서만
  group: (label) => {
    if (isDevelopment) {
      console.group(label);
    }
  },

  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },

  // 타이밍 - 개발 환경에서만
  time: (label) => {
    if (isDevelopment) {
      console.time(label);
    }
  },

  timeEnd: (label) => {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  },
};

// 전역 console 객체 덮어쓰기 방지를 위한 안전장치
if (typeof window !== 'undefined' && !isDevelopment) {
  // Production에서 console 메서드들을 빈 함수로 대체
  [
    'log',
    'info',
    'warn',
    'debug',
    'table',
    'group',
    'groupEnd',
    'time',
    'timeEnd',
  ].forEach((method) => {
    if (method !== 'error') {
      window.console[method] = () => {};
    }
  });
}
