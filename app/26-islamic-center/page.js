import BackToTop from "../backToTop";
import { getAllPostsMeta } from "@/mdx";
import IslamicCenterPage from "./(islamic-center)";

export const metadata = {
  title: "Islamic Center - Online Courses & Education NEXTJS14 Template",
  description: "Online Courses & Education NEXTJS14 Template",
};

const IslamicCenterLayout = async () => {
  const blog = await getAllPostsMeta();

  return (
    <>
      <IslamicCenterPage getAllBlogs={blog} />
      <BackToTop />
    </>
  );
};

export default IslamicCenterLayout;
