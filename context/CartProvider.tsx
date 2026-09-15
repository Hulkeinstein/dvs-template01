'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getCartKey,
  migrateLegacyCartIfNeeded,
  CART_PREFIX,
} from '@/app/lib/utils/cartKey';

interface CartProviderProps {
  children: React.ReactNode;
}

interface RootState {
  CartReducer: {
    cart: any[];
  };
}

export default function CartProvider({ children }: CartProviderProps) {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.CartReducer.cart);
  const lastSnapshotRef = useRef<string | null>(null);

  // 1) 레거시 키 1회 마이그레이션
  useEffect(() => {
    if (typeof window !== 'undefined') {
      migrateLegacyCartIfNeeded();
    }
  }, []);

  // 2) 세션 변화 시 게스트 → 사용자 카트 마이그레이션
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userId = session?.user?.id as string | undefined;
    const guestKey = getCartKey();
    const userKey = getCartKey(userId);

    const guestCart = localStorage.getItem(guestKey);
    const userCart = localStorage.getItem(userKey);

    // 로그인 시 게스트 카트를 사용자 카트로 승격
    if (userId && guestCart && !userCart) {
      try {
        const guestData = JSON.parse(guestCart);
        localStorage.setItem(userKey, guestCart);
        localStorage.removeItem(guestKey);
        dispatch({ type: 'SYNC_CART', payload: guestData });
        console.log('Guest cart migrated to user cart');
      } catch (error) {
        console.error('Failed to migrate guest cart:', error);
      }
    }
    // 사용자 카트가 있으면 로드
    else if (userId && userCart) {
      try {
        const userData = JSON.parse(userCart);
        // 현재 Redux 카트와 다르면 동기화
        if (JSON.stringify(cart) !== userCart) {
          dispatch({ type: 'SYNC_CART', payload: userData });
        }
      } catch (error) {
        console.error('Failed to load user cart:', error);
      }
    }
    // 로그아웃 시 게스트 카트 로드
    else if (!userId && guestCart) {
      try {
        const guestData = JSON.parse(guestCart);
        if (JSON.stringify(cart) !== guestCart) {
          dispatch({ type: 'SYNC_CART', payload: guestData });
        }
      } catch (error) {
        console.error('Failed to load guest cart:', error);
      }
    }
  }, [session, dispatch]); // cart 제외하여 무한 루프 방지

  // 3) 카트 변경 시 localStorage 동기화 (단일 작성자 패턴)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userId = session?.user?.id as string | undefined;
    const key = getCartKey(userId);
    const snapshot = JSON.stringify(Array.isArray(cart) ? cart : []);

    // 빈 카트일 때 명시적으로 제거 (다른 탭 동기화를 위해)
    if (!Array.isArray(cart) || cart.length === 0) {
      if (lastSnapshotRef.current !== '[]') {
        localStorage.removeItem(key); // storage 이벤트: newValue = null
        lastSnapshotRef.current = '[]';
      }
      return;
    }

    // 스냅샷 비교로 중복 저장 방지
    if (lastSnapshotRef.current !== snapshot) {
      localStorage.setItem(key, snapshot);
      lastSnapshotRef.current = snapshot;
    }
  }, [cart, session]);

  // 4) 탭 간 실시간 동기화
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      // 다른 탭에서 변경된 경우만 처리
      if (!e.key || !e.key.startsWith(CART_PREFIX)) return;

      const userId = session?.user?.id as string | undefined;
      const currentKey = getCartKey(userId);

      // 현재 사용자의 카트 키가 변경된 경우
      if (e.key === currentKey) {
        try {
          // null (removeItem) 또는 빈 배열 처리
          const newCart = e.newValue ? JSON.parse(e.newValue) : [];
          const currentSnapshot = JSON.stringify(cart);
          const newSnapshot = JSON.stringify(newCart);

          // 현재 카트와 다른 경우만 동기화
          if (currentSnapshot !== newSnapshot) {
            dispatch({ type: 'SYNC_CART', payload: newCart });
            console.log('Cart synced from another tab');
          }
        } catch (error) {
          console.error('Failed to sync cart from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [dispatch, session, cart]);

  return <>{children}</>;
}
