import BackToTop from "../backToTop";
import { getAllPostsMeta } from "@/mdx";
import LifeCoachPage from "./(life-coach)";

export const metadata = {
  title: "Life Coach - Online Courses & Education NEXTJS14 Template",
  description: "Online Courses & Education NEXTJS14 Template",
};

const LifeCoachLayout = async () => {
  const blog = await getAllPostsMeta();

  return (
    <>
      <LifeCoachPage getAllBlogs={blog} />
      <BackToTop />
    </>
  );
};

export default LifeCoachLayout;
