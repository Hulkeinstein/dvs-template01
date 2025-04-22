import BackToTop from "../backToTop";
import OnlineAcademyPage from "./(online-academy)";
import { getAllPostsMeta } from "@/mdx";

export const metadata = {
  title: "Online Academy - Online Courses & Education NEXTJS14 Template",
  description: "Online Courses & Education NEXTJS14 Template",
};

const OnlineAcademyLayout = async () => {
  const blog = await getAllPostsMeta();
  return (
    <>
      <OnlineAcademyPage getAllBlogs={blog} />
      <BackToTop />
    </>
  );
};

export default OnlineAcademyLayout;
