"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { getUserCertificates } from "@/app/lib/certificate/actions/certificateActions";
import { isFeatureEnabled } from "@/app/lib/certificate/utils/featureFlags";

const StudentCertificates = ({ userId }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      loadCertificates();
    }
  }, [userId]);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const result = await getUserCertificates(userId);
      
      if (result.success) {
        setCertificates(result.certificates);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error loading certificates:', err);
      setError('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  // Check if feature is enabled
  if (!isFeatureEnabled('CERTIFICATE_ENABLED')) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="rbt-dashboard-content bg-color-white rbt-shadow-box">
      <div className="content">
        <div className="section-title">
          <h4 className="rbt-title-style-3">My Certificates</h4>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            <i className="feather-alert-circle me-2"></i>
            {error}
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-5">
            <i className="feather-award" style={{ fontSize: '48px', color: '#ddd' }}></i>
            <p className="mt-3 text-muted">You haven't earned any certificates yet.</p>
            <p className="text-muted">Complete your enrolled courses to earn certificates!</p>
            <Link href="/course-filter-one-toggle" className="rbt-btn btn-sm mt-3">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="row g-5">
            {certificates.map((certificate) => (
              <div key={certificate.id} className="col-lg-4 col-md-6 col-12">
                <div className="rbt-card variation-03 rbt-hover">
                  <div className="rbt-card-img">
                    <Link href={`/certificate/${certificate.id}`}>
                      <Image
                        src={certificate.course?.thumbnail_url || "/images/course/course-online-01.jpg"}
                        width={355}
                        height={200}
                        alt={certificate.course?.title || "Certificate"}
                      />
                      <div className="rbt-badge-3 bg-white">
                        <span className="rbt-badge-icon">
                          <i className="feather-award"></i>
                        </span>
                      </div>
                    </Link>
                  </div>
                  <div className="rbt-card-body">
                    <h5 className="rbt-card-title">
                      <Link href={`/certificate/${certificate.id}`}>
                        {certificate.course?.title || "Course Certificate"}
                      </Link>
                    </h5>
                    <div className="rbt-card-bottom">
                      <div className="rbt-list-style-1 mb-2">
                        <span className="text-muted">
                          <i className="feather-calendar me-2"></i>
                          Issued: {formatDate(certificate.issued_date)}
                        </span>
                      </div>
                      <div className="rbt-list-style-1 mb-3">
                        <span className="text-muted" style={{ fontSize: '12px' }}>
                          <i className="feather-hash me-2"></i>
                          {certificate.certificate_number}
                        </span>
                      </div>
                      <div className="d-flex gap-2">
                        <Link 
                          href={`/certificate/${certificate.id}`}
                          className="rbt-btn btn-xs bg-primary-opacity radius-round"
                        >
                          <i className="feather-eye me-1"></i>
                          View
                        </Link>
                        <button
                          className="rbt-btn btn-xs bg-color-success-opacity radius-round"
                          onClick={() => window.open(`/certificate/${certificate.id}/download`, '_blank')}
                        >
                          <i className="feather-download me-1"></i>
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCertificates;