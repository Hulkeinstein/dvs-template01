'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  getUserBookmarks,
  removeBookmark,
} from '@/app/lib/actions/bookmarkActions';
import { ROUTES } from '@/app/lib/constants/routes';

interface WishlistProps {
  userId?: string;
}

interface BookmarkedCourse {
  id: string;
  course_id: string;
  created_at: string;
  courses: {
    id: string;
    title: string;
    description: string;
    thumbnail_url: string | null;
    price: number;
    level: string;
    duration: string;
    user: {
      id: string;
      name: string;
      avatar_url: string | null;
    };
  };
}

const Wishlist = ({ userId }: WishlistProps) => {
  const [bookmarks, setBookmarks] = useState<BookmarkedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    const loadBookmarks = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const data = await getUserBookmarks(userId);
        setBookmarks(data);
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBookmarks();
  }, [userId]);

  const handleRemoveBookmark = async (bookmarkId: string) => {
    if (!userId) return;

    setRemovingId(bookmarkId);
    try {
      const result = await removeBookmark(bookmarkId, userId);
      if (result.success) {
        setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
      }
    } catch (error) {
      console.error('Error removing bookmark:', error);
    } finally {
      setRemovingId(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">My Wishlist</h4>
          </div>

          {bookmarks.length > 0 ? (
            <div className="rbt-dashboard-table table-responsive mobile-table-750">
              <table className="rbt-table table table-borderless">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Instructor</th>
                    <th>Price</th>
                    <th>Added On</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {bookmarks.map((bookmark) => (
                    <tr key={bookmark.id}>
                      <th>
                        <div className="course-info d-flex align-items-center">
                          <Link
                            href={ROUTES.COURSE.DETAILS(bookmark.course_id)}
                          >
                            {bookmark.courses.thumbnail_url ? (
                              <img
                                src={bookmark.courses.thumbnail_url}
                                alt={bookmark.courses.title}
                                style={{
                                  width: '60px',
                                  height: '60px',
                                  objectFit: 'cover',
                                  borderRadius: '4px',
                                  marginRight: '15px',
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '60px',
                                  height: '60px',
                                  backgroundColor: '#f0f0f0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '4px',
                                  marginRight: '15px',
                                }}
                              >
                                <i
                                  className="feather-image"
                                  style={{ fontSize: '24px', color: '#ccc' }}
                                ></i>
                              </div>
                            )}
                          </Link>
                          <div>
                            <h6 className="mb-0">
                              <Link
                                href={ROUTES.COURSE.DETAILS(bookmark.course_id)}
                              >
                                {bookmark.courses.title}
                              </Link>
                            </h6>
                            <small className="text-muted">
                              {bookmark.courses.level} •{' '}
                              {bookmark.courses.duration}
                            </small>
                          </div>
                        </div>
                      </th>
                      <td>
                        <div className="rbt-author-info">
                          <p className="mb-0">{bookmark.courses.user.name}</p>
                        </div>
                      </td>
                      <td>
                        <span className="rbt-badge-5 bg-primary-opacity">
                          {formatPrice(bookmark.courses.price)}
                        </span>
                      </td>
                      <td>{formatDate(bookmark.created_at)}</td>
                      <td>
                        <div className="rbt-button-group justify-content-end">
                          <Link
                            href={ROUTES.COURSE.DETAILS(bookmark.course_id)}
                            className="rbt-btn btn-xs bg-primary-opacity radius-round"
                            title="View Course"
                          >
                            <i className="feather-eye"></i>
                          </Link>
                          <button
                            className="rbt-btn btn-xs bg-color-danger-opacity radius-round color-danger"
                            title="Remove from Wishlist"
                            onClick={() => handleRemoveBookmark(bookmark.id)}
                            disabled={removingId === bookmark.id}
                          >
                            {removingId === bookmark.id ? (
                              <span
                                className="spinner-border spinner-border-sm"
                                role="status"
                              >
                                <span className="visually-hidden">
                                  Removing...
                                </span>
                              </span>
                            ) : (
                              <i className="feather-trash-2"></i>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i
                className="feather-heart"
                style={{ fontSize: '48px', color: '#ccc' }}
              ></i>
              <h5 className="mt-3">Your wishlist is empty</h5>
              <p className="text-muted">
                Add courses to your wishlist to save them for later
              </p>
              <Link
                href={ROUTES.STUDENT.COURSE_BROWSER}
                className="rbt-btn btn-gradient btn-sm mt-3"
              >
                Browse Courses
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Wishlist;
