/**
 * Debug Helper Utility
 * 개발 중 attachment 업로드 기능의 디버깅을 지원하는 유틸리티
 */

import { logger } from './logger';

const DEBUG_MODE = process.env.NODE_ENV === 'development';

/**
 * 디버그 로그를 콘솔과 로컬스토리지에 기록
 * @param {string} component - 컴포넌트 이름
 * @param {string} action - 액션 이름
 * @param {any} data - 로그 데이터
 */
export const debugLog = (component, action, data) => {
  if (!DEBUG_MODE) return;
  
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    component,
    action,
    data,
    stackTrace: new Error().stack
  };
  
  // 콘솔에 로그 출력
  logger.log(`🔍 [${component}] ${action}`);
  logger.log('Time:', timestamp);
  logger.log('Data:', data);
  
  // 로컬 스토리지에 저장 (최근 50개만 유지)
  try {
    const logs = JSON.parse(localStorage.getItem('attachmentDebugLogs') || '[]');
    logs.push(logData);
    if (logs.length > 50) logs.shift();
    localStorage.setItem('attachmentDebugLogs', JSON.stringify(logs));
  } catch (e) {
    logger.warn('Failed to save debug log to localStorage:', e);
  }
};

/**
 * 에러를 추적하고 로그에 기록
 * @param {string} component - 컴포넌트 이름
 * @param {Error} error - 에러 객체
 * @param {Object} context - 추가 컨텍스트 정보
 */
export const trackError = (component, error, context = {}) => {
  logger.error(`❌ [${component}] Error:`, {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  });
  
  // 개발 모드에서 에러 알림
  if (DEBUG_MODE && typeof window !== 'undefined') {
    // 로컬스토리지에 마지막 에러 저장
    try {
      localStorage.setItem('lastAttachmentError', JSON.stringify({
        component,
        message: error.message,
        context,
        timestamp: new Date().toISOString()
      }));
    } catch (e) {
      logger.warn('Failed to save error to localStorage:', e);
    }
  }
};

/**
 * 디버그 정보를 콘솔에 테이블 형태로 출력
 */
export const printDebugInfo = () => {
  if (!DEBUG_MODE || typeof window === 'undefined') return;
  
  try {
    const logs = JSON.parse(localStorage.getItem('attachmentDebugLogs') || '[]');
    logger.log('📋 Attachment Debug Logs:');
    logger.table(logs.slice(-10)); // 최근 10개만 표시
    
    const lastError = localStorage.getItem('lastAttachmentError');
    if (lastError) {
      logger.log('❌ Last Error:', JSON.parse(lastError));
    }
  } catch (e) {
    logger.warn('Failed to print debug info:', e);
  }
};

/**
 * 디버그 로그 초기화
 */
export const clearDebugLogs = () => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('attachmentDebugLogs');
    localStorage.removeItem('lastAttachmentError');
    logger.log('✅ Debug logs cleared');
  } catch (e) {
    logger.warn('Failed to clear debug logs:', e);
  }
};

// 개발 모드에서 전역 디버그 도구 제공
if (DEBUG_MODE && typeof window !== 'undefined') {
  window.attachmentDebug = {
    logs: () => {
      try {
        return JSON.parse(localStorage.getItem('attachmentDebugLogs') || '[]');
      } catch (e) {
        logger.error('Failed to get logs:', e);
        return [];
      }
    },
    clearLogs: clearDebugLogs,
    lastError: () => {
      try {
        const error = localStorage.getItem('lastAttachmentError');
        return error ? JSON.parse(error) : null;
      } catch (e) {
        logger.error('Failed to get last error:', e);
        return null;
      }
    },
    print: printDebugInfo
  };
  
  logger.log('💡 Attachment debug tools available: window.attachmentDebug');
  logger.log('   - .logs()      : Get all debug logs');
  logger.log('   - .clearLogs() : Clear all logs');
  logger.log('   - .lastError() : Get last error');
  logger.log('   - .print()     : Print debug info table');
}