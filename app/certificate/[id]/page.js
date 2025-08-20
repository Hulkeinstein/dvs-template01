import { getCertificate } from "@/app/lib/certificate/actions/certificateActions";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { redirect } from 'next/navigation';
import CertificateView from "@/components/Certificate/CertificateView";

export const metadata = {
  title: "Certificate - DVS-TEMPLATE01",
  description: "View your course completion certificate",
};

const CertificatePage = async ({ params }) => {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const { id } = params;
  const userId = session.user?.id;
  
  // Get certificate data
  const result = await getCertificate(id, userId);
  
  if (!result.success || !result.certificate) {
    return (
      <div className="container mt-5 mb-5 text-center">
        <h2>Certificate not found</h2>
        <p>The certificate you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
        <a href="/student-certificates" className="rbt-btn btn-gradient">Back to My Certificates</a>
      </div>
    );
  }

  return <CertificateView certificate={result.certificate} />;
};

export default CertificatePage;