/**
 * Test Helper Utilities
 * 테스트 환경에서 사용할 헬퍼 함수들
 */

import { act } from '@testing-library/react';

/**
 * 모든 pending promises, timers, microtasks를 flush
 * @param ms - 대기 시간 (기본값: 0)
 */
export async function flushAll(ms = 0) {
  await act(async () => {
    // 1. 모든 pending promises 처리
    await new Promise((resolve) => setImmediate(resolve));

    // 2. 모든 timers 실행
    if (jest.isMockFunction(setTimeout)) {
      jest.runAllTimers();
    }

    // 3. 추가 대기 시간
    if (ms > 0) {
      await new Promise((resolve) => setTimeout(resolve, ms));
    }

    // 4. microtask queue 비우기
    await Promise.resolve();
  });
}

/**
 * 타임아웃과 함께 비동기 작업 실행
 * @param fn - 실행할 함수
 * @param timeout - 타임아웃 시간 (기본값: 5000ms)
 */
export async function withTimeout(
  fn,
  timeout = 5000
) {
  return Promise.race([
    fn(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout)
    ),
  ]);
}

/**
 * 네트워크 호출이 없었는지 검증
 * fetch, axios 등이 호출되지 않았는지 확인
 */
export function assertNoNetworkCalls() {
  // fetch 검증
  if (jest.isMockFunction(global.fetch)) {
    expect(global.fetch).not.toHaveBeenCalled();
  }

  // axios 검증 (설치된 경우)
  try {
    const axios = require('axios');
    if (jest.isMockFunction(axios.get)) {
      expect(axios.get).not.toHaveBeenCalled();
      expect(axios.post).not.toHaveBeenCalled();
      expect(axios.put).not.toHaveBeenCalled();
      expect(axios.delete).not.toHaveBeenCalled();
    }
  } catch {
    // axios not installed, skip
  }
}

/**
 * 모든 모킹된 함수 초기화
 */
export function resetAllMocks() {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
}

/**
 * 테스트용 delay 함수
 * @param ms - 대기 시간
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 에러를 던지는 함수를 안전하게 테스트
 * @param fn - 테스트할 함수
 */
export async function expectToThrow(
  fn,
  expectedError
) {
  let thrown = false;
  let error;

  try {
    await fn();
  } catch (e) {
    thrown = true;
    error = e;
  }

  expect(thrown).toBe(true);

  if (expectedError) {
    if (typeof expectedError === 'string') {
      expect(error.message).toContain(expectedError);
    } else if (expectedError instanceof RegExp) {
      expect(error.message).toMatch(expectedError);
    } else if (expectedError instanceof Error) {
      expect(error.message).toBe(expectedError.message);
    }
  }
}

/**
 * 테스트 환경 setup/teardown 헬퍼
 */
export class TestEnvironment {
  originalEnv;

  constructor() {
    this.originalEnv = { ...process.env };
  }

  /**
   * 환경 변수 설정
   */
  setEnv(vars) {
    Object.entries(vars).forEach(([key, value]) => {
      process.env[key] = value;
    });
  }

  /**
   * 환경 변수 초기화
   */
  resetEnv() {
    process.env = { ...this.originalEnv };
  }

  /**
   * cleanup 실행
   */
  cleanup() {
    this.resetEnv();
    resetAllMocks();
  }
}

/**
 * Mock 데이터 생성 헬퍼
 */
export class MockDataBuilder {
  /**
   * 사용자 mock 데이터 생성
   */
  static createUser(overrides = {}) {
    return {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'student',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides,
    };
  }

  /**
   * 코스 mock 데이터 생성
   */
  static createCourse(overrides = {}) {
    return {
      id: 'test-course-id',
      title: 'Test Course',
      description: 'Test course description',
      instructor_id: 'test-instructor-id',
      price: 0,
      thumbnail_url: null,
      is_published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides,
    };
  }

  /**
   * 레슨 mock 데이터 생성
   */
  static createLesson(overrides = {}) {
    return {
      id: 'test-lesson-id',
      course_id: 'test-course-id',
      title: 'Test Lesson',
      content_type: 'video',
      content_data: {},
      order_index: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides,
    };
  }
}

/**
 * 테스트 실행 성능 측정
 */
export class TestPerformance {
  startTime;

  constructor() {
    this.startTime = performance.now();
  }

  /**
   * 경과 시간 측정
   */
  elapsed() {
    return performance.now() - this.startTime;
  }

  /**
   * 경과 시간이 threshold 이하인지 검증
   */
  assertUnder(threshold) {
    const elapsed = this.elapsed();
    if (elapsed > threshold) {
      throw new Error(`Performance test failed: ${elapsed}ms > ${threshold}ms`);
    }
  }
}

/**
 * 반복 테스트 헬퍼
 * @param times - 반복 횟수
 * @param fn - 테스트 함수
 */
export async function repeatTest(
  times,
  fn
) {
  for (let i = 0; i < times; i++) {
    await fn(i);
  }
}

/**
 * 조건부 테스트 실행
 * @param condition - 조건
 * @param name - 테스트 이름
 * @param fn - 테스트 함수
 */
export function testIf(
  condition,
  name,
  fn
) {
  if (condition) {
    test(name, fn);
  } else {
    test.skip(name, fn);
  }
}

/**
 * 환경별 테스트 실행
 */
export const testInCI = (name, fn) =>
  testIf(process.env.CI === 'true', `[CI] ${name}`, fn);

export const testInLocal = (name, fn) =>
  testIf(process.env.CI !== 'true', `[Local] ${name}`, fn);
