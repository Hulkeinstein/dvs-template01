'use client';

import { useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { getCartKey } from '@/app/lib/utils/cartKey';

interface RootState {
  CartReducer: {
    cart: any[];
    total_items: number;
    total_amount: number;
  };
}

export const useCart = () => {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const cart = useSelector((state: RootState) => state.CartReducer.cart);
  const total_items = useSelector(
    (state: RootState) => state.CartReducer.total_items
  );
  const total_amount = useSelector(
    (state: RootState) => state.CartReducer.total_amount
  );

  // 사용자별 카트 키 생성
  const cartKey = useMemo(() => getCartKey(session?.user?.id), [session]);

  // 카트 저장 (Redux만 업데이트 - CartProvider가 localStorage 처리)
  const saveCart = useCallback(
    (nextCart?: any[]) => {
      const cartToSave = nextCart || cart;
      dispatch({ type: 'SYNC_CART', payload: cartToSave });
      dispatch({ type: 'COUNT_CART_TOTALS' });
    },
    [dispatch, cart]
  );

  // 카트 비우기 (Redux만 업데이트 - CartProvider가 localStorage 처리)
  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, [dispatch]);

  // 카트 로드 (초기화 또는 리프레시 시)
  const loadCart = useCallback(() => {
    const storedCart = localStorage.getItem(cartKey);
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        dispatch({ type: 'SYNC_CART', payload: parsedCart });
        dispatch({ type: 'COUNT_CART_TOTALS' });
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    }
  }, [cartKey, dispatch]);

  // 아이템 추가
  const addToCart = useCallback(
    (product: any) => {
      dispatch({ type: 'ADD_TO_CART', payload: product });
    },
    [dispatch]
  );

  // 아이템 제거
  const removeFromCart = useCallback(
    (id: string) => {
      dispatch({ type: 'DELETE_CART_ITEM', payload: id });
    },
    [dispatch]
  );

  // 수량 조절
  const toggleAmount = useCallback(
    (id: string, value: 'inc' | 'dec') => {
      dispatch({ type: 'TOGGLE_CART_AMOUNT', payload: { id, value } });
    },
    [dispatch]
  );

  // Totals 계산 (카트 변경 시)
  // Note: localStorage 저장은 CartProvider에서 처리 (single writer pattern)
  useEffect(() => {
    dispatch({ type: 'COUNT_CART_TOTALS' });
  }, [cart, dispatch]);

  return {
    cart,
    total_items,
    total_amount,
    cartKey,
    saveCart,
    clearCart,
    loadCart,
    addToCart,
    removeFromCart,
    toggleAmount,
    dispatch,
  };
};
