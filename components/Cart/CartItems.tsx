'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useDispatch } from 'react-redux';

import { deleteProduct, toggleAmount } from '@/redux/action/CartAction';
import { CartProduct } from '@/types/cart';

interface CartItemsProps {
  id: string;
  product: CartProduct;
  amount: number;
}

const CartItems: React.FC<CartItemsProps> = ({ id, product, amount }) => {
  const dispatch = useDispatch<any>();

  // 타입 기반 판단 (레거시 호환성 포함)
  const isCourse = product.kind === 'course' ||
                   !!(product.courseTitle || product.title);

  const increasePrice = () => {
    // 코스는 수량 증가 불가
    if (!isCourse) {
      dispatch(toggleAmount(id, 'inc'));
    }
  };

  const decreasePrice = () => {
    // 코스는 수량 감소 불가
    if (!isCourse) {
      dispatch(toggleAmount(id, 'dec'));
    }
  };

  const handleDelete = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    dispatch(deleteProduct(id));
  };

  const getProductLink = (): string => {
    if (product.productType) {
      return `/single-product/${id}`;
    } else if (product.title && !product.courseTitle) {
      return `/event-details/${id}`;
    } else {
      return `/course-details/${id}`;
    }
  };

  const getProductImage = (): string => {
    return product.courseImg || product.eventImg || product.thumbnail_url || '/images/course/course-01.jpg';
  };

  const getProductTitle = (): string => {
    return product.courseTitle || product.title || 'Untitled Product';
  };

  const quantityInputStyle: React.CSSProperties = {
    width: '28px',
    float: 'left' as const,
    border: 'none',
    height: '33px',
    lineHeight: '33px',
    padding: '0',
    textAlign: 'center' as const,
    backgroundColor: 'transparent',
    boxShadow: 'none',
    color: 'var(--color-white-off)'
  };

  const disabledButtonStyle: React.CSSProperties = {
    opacity: 0.3,
    cursor: 'not-allowed',
    pointerEvents: 'none' as const
  };

  return (
    <tr>
      <td className="pro-thumbnail">
        <Link href={getProductLink()}>
          <Image
            src={getProductImage()}
            width={140}
            height={111}
            alt="Product"
          />
        </Link>
      </td>
      <td className="pro-title">
        <Link href={getProductLink()}>
          {getProductTitle()}
        </Link>
      </td>
      <td className="pro-price">
        <span>${product.price}.00</span>
      </td>
      <td className="pro-quantity">
        <div className="pro-qty">
          {isCourse ? (
            // 코스인 경우: 수량 고정 표시 (버튼 비활성화)
            <>
              <span className="dec qtybtn" style={disabledButtonStyle}>
                -
              </span>
              <input
                type="text"
                value="1"
                readOnly
                style={quantityInputStyle}
              />
              <span className="inc qtybtn" style={disabledButtonStyle}>
                +
              </span>
            </>
          ) : (
            // 이벤트나 물리적 상품인 경우: 수량 조절 가능
            <>
              <span className="dec qtybtn" onClick={decreasePrice}>
                -
              </span>
              <input
                type="text"
                value={amount}
                readOnly
                style={quantityInputStyle}
              />
              <span className="inc qtybtn" onClick={increasePrice}>
                +
              </span>
            </>
          )}
        </div>
      </td>
      <td className="pro-subtotal">
        <span>${product.price * amount}.00</span>
      </td>
      <td className="pro-remove">
        <Link href="#" onClick={handleDelete}>
          <i className="feather-x"></i>
        </Link>
      </td>
    </tr>
  );
};

export default CartItems;