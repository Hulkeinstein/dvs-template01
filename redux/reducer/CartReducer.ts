import {
  CartState,
  CartAction,
  CartItem,
  AddToCartPayload,
  ToggleAmountPayload,
} from '@/types/cart';

const getLocalStorage = (): CartItem[] => {
  if (typeof window !== 'undefined') {
    const cart = localStorage.getItem('hiStudy');

    if (cart) {
      try {
        return JSON.parse(cart);
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        return [];
      }
    } else {
      return [];
    }
  } else {
    return [];
  }
};

const initialState: CartState = {
  cart: getLocalStorage(),
  total_items: 0,
  total_amount: 0,
  shipping_fee: 80,
  loading: false,
  error: false,
  msg: '',
};

export const CartReducer = (
  state = initialState,
  action: CartAction
): CartState => {
  switch (action.type) {
    case 'CART_REQ':
      return {
        ...state,
        loading: true,
      };

    case 'CART_REQ_OUT':
      return {
        ...state,
        loading: false,
      };

    case 'ADD_TO_CART': {
      const payload = action.payload as AddToCartPayload;
      if (!payload) return state;

      const { id, amount, product } = payload;

      // 타입 기반 판단 (레거시 호환성 포함)
      const isCourse = product.kind === 'course' || !!product.courseTitle;

      // 고유키 생성
      const productKey =
        product.productKey ||
        (isCourse
          ? `course:${product.courseId || product.id || id}`
          : `product:${product.id || id}`);

      // 고유키로 중복 체크 (레거시 호환성 포함)
      const tempItem = state.cart.find(
        (i) => (i.productKey && i.productKey === productKey) || i.id === id
      );

      if (tempItem) {
        if (isCourse) {
          // 코스는 중복 추가 무시
          return {
            ...state,
            msg: 'Course already in cart',
          };
        }

        // 일반 상품만 수량 증가
        const tempCart = state.cart.map((cartItem) => {
          if (
            (cartItem.productKey && cartItem.productKey === productKey) ||
            cartItem.id === id
          ) {
            let newAmount = cartItem.amount + amount;
            if (newAmount > cartItem.max) {
              newAmount = cartItem.max;
            }
            return { ...cartItem, amount: newAmount };
          }
          return cartItem;
        });

        return {
          ...state,
          cart: tempCart,
          msg: 'Quantity updated',
        };
      } else {
        // 새 아이템 추가
        const newItem: CartItem = {
          id: id,
          productKey: productKey,
          kind: isCourse ? 'course' : 'product',
          price: product.price,
          product,
          amount: isCourse ? 1 : amount,
          max: isCourse ? 1 : 10,
        };

        return {
          ...state,
          cart: [...state.cart, newItem],
          msg: 'item add successfully',
        };
      }
    }

    case 'TOGGLE_CART_AMOUNT': {
      const payload = action.payload as ToggleAmountPayload;
      if (!payload) return state;

      const { id, value } = payload;

      const tempCart = state.cart.map((item) => {
        if (item.id === id) {
          // 타입 기반 판단 (레거시 호환성 포함)
          const isCourse =
            item.kind === 'course' ||
            item.product?.kind === 'course' ||
            !!item.product?.courseTitle;

          // 코스인 경우 수량 변경 차단
          if (isCourse) {
            return item; // 수량 변경 없이 그대로 반환
          }

          // 코스가 아닌 경우 기존 로직
          if (value === 'inc') {
            let newAmount = item.amount + 1;
            if (newAmount > item.max) {
              newAmount = item.max;
            }

            return { ...item, amount: newAmount };
          }
          if (value === 'dec') {
            let newAmount = item.amount - 1;
            if (newAmount < 1) {
              newAmount = 1;
            }
            return { ...item, amount: newAmount };
          }
        }
        return item;
      });

      return {
        ...state,
        cart: tempCart,
      };
    }

    case 'COUNT_CART_TOTALS': {
      const { total_items, total_amount } = state.cart.reduce(
        (total, cartItem) => {
          const { amount, price } = cartItem;

          total.total_items += amount;
          total.total_amount += price * amount;
          return total;
        },
        {
          total_items: 0,
          total_amount: 0,
        }
      );
      return {
        ...state,
        total_items,
        total_amount,
      };
    }

    case 'DELETE_CART_ITEM': {
      const id = action.payload as string;
      if (!id) return state;

      const tempCart = state.cart.filter((item) => item.id !== id);
      return {
        ...state,
        cart: tempCart,
      };
    }

    case 'CLEAR_CART':
      return {
        ...state,
        cart: [],
      };

    case 'SYNC_CART':
      return {
        ...state,
        cart: Array.isArray(action.payload) ? action.payload : [],
      };

    case 'SET_CART_ERROR':
      return {
        ...state,
        error: true,
      };

    case 'CLEAR_CART_ERROR':
      return {
        ...state,
        error: false,
        msg: '',
      };

    default:
      return state;
  }
};
