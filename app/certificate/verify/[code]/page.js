import Link from "next/link";
import { verifyCertificate } from "@/app/lib/certificate/actions/certificateActions";

export const metadata = {
  title: "Verify Certificate - DVS-TEMPLATE01",
  description: "Verify the authenticity of course completion certificates",
};

const CertificateVerifyPage = async ({ params }) => {
  const { code } = params;
  
  // Verify certificate
  const result = await verifyCertificate(code);
  
  return (
    <div className="container mt-5 mb-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body text-center p-5">
              <h2 className="mb-4">Certificate Verification</h2>
              
              {result.verified ? (
                <div>
                  <div className="mb-4">
                    <i className="feather-check-circle text-success" style={{ fontSize: '72px' }}></i>
                  </div>
                  <h3 className="text-success mb-4">Valid Certificate</h3>
                  <div className="certificate-details text-start">
                    <div className="bg-light p-4 rounded">
                      <h5 className="mb-3">Certificate Details:</h5>
                      <ul className="list-unstyled">
                        <li className="mb-2">
                          <strong>Certificate Number:</strong> {result.certificate.certificateNumber}
                        </li>
                        <li className="mb-2">
                          <strong>Student Name:</strong> {result.certificate.studentName}
                        </li>
                        <li className="mb-2">
                          <strong>Course:</strong> {result.certificate.courseName}
                        </li>
                        <li className="mb-2">
                          <strong>Issue Date:</strong> {new Date(result.certificate.issuedDate).toLocaleDateString()}
                        </li>
                      </ul>
                    </div>
                  </div>
                  <p className="mt-4 text-muted">
                    This certificate is authentic and was issued by DVS Learning Platform.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <i className="feather-x-circle text-danger" style={{ fontSize: '72px' }}></i>
                  </div>
                  <h3 className="text-danger mb-4">Invalid Certificate</h3>
                  <p className="text-muted">
                    {result.error || 'The certificate code you entered could not be verified.'}
                  </p>
                  {result.status && result.status !== 'active' && (
                    <p className="text-warning">
                      Certificate status: {result.status}
                    </p>
                  )}
                </div>
              )}
              
              <div className="mt-5">
                <Link href="/" className="rbt-btn btn-gradient">
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateVerifyPage;