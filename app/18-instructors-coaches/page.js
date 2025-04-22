import BackToTop from "../backToTop";
import InstructorsCoachesPage from "./(instructors-coaches)";
import { getAllPostsMeta } from "@/mdx";

export const metadata = {
  title: "Instructors & Coaches - Online Courses & Education NEXTJS14 Template",
  description: "Online Courses & Education NEXTJS14 Template",
};

const InstructorsCoachesLayout = async () => {
  const blog = await getAllPostsMeta();
  return (
    <>
      <InstructorsCoachesPage getAllBlogs={blog} />
      <BackToTop />
    </>
  );
};

export default InstructorsCoachesLayout;
