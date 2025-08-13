'use client';

import { useState } from 'react';
import {
  toggleFeaturedBadge,
  refreshCourseBadges,
} from '@/app/lib/actions/badgeActions';

const BadgeManagement = ({ courseId, initialFeatured = false }) => {
  const [isFeatured, setIsFeatured] = useState(initialFeatured);
  const [loading, setLoading] = useState(false);
  const [featuredUntil, setFeaturedUntil] = useState('');

  const handleToggleFeatured = async () => {
    setLoading(true);
    try {
      const result = await toggleFeaturedBadge(
        courseId,
        !isFeatured,
        featuredUntil ? new Date(featuredUntil) : null
      );

      if (result.success) {
        setIsFeatured(!isFeatured);
        // Show success message
        alert(
          isFeatured
            ? 'Featured 배지가 제거되었습니다.'
            : 'Featured 배지가 추가되었습니다.'
        );
      } else {
        alert('오류가 발생했습니다: ' + result.error);
      }
    } catch (error) {
      console.error('Error toggling featured badge:', error);
      alert('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshBadges = async () => {
    setLoading(true);
    try {
      const result = await refreshCourseBadges(courseId);

      if (result.success) {
        alert('배지가 새로고침되었습니다.');
      } else {
        alert('오류가 발생했습니다: ' + result.error);
      }
    } catch (error) {
      console.error('Error refreshing badges:', error);
      alert('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rbt-dashboard-content-wrapper">
      <div className="tutor-bg-photo bg-color-darker"></div>
      <div className="rbt-tutor-information">
        <div className="rbt-tutor-information-left">
          <div className="tutor-content">
            <h5 className="title">배지 관리</h5>
            <p className="mb--0">코스의 배지를 관리합니다.</p>
          </div>
        </div>
      </div>

      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="section-title">
            <h4 className="rbt-title-style-3">Featured 배지 설정</h4>
          </div>

          <div className="row g-5">
            <div className="col-lg-6">
              <div className="form-group">
                <label className="form-label">Featured 배지</label>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="featuredSwitch"
                    checked={isFeatured}
                    onChange={handleToggleFeatured}
                    disabled={loading}
                  />
                  <label className="form-check-label" htmlFor="featuredSwitch">
                    {isFeatured ? '활성화됨' : '비활성화됨'}
                  </label>
                </div>
                <small className="form-text text-muted">
                  Featured 배지를 활성화하면 코스가 추천 코스로 표시됩니다.
                </small>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="form-group">
                <label htmlFor="featuredUntil" className="form-label">
                  Featured 만료일 (선택사항)
                </label>
                <input
                  type="date"
                  className="form-control"
                  id="featuredUntil"
                  value={featuredUntil}
                  onChange={(e) => setFeaturedUntil(e.target.value)}
                  disabled={!isFeatured || loading}
                  min={new Date().toISOString().split('T')[0]}
                />
                <small className="form-text text-muted">
                  설정하지 않으면 수동으로 해제할 때까지 유지됩니다.
                </small>
              </div>
            </div>
          </div>

          <div className="row mt--30">
            <div className="col-lg-12">
              <div className="section-title">
                <h4 className="rbt-title-style-3">자동 배지</h4>
                <p className="description">
                  다음 배지들은 시스템에서 자동으로 부여됩니다:
                </p>
              </div>

              <div className="row g-3">
                <div className="col-md-6 col-lg-4">
                  <div className="badge-info-card">
                    <span className="badge-icon">🏆</span>
                    <h6>Bestseller</h6>
                    <small>등록 학생 100명 이상</small>
                  </div>
                </div>
                <div className="col-md-6 col-lg-4">
                  <div className="badge-info-card">
                    <span className="badge-icon">🔥</span>
                    <h6>Hot</h6>
                    <small>주간 등록 20명 이상</small>
                  </div>
                </div>
                <div className="col-md-6 col-lg-4">
                  <div className="badge-info-card">
                    <span className="badge-icon">✨</span>
                    <h6>New</h6>
                    <small>생성 후 7일 이내</small>
                  </div>
                </div>
                <div className="col-md-6 col-lg-4">
                  <div className="badge-info-card">
                    <span className="badge-icon">💰</span>
                    <h6>Sale</h6>
                    <small>할인가 설정 시</small>
                  </div>
                </div>
                <div className="col-md-6 col-lg-4">
                  <div className="badge-info-card">
                    <span className="badge-icon">🎯</span>
                    <h6>Limited</h6>
                    <small>수강 인원 80% 이상</small>
                  </div>
                </div>
                <div className="col-md-6 col-lg-4">
                  <div className="badge-info-card">
                    <span className="badge-icon">🎓</span>
                    <h6>Certified</h6>
                    <small>수료증 제공 시</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row mt--30">
            <div className="col-lg-12">
              <button
                className="rbt-btn btn-gradient"
                onClick={handleRefreshBadges}
                disabled={loading}
              >
                {loading ? '처리 중...' : '배지 새로고침'}
              </button>
              <small className="d-block mt--10 text-muted">
                배지 조건이 변경되었을 때 수동으로 새로고침할 수 있습니다.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgeManagement;
