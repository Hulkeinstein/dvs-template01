import BackToTop from "../backToTop";
import { getAllPostsMeta } from "@/mdx";
import ArtDesignSchoolPage from "./(art-design-school)";

export const metadata = {
  title: "ArtDesignSchool - Online Courses & Education NEXTJS14 Template",
  description: "Online Courses & Education NEXTJS14 Template",
};

const ArtDesignSchoolLayout = async () => {
  const blog = await getAllPostsMeta();

  return (
    <>
      <ArtDesignSchoolPage getAllBlogs={blog} />
      <BackToTop />
    </>
  );
};

export default ArtDesignSchoolLayout;
