import BackToTop from "../backToTop";
import { getAllPostsMeta } from "@/mdx";
import MultilingualPage from "./(multilingual)";

export const metadata = {
  title: "Multilingual - Online Courses & Education NEXTJS14 Template",
  description: "Online Courses & Education NEXTJS14 Template",
};

const MultilingualLayout = async () => {
  const blog = await getAllPostsMeta();

  return (
    <>
      <MultilingualPage getAllBlogs={blog} />
      <BackToTop />
    </>
  );
};

export default MultilingualLayout;
