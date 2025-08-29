'use client';

import React from 'react';
import Link from 'next/link';

interface ComingSoonPageProps {
  title: string;
  description: string;
  icon: string;
  futureFeatures?: string[];
  expectedDate?: string;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
  title,
  description,
  icon,
  futureFeatures = [],
  expectedDate = 'Coming Soon',
}) => {
  return (
    <>
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mb--60">
        <div className="content">
          <div className="section-title">
            <div className="text-center py-5">
              <div className="mb-4">
                <i
                  className={`${icon} text-primary`}
                  style={{ fontSize: '4rem' }}
                ></i>
              </div>
              <h2 className="rbt-title-style-3 mb-3">{title}</h2>
              <p className="b2 text-muted mb-4">{description}</p>

              <div className="rbt-badge-group justify-content-center mb-4">
                <span className="rbt-badge-5 bg-primary-opacity">
                  <i className="feather-clock me-2"></i>
                  {expectedDate}
                </span>
                <span className="rbt-badge-5 bg-warning-opacity">
                  <i className="feather-tool me-2"></i>
                  Under Development
                </span>
              </div>

              {futureFeatures.length > 0 && (
                <div className="mt-5 mx-auto" style={{ maxWidth: '600px' }}>
                  <h5 className="mb-3">Planned Features</h5>
                  <ul className="list-group">
                    {futureFeatures.map((feature, index) => (
                      <li key={index} className="list-group-item text-start">
                        <i className="feather-check-circle text-success me-2"></i>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-5">
                <Link
                  href="/dashboard"
                  className="rbt-btn btn-gradient hover-icon-reverse"
                >
                  <span className="icon-reverse-wrapper">
                    <span className="btn-text">Back to Dashboard</span>
                    <span className="btn-icon">
                      <i className="feather-arrow-left"></i>
                    </span>
                    <span className="btn-icon">
                      <i className="feather-arrow-left"></i>
                    </span>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Development Notice */}
      <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
        <div className="content">
          <div className="alert alert-info" role="alert">
            <h5 className="alert-heading">
              <i className="feather-info me-2"></i>
              Development Status
            </h5>
            <p className="mb-0">
              This page is currently under development. We&apos;re working hard
              to bring you these features soon. Check back regularly for updates
              or contact support if you need immediate assistance.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ComingSoonPage;
