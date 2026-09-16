// PII 노출 방지: email 대신 userId 사용
export const CART_PREFIX = 'hiStudy';
export const GUEST_KEY = `${CART_PREFIX}_guest`;

export const getCartKey = (userId?: string | null): string => {
  return userId ? `${CART_PREFIX}_${userId}` : GUEST_KEY;
};

// 레거시 키(hiStudy) → 게스트 키로 1회 마이그레이션
export const migrateLegacyCartIfNeeded = (): void => {
  if (typeof window === 'undefined') return;

  const legacy = localStorage.getItem(CART_PREFIX);
  if (legacy) {
    try {
      // 레거시 데이터 검증
      JSON.parse(legacy);
      localStorage.setItem(GUEST_KEY, legacy);
      localStorage.removeItem(CART_PREFIX);
      console.log('Legacy cart migrated to guest cart');
    } catch (error) {
      // 손상된 데이터는 제거
      localStorage.removeItem(CART_PREFIX);
      console.error('Failed to migrate legacy cart:', error);
    }
  }
};

// 모든 카트 관련 키 제거 (로그아웃 시 사용)
export const clearAllCartKeys = (): void => {
  if (typeof window === 'undefined') return;

  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CART_PREFIX)) {
      keysToRemove.push(key);
    }
  }

  // 별도로 제거 (반복 중 수정 방지)
  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
  });

  console.log(`Cleared ${keysToRemove.length} cart keys`);
};
