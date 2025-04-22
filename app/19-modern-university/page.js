import BackToTop from "../backToTop";
import ModernUniversityPage from "./(modern-university)";
import { getAllPostsMeta } from "@/mdx";

export const metadata = {
  title: "Modern University - Online Courses & Education NEXTJS14 Template",
  description: "Online Courses & Education NEXTJS14 Template",
};

const ModernUniversityLayout = async () => {
  const blog = await getAllPostsMeta();

  return (
    <>
      <ModernUniversityPage getAllBlogs={blog} />
      <BackToTop />
    </>
  );
};

export default ModernUniversityLayout;
