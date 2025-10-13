'use client';

import Link from 'next/link';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import dynamic from 'next/dynamic';
import { useCart } from '@/hooks/useCart';

import CartItems from './CartItems';
import { CartItem, CartState } from '@/types/cart';

// Redux root state type
interface RootState {
  CartReducer: CartState;
}

const CartPage = (): JSX.Element => {
  // Feature flag: 물리적 상품(교재, 자격증 등) 판매 시 true로 변경
  // 온라인 코스는 디지털 상품이므로 배송비 불필요
  const ENABLE_SHIPPING = false;

  // Feature flag: 쿠폰 시스템 구현 시 true로 변경
  // 현재는 백엔드 로직(검증, 할인 계산)이 없어 UI만 비활성화
  const ENABLE_COUPONS = false;

  const dispatch = useDispatch();
  const { cart, total_amount, shipping_fee } = useSelector(
    (state: RootState) => state.CartReducer
  );
  const { saveCart } = useCart();

  useEffect(() => {
    dispatch({ type: 'COUNT_CART_TOTALS' });
    saveCart(cart);
  }, [cart, dispatch, saveCart]);

  return (
    <>
      <div className="cart_area">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <form action="#">
                <div className="cart-table table-responsive mb--60">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="pro-thumbnail">Image</th>
                        <th className="pro-title">Product</th>
                        <th className="pro-price">Price</th>
                        <th className="pro-quantity">Quantity</th>
                        <th className="pro-subtotal">Total</th>
                        <th className="pro-remove">Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item: CartItem) => {
                        return <CartItems key={item.id} {...item} />;
                      })}
                    </tbody>
                  </table>
                </div>
              </form>

              <div className="row g-5">
                <div className="col-lg-6 col-12">
                  {/* 배송비 계산 섹션 - 물리적 상품 판매 시에만 표시 */}
                  {ENABLE_SHIPPING && (
                    <div className="calculate-shipping edu-bg-shade">
                      <div className="section-title text-start">
                        <h4 className="title mb--30">Calculate Shipping</h4>
                      </div>
                      <form action="#">
                        <div className="row">
                          <div className="col-md-6 col-12 mb--25">
                            <div className="rbt-modern-select bg-transparent height-45">
                              <select className="w-100">
                                <option>Bangladesh</option>
                                <option>China</option>
                                <option>country</option>
                                <option>India</option>
                                <option>Japan</option>
                              </select>
                            </div>
                          </div>
                          <div className="col-md-6 col-12 mb--25">
                            <div className="rbt-modern-select bg-transparent height-45">
                              <select className="w-100">
                                <option>Dhaka</option>
                                <option>Barisal</option>
                                <option>Khulna</option>
                                <option>Comilla</option>
                                <option>Chittagong</option>
                              </select>
                            </div>
                          </div>
                          <div className="col-md-6 col-12 mb--25">
                            <input type="text" placeholder="Postcode / Zip" />
                          </div>
                          <div className="col-md-6 col-12 mb--25">
                            <Link
                              className="rbt-btn btn-gradient hover-icon-reverse btn-sm"
                              href="#"
                            >
                              <span className="icon-reverse-wrapper">
                                <span className="btn-text">Estimate</span>
                                <span className="btn-icon">
                                  <i className="feather-arrow-right"></i>
                                </span>
                                <span className="btn-icon">
                                  <i className="feather-arrow-right"></i>
                                </span>
                              </span>
                            </Link>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* 쿠폰 코드 섹션 - 쿠폰 시스템 구현 시에만 표시 */}
                  {ENABLE_COUPONS && (
                    <div className="discount-coupon edu-bg-shade">
                      <div className="section-title text-start">
                        <h4 className="title mb--30">Discount Coupon Code</h4>
                      </div>
                      <form action="#">
                        <div className="row">
                          <div className="col-md-6 col-12 mb--25">
                            <input type="text" placeholder="Coupon Code" />
                          </div>
                          <div className="col-md-6 col-12 mb--25">
                            <button className="rbt-btn btn-gradient hover-icon-reverse btn-sm">
                              <span className="icon-reverse-wrapper">
                                <span className="btn-text">Apply Code</span>
                                <span className="btn-icon">
                                  <i className="feather-arrow-right"></i>
                                </span>
                                <span className="btn-icon">
                                  <i className="feather-arrow-right"></i>
                                </span>
                              </span>
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  )}
                </div>

                <div className="col-lg-5 offset-lg-1 col-12">
                  <div className="cart-summary">
                    <div className="cart-summary-wrap">
                      <div className="section-title text-start">
                        <h4 className="title mb--30">CartPage Summary</h4>
                      </div>
                      <p>
                        Sub Total <span>${total_amount}.00</span>
                      </p>
                      {ENABLE_SHIPPING && (
                        <p>
                          Shipping Cost <span>${shipping_fee}.00</span>
                        </p>
                      )}
                      <h2>
                        Grand Total
                        <span>
                          $
                          {ENABLE_SHIPPING
                            ? (total_amount + shipping_fee).toFixed(2)
                            : total_amount.toFixed(2)}
                        </span>
                      </h2>
                    </div>

                    <div className="cart-submit-btn-group">
                      <div className="single-button w-100">
                        <Link
                          href="/checkout"
                          className="rbt-btn btn-gradient rbt-switch-btn rbt-switch-y w-100 text-center"
                        >
                          <span data-text="Checkout">Checkout</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(CartPage), { ssr: false });
