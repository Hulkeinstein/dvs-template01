/**
 * 체크아웃 시스템 테스트 스니펫 모음
 * 브라우저 콘솔에서 복사-붙여넣기로 즉시 실행 가능
 * 작성일: 2025-09-30
 */

// ============================================================================
// 1. 환경 초기화
// ============================================================================

/**
 * 테스트 환경 완전 초기화
 */
function resetTestEnvironment() {
  console.log('🔄 Resetting test environment...');
  localStorage.clear();
  sessionStorage.clear();
  console.log('✅ Storage cleared');
  console.log('🔄 Reloading page in 2 seconds...');
  setTimeout(() => location.reload(), 2000);
}

// ============================================================================
// 2. 카트 상태 진단
// ============================================================================

/**
 * 현재 카트 상태 전체 진단
 */
function checkCartState() {
  console.group('🛒 Cart State Diagnosis');

  // Storage 확인
  console.group('📦 Storage');
  const hiStudy = localStorage.getItem('hiStudy');
  console.log('localStorage.hiStudy:', hiStudy);
  if (hiStudy) {
    try {
      const parsed = JSON.parse(hiStudy);
      console.log('Parsed cart items:', parsed);
      console.log('Item count:', parsed.length);
    } catch (e) {
      console.error('Failed to parse hiStudy:', e);
    }
  }
  console.log('localStorage.cartItems:', localStorage.getItem('cartItems'));
  console.groupEnd();

  // Redux 상태 확인 (Redux DevTools 필요)
  console.group('🔄 Redux State');
  try {
    if (window.__REDUX_DEVTOOLS_EXTENSION__) {
      const state = window.__REDUX_DEVTOOLS_EXTENSION__.store.getState();
      const cart = state.CartReducer;
      console.log('Cart items:', cart.cart);
      console.log('Total items:', cart.total_items);
      console.log('Total amount:', cart.total_amount);
    } else {
      // Fallback: window.store 확인
      if (window.store) {
        const state = store.getState().CartReducer;
        console.log('Cart items:', state.cart);
        console.log('Total items:', state.total_items);
      } else {
        console.log('Redux DevTools not available');
      }
    }
  } catch (e) {
    console.error('Redux state check failed:', e);
  }
  console.groupEnd();

  // UI 요소 확인
  console.group('🎨 UI Elements');
  const badges = document.querySelectorAll('[class*="badge"]');
  let cartBadgeFound = false;
  badges.forEach(badge => {
    const text = badge.textContent?.trim();
    if (text && !isNaN(text)) {
      console.log('Cart badge value:', text);
      cartBadgeFound = true;
    }
  });
  if (!cartBadgeFound) {
    console.log('Cart badge not found or empty');
  }
  console.groupEnd();

  console.groupEnd();
  return hiStudy;
}

// ============================================================================
// 3. 주문 테스트
// ============================================================================

/**
 * 더블 클릭 방지 테스트
 */
function testDoubleClickPrevention() {
  console.log('🔄 Testing double-click prevention...');

  const submitBtn = document.querySelector('button[type="submit"]') ||
                    document.querySelector('[data-testid="place-order"]') ||
                    document.querySelector('button:contains("Place Order")');

  if (!submitBtn) {
    console.error('❌ Submit button not found');
    return;
  }

  // 첫 번째 클릭
  console.log('First click...');
  submitBtn.click();

  // 100ms 후 두 번째 클릭 시도
  setTimeout(() => {
    console.log('Second click attempt...');
    submitBtn.click();
  }, 100);

  // 3초 후 결과 확인
  setTimeout(() => {
    const errorElements = document.querySelectorAll('[class*="error"], [class*="alert"]');
    let duplicateError = false;

    errorElements.forEach(el => {
      if (el.textContent?.toLowerCase().includes('already')) {
        console.log('✅ Duplicate prevention works! Message:', el.textContent);
        duplicateError = true;
      }
    });

    if (!duplicateError) {
      console.log('⚠️ No duplicate error message found (may have succeeded on first click)');
    }
  }, 3000);
}

/**
 * 네트워크 오류 시뮬레이션
 */
function simulateNetworkError(duration = 10000) {
  const originalFetch = window.fetch;
  let errorCount = 0;

  window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && (url.includes('/api/') || url.includes('order'))) {
      errorCount++;
      console.log(`🔴 Blocking network request #${errorCount}:`, url);
      return Promise.reject(new Error('Network error (simulated)'));
    }
    return originalFetch.apply(this, args);
  };

  console.log(`✅ Network error simulation ON for ${duration/1000} seconds`);
  console.log('Try to place an order now...');

  // 자동 복구
  setTimeout(() => {
    window.fetch = originalFetch;
    console.log(`✅ Network restored. ${errorCount} requests were blocked.`);
  }, duration);
}

// ============================================================================
// 4. 세션 테스트
// ============================================================================

/**
 * 세션 경계 테스트
 */
function testSessionBoundary() {
  console.group('🔐 Session Boundary Test');

  // 현재 상태 저장
  const cartBefore = localStorage.getItem('hiStudy');
  console.log('Cart before logout:', cartBefore);

  // 로그아웃 시뮬레이션 안내
  console.log('\n📋 Manual steps:');
  console.log('1. Click logout button');
  console.log('2. Run checkCartState() - cart should persist');
  console.log('3. Login with different account');
  console.log('4. Run checkCartState() - cart should be cleared or different');

  console.groupEnd();
}

/**
 * 다중 탭 동기화 테스트 - 탭 A용
 */
function setupTabA() {
  console.log('📑 TAB A - Monitoring storage changes...');

  // Storage 이벤트 리스너
  window.addEventListener('storage', (e) => {
    if (e.key === 'hiStudy') {
      console.group('📢 Storage Event Detected!');
      console.log('Key:', e.key);
      console.log('Old value:', e.oldValue?.substring(0, 50) + '...');
      console.log('New value:', e.newValue?.substring(0, 50) + '...');
      console.log('URL:', e.url);
      console.groupEnd();

      // UI 업데이트 트리거 확인
      setTimeout(() => {
        console.log('Checking if UI updated...');
        checkCartState();
      }, 1000);
    }
  });

  console.log('✅ Tab A ready. Make changes in Tab B to see events.');
}

/**
 * 다중 탭 동기화 테스트 - 탭 B용
 */
function setupTabB() {
  console.log('📑 TAB B - Ready to make changes');
  console.log('Current cart:', localStorage.getItem('hiStudy'));
  console.log('\nInstructions:');
  console.log('1. Add/remove items from cart');
  console.log('2. Or complete an order');
  console.log('3. Check Tab A console for storage events');
}

// ============================================================================
// 5. 자동화 테스트
// ============================================================================

/**
 * 전체 자동 테스트 스위트
 */
async function runFullTestSuite() {
  const results = {
    passed: [],
    failed: [],
    warnings: [],
    timestamp: new Date().toISOString()
  };

  console.log('🚀 Starting Full Test Suite...\n');

  // Test 1: Storage 초기화
  console.group('Test 1: Storage Clear');
  localStorage.clear();
  if (!localStorage.getItem('hiStudy') && !localStorage.getItem('cartItems')) {
    results.passed.push('Storage clear');
    console.log('✅ Passed');
  } else {
    results.failed.push('Storage clear');
    console.log('❌ Failed');
  }
  console.groupEnd();

  // Test 2: Cart State 확인
  console.group('Test 2: Cart State Check');
  const cartState = checkCartState();
  if (!cartState) {
    results.passed.push('Empty cart state');
    console.log('✅ Passed');
  } else {
    results.warnings.push('Cart not empty after clear');
    console.log('⚠️ Warning: Cart not empty');
  }
  console.groupEnd();

  // Test 3: UI Badge 확인
  console.group('Test 3: UI Badge Check');
  const badge = document.querySelector('.rbt-cart-badge') ||
                document.querySelector('[class*="cart"] [class*="badge"]');
  if (!badge || badge.textContent === '0' || badge.style.display === 'none') {
    results.passed.push('UI badge correct');
    console.log('✅ Passed');
  } else {
    results.failed.push('UI badge shows items');
    console.log('❌ Failed: Badge shows', badge.textContent);
  }
  console.groupEnd();

  // 결과 요약
  console.group('\n📊 Test Results Summary');
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️ Warnings: ${results.warnings.length}`);
  console.log('\nDetails:');
  console.table({
    Passed: results.passed,
    Failed: results.failed,
    Warnings: results.warnings
  });
  console.groupEnd();

  // 결과 저장
  sessionStorage.setItem('lastTestResults', JSON.stringify(results));

  return results;
}

// ============================================================================
// 6. 유틸리티 함수
// ============================================================================

/**
 * 주문 성공 시뮬레이션 (개발용)
 */
function simulateOrderSuccess() {
  console.log('🎯 Simulating order success...');

  // localStorage 클리어
  localStorage.removeItem('hiStudy');

  // Redux 액션 디스패치 (store가 전역에 노출된 경우)
  if (window.store) {
    store.dispatch({ type: 'CLEAR_CART' });
    console.log('✅ Dispatched CLEAR_CART action');
  }

  // 성공 메시지 표시
  console.log('✅ Order success simulated');
  console.log('Cart should now be empty. Run checkCartState() to verify.');
}

/**
 * 카트에 테스트 아이템 추가 (개발용)
 */
function addTestItemToCart() {
  const testItem = {
    id: 'test-' + Date.now(),
    amount: 1,
    product: {
      id: 'test-course-001',
      title: 'Test Course',
      courseTitle: 'Test Course',
      price: 99.99,
      regular_price: 99.99,
      kind: 'course'
    }
  };

  // 현재 카트 가져오기
  let cart = [];
  const stored = localStorage.getItem('hiStudy');
  if (stored) {
    try {
      cart = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse existing cart');
    }
  }

  // 아이템 추가
  cart.push(testItem);

  // 저장
  localStorage.setItem('hiStudy', JSON.stringify(cart));

  console.log('✅ Test item added to cart');
  console.log('Item:', testItem);
  console.log('Total items in cart:', cart.length);

  // 페이지 새로고침으로 UI 업데이트
  console.log('Refreshing page to update UI...');
  setTimeout(() => location.reload(), 1000);
}

/**
 * 뒤로가기 방어 테스트
 */
function testBackButtonDefense() {
  console.group('🔙 Back Button Defense Test');

  // 현재 URL과 카트 상태 저장
  const currentUrl = window.location.href;
  const currentCart = localStorage.getItem('hiStudy');

  console.log('Current URL:', currentUrl);
  console.log('Current cart:', currentCart ? 'Has items' : 'Empty');

  // 히스토리 조작
  console.log('\nInstructions:');
  console.log('1. Press browser back button');
  console.log('2. Run checkCartState() to see if cart persists incorrectly');
  console.log('3. Check if you see "Your cart is empty" message');

  // 뒤로가기 이벤트 리스너
  window.addEventListener('popstate', (event) => {
    console.log('⬅️ Back button pressed!');
    setTimeout(() => {
      checkCartState();
    }, 500);
  });

  console.groupEnd();
}

// ============================================================================
// 7. 도움말
// ============================================================================

/**
 * 사용 가능한 모든 테스트 함수 표시
 */
function showTestHelp() {
  console.group('📚 Available Test Functions');

  const functions = [
    { name: 'resetTestEnvironment()', desc: 'Clear all storage and reload' },
    { name: 'checkCartState()', desc: 'Full cart state diagnosis' },
    { name: 'testDoubleClickPrevention()', desc: 'Test duplicate order prevention' },
    { name: 'simulateNetworkError()', desc: 'Simulate network failure' },
    { name: 'testSessionBoundary()', desc: 'Test session transitions' },
    { name: 'setupTabA()', desc: 'Setup multi-tab test (Tab A)' },
    { name: 'setupTabB()', desc: 'Setup multi-tab test (Tab B)' },
    { name: 'runFullTestSuite()', desc: 'Run all automated tests' },
    { name: 'simulateOrderSuccess()', desc: 'Simulate successful order' },
    { name: 'addTestItemToCart()', desc: 'Add test item to cart' },
    { name: 'testBackButtonDefense()', desc: 'Test back button behavior' },
    { name: 'showTestHelp()', desc: 'Show this help' }
  ];

  console.table(functions);

  console.log('\n💡 Quick Start:');
  console.log('1. Run resetTestEnvironment() to start fresh');
  console.log('2. Run checkCartState() to see current state');
  console.log('3. Run runFullTestSuite() for automated testing');

  console.groupEnd();
}

// ============================================================================
// 초기 실행
// ============================================================================

console.log('✅ Checkout Test Snippets Loaded!');
console.log('Run showTestHelp() to see all available functions');
console.log('Run checkCartState() to start diagnosis');