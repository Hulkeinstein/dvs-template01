import BackToTop from "../backToTop";
import { getAllPostsMeta } from "@/mdx";
import HealthInstitutePage from "./(health-wellness-institute)";

export const metadata = {
  title:
    "Health & Wellness Institute - Online Courses & Education NEXTJS14 Template",
  description: "Online Courses & Education NEXTJS14 Template",
};

const HealthInstituteLayout = async () => {
  const blog = await getAllPostsMeta();

  return (
    <>
      <HealthInstitutePage getAllBlogs={blog} />
      <BackToTop />
    </>
  );
};

export default HealthInstituteLayout;
