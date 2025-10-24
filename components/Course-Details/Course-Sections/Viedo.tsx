'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

import 'venobox/dist/venobox.min.css';

import { useDispatch, useSelector } from 'react-redux';
import { useAppContext } from '@/context/Context';
import { addToCartAction } from '@/redux/action/CartAction';
import { CartProduct, CartState } from '@/types/cart';
import { useCart } from '@/hooks/useCart';
import { getUserBookmarks } from '@/app/lib/actions/bookmarkActions';
import { enrollInCourse } from '@/app/lib/actions/enrollmentActions';
import BookmarkButton from '@/components/Common/BookmarkButton';

interface RoadmapItem {
  text: string;
  desc: string;
}

interface CourseData extends CartProduct {
  courseImg?: string;
  previewVideoUrl?: string | null;
  price: number;
  offPrice?: number;
  days?: string;
  roadmap?: RoadmapItem[];
  is_free?: boolean;
}

interface Instructor {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  role?: string;
}

interface ViedoProps {
  checkMatchCourses: CourseData;
  instructor?: Instructor;
}

interface RootState {
  CartReducer: CartState;
}

const Viedo: React.FC<ViedoProps> = ({
  checkMatchCourses,
  instructor = {},
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { cartToggle, setCart } = useAppContext();
  const [toggle, setToggle] = useState(false);
  const [hideOnScroll, setHideOnScroll] = useState(false);
  const [isBookmarkedInitial, setIsBookmarkedInitial] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);

  const disableVideo = [
    '/course-detail-2',
    '/course-detail-3',
    '/course-detail-4',
    '/course-detail-5',
    '/course-detail-6',
    '/course-detail-7',
    '/course-detail-8',
  ].some((path) => pathname.startsWith(path));

  const isVideo = ['/course-detail-6'].some((path) =>
    pathname.startsWith(path)
  );

  // =====> Start ADD-To-Cart
  const dispatch = useDispatch<any>();
  const { cart } = useSelector((state: RootState) => state.CartReducer);
  const { saveCart } = useCart();

  // 코스는 항상 수량이 1
  const amount = 1;

  const addToCartFun = (id: string, amount: number, product: CourseData) => {
    // 코스 데이터 정규화
    const normalizedProduct: CartProduct = {
      ...product,
      kind: 'course',
      courseId: product.courseId || product.id || '',
      courseTitle: product.courseTitle || product.title || '',
      productKey:
        product.productKey ||
        `course:${product.id || product.courseId || (product.title || '').toLowerCase()}`,
    };

    // 코스는 항상 수량 1로 카트에 추가
    dispatch(
      addToCartAction(normalizedProduct.courseId || id, 1, normalizedProduct)
    );
    setCart(!cartToggle);
  };

  const handleAddToCart = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    addToCartFun(checkMatchCourses.id || '', amount, checkMatchCourses);
  };

  const handleBuyNow = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Add single item to cart and go to checkout
    addToCartFun(checkMatchCourses.id || '', 1, checkMatchCourses);
  };

  // Check bookmark status
  useEffect(() => {
    const checkBookmark = async () => {
      if (session?.user?.id && checkMatchCourses.id) {
        try {
          const bookmarks = await getUserBookmarks(session.user.id);
          const isCurrentlyBookmarked = bookmarks.some(
            (b: any) => b.course_id === checkMatchCourses.id
          );
          setIsBookmarkedInitial(isCurrentlyBookmarked);
        } catch (error) {
          console.error('Error checking bookmark:', error);
        }
      }
    };
    checkBookmark();
  }, [session?.user?.id, checkMatchCourses.id]);

  const handleEnrollNow = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!session?.user?.id) {
      router.push('/login');
      return;
    }

    if (!checkMatchCourses?.id) {
      alert('Course information is not available');
      return;
    }

    setIsEnrolling(true);
    try {
      const result = await enrollInCourse({
        userId: session.user.id,
        courseId: checkMatchCourses.id,
      });
      if (result.success) {
        router.push('/dashboard');
      } else {
        alert(result.error || 'Failed to enroll in course');
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      alert('Failed to enroll in course');
    } finally {
      setIsEnrolling(false);
    }
  };

  useEffect(() => {
    dispatch({ type: 'COUNT_CART_TOTALS' });
    saveCart(cart);
  }, [cart, dispatch, saveCart]);

  // =====> For video PopUp
  useEffect(() => {
    import('venobox/dist/venobox.min.js').then((venobox) => {
      new (venobox as any).default({
        selector: '.popup-video',
      });
    });

    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      const isHide = currentScrollPos > 200;

      setHideOnScroll(isHide);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const getVideoUrl = (): string => {
    return (
      checkMatchCourses.previewVideoUrl ||
      'https://www.youtube.com/watch?v=nA1Aqp0sPQo'
    );
  };

  const getEmbedUrl = (): string => {
    const videoUrl = checkMatchCourses.previewVideoUrl;
    if (videoUrl) {
      return (
        videoUrl
          .replace('watch?v=', 'embed/')
          .replace('youtu.be/', 'youtube.com/embed/') +
        '?autoplay=0&controls=1&rel=0&modestbranding=1'
      );
    }
    return 'https://www.youtube.com/embed/DR9lxZ8kPYQ?autoplay=0&controls=1&rel=0&modestbranding=1';
  };

  const formatPrice = (price?: number): string => {
    return price !== undefined ? `$${price}` : '$0';
  };

  return (
    <>
      {!disableVideo ? (
        <Link
          className={`video-popup-with-text video-popup-wrapper text-center popup-video sidebar-video-hidden mb--15 ${
            hideOnScroll ? 'd-none' : ''
          }`}
          data-vbtype="video"
          href={getVideoUrl()}
        >
          <div className="video-content">
            {checkMatchCourses.courseImg && (
              <Image
                className="w-100 rbt-radius"
                src={checkMatchCourses.courseImg}
                width={355}
                height={255}
                alt="Video Images"
              />
            )}
            <div className="position-to-top">
              <span className="rbt-btn rounded-player-2 with-animation">
                <span className="play-icon"></span>
              </span>
            </div>
            <span className="play-view-text d-block color-white">
              <i className="feather-eye"></i> Preview this course
            </span>
          </div>
        </Link>
      ) : null}

      {isVideo ? (
        <div
          className={`radius-6 overflow-hidden sidebar-video-hidden mb--30 ${
            hideOnScroll ? 'd-none' : ''
          }`}
        >
          <div className="plyr__video-embed rbtplayer">
            <iframe
              className="radius-6 overflow-hidden"
              src={getEmbedUrl()}
              allowFullScreen
              width={355}
              height={200}
              allow="autoplay"
            ></iframe>
          </div>
        </div>
      ) : null}

      <div className="content-item-content">
        <div className="rbt-price-wrapper d-flex flex-wrap align-items-center justify-content-between">
          <div className="rbt-price">
            <span className="current-price">
              {formatPrice(checkMatchCourses.price)}
            </span>
            <span className="off-price">
              {formatPrice(checkMatchCourses.offPrice)}
            </span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <BookmarkButton
              courseId={checkMatchCourses.id || ''}
              initialBookmarked={isBookmarkedInitial}
              variant="button"
            />
            <div className="discount-time">
              <span className="rbt-badge color-danger bg-color-danger-opacity">
                <i className="feather-clock"></i>{' '}
                {checkMatchCourses.days || '3'} days left!
              </span>
            </div>
          </div>
        </div>

        {checkMatchCourses.is_free ? (
          <div className="add-to-card-button mt--15">
            <Link
              className="rbt-btn btn-gradient icon-hover w-100 d-block text-center"
              href="#"
              onClick={handleEnrollNow}
            >
              <span className="btn-text">
                {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
              </span>
              <span className="btn-icon">
                <i className="feather-check-circle"></i>
              </span>
            </Link>
          </div>
        ) : (
          <>
            <div className="add-to-card-button mt--15">
              <Link
                className="rbt-btn btn-gradient icon-hover w-100 d-block text-center"
                href="#"
                onClick={handleAddToCart}
              >
                <span className="btn-text">Add to Cart</span>
                <span className="btn-icon">
                  <i className="feather-arrow-right"></i>
                </span>
              </Link>
            </div>

            <div className="buy-now-btn mt--15">
              <Link
                className="rbt-btn btn-border icon-hover w-100 d-block text-center"
                href="/checkout"
                onClick={handleBuyNow}
              >
                <span className="btn-text">Buy Now</span>
                <span className="btn-icon">
                  <i className="feather-arrow-right"></i>
                </span>
              </Link>
            </div>
          </>
        )}
        <span className="subtitle">
          <i className="feather-rotate-ccw"></i> 30-Day Money-Back Guarantee
        </span>
        <div
          className={`rbt-widget-details has-show-more ${
            toggle ? 'active' : ''
          }`}
        >
          <ul className="has-show-more-inner-content rbt-course-details-list-wrapper">
            {checkMatchCourses.roadmap &&
              checkMatchCourses.roadmap.map((item, innerIndex) => (
                <li key={innerIndex}>
                  <span>{item.text}</span>
                  <span className="rbt-feature-value rbt-badge-5">
                    {item.desc}
                  </span>
                </li>
              ))}
          </ul>
          <div
            className={`rbt-show-more-btn ${toggle ? 'active' : ''}`}
            onClick={() => setToggle(!toggle)}
          >
            Show More
          </div>
        </div>

        <div className="social-share-wrapper mt--30 text-center">
          <div className="rbt-post-share d-flex align-items-center justify-content-center">
            <ul className="social-icon social-default transparent-with-border justify-content-center">
              <li>
                <Link href="https://www.facebook.com/">
                  <i className="feather-facebook"></i>
                </Link>
              </li>
              <li>
                <Link href="https://www.twitter.com">
                  <i className="feather-twitter"></i>
                </Link>
              </li>
              <li>
                <Link href="https://www.instagram.com/">
                  <i className="feather-instagram"></i>
                </Link>
              </li>
              <li>
                <Link href="https://www.linkdin.com/">
                  <i className="feather-linkedin"></i>
                </Link>
              </li>
            </ul>
          </div>
          <hr className="mt--20" />
          <div className="contact-with-us text-center">
            <p>For details about the course</p>
            <p className="rbt-badge-2 mt--10 justify-content-center w-100">
              <i className="feather-phone mr--5"></i> Call Us:
              <Link href="#">
                <strong>{instructor?.phone || 'Contact Support'}</strong>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Viedo;
