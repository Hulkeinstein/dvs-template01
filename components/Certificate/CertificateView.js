'use client';

import { useState } from 'react';
import Image from 'next/image';

const CertificateView = ({ certificate }) => {
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(certificate.pdf_url);

  const certificateData = {
    ...certificate.metadata,
    studentName:
      certificate.user?.full_name || certificate.metadata?.studentName,
    courseName: certificate.course?.title || certificate.metadata?.courseName,
    instructorName:
      certificate.course?.instructor?.full_name ||
      certificate.metadata?.instructorName,
    certificateNumber: certificate.certificate_number,
    issuedDate: certificate.issued_date,
  };

  const handleGeneratePDF = async () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificateId: certificate.id,
          userId: certificate.user_id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setPdfUrl(result.pdfUrl);
        window.open(result.pdfUrl, '_blank');
      } else {
        alert('Failed to generate PDF: ' + result.error);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container mt-5 mb-5">
      <div className="row">
        <div className="col-lg-12">
          <div className="text-center mb-4">
            <h2>Certificate of Completion</h2>
            <p className="text-muted">Course: {certificateData.courseName}</p>
          </div>

          <div className="card">
            <div className="card-body p-4">
              <div className="row mb-4">
                <div className="col-md-6">
                  <h5>Certificate Details</h5>
                  <ul className="list-unstyled">
                    <li>
                      <strong>Student:</strong> {certificateData.studentName}
                    </li>
                    <li>
                      <strong>Course:</strong> {certificateData.courseName}
                    </li>
                    <li>
                      <strong>Instructor:</strong>{' '}
                      {certificateData.instructorName}
                    </li>
                    <li>
                      <strong>Issue Date:</strong>{' '}
                      {formatDate(certificate.issued_date)}
                    </li>
                    <li>
                      <strong>Certificate Number:</strong>{' '}
                      {certificate.certificate_number}
                    </li>
                    {certificate.verification_code && (
                      <li>
                        <strong>Verification Code:</strong>{' '}
                        {certificate.verification_code}
                      </li>
                    )}
                  </ul>
                </div>
                <div className="col-md-6 text-end">
                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      className="rbt-btn btn-gradient"
                      onClick={handleGeneratePDF}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Generating...
                        </>
                      ) : (
                        <>
                          <i className="feather-download me-2"></i>
                          Download PDF
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div
                className="certificate-preview"
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#f8f9fa',
                  minHeight: '400px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div className="text-center p-5">
                  <i
                    className="feather-file-text"
                    style={{ fontSize: '48px', color: '#6c757d' }}
                  ></i>
                  <h4 className="mt-3">Certificate Preview</h4>
                  <p className="text-muted">
                    Click &quot;Download PDF&quot; to generate and view your
                    certificate
                  </p>
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-muted">
                  <i className="feather-info me-2"></i>
                  This certificate verifies that the above-named student has
                  successfully completed the course.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-4">
            <a href="/student-certificates" className="rbt-btn btn-border">
              <i className="feather-arrow-left me-2"></i>
              Back to My Certificates
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateView;
