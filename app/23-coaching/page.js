import BackToTop from "../backToTop";
import { getAllPostsMeta } from "@/mdx";
import CoachingPage from "./(coaching)";

export const metadata = {
  title: "Coaching - Online Courses & Education NEXTJS14 Template",
  description: "Online Courses & Education NEXTJS14 Template",
};

const CoachingLayout = async () => {
  const blog = await getAllPostsMeta();

  return (
    <>
      <CoachingPage getAllBlogs={blog} />
      <BackToTop />
    </>
  );
};

export default CoachingLayout;
