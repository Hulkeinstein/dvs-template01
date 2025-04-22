import BackToTop from "../backToTop";
import { getAllPostsMeta } from "@/mdx";
import WishlistPage from "./(wishlist)";

export const metadata = {
  title: "Wishlist - Online Courses & Education NEXTJS14 Template",
  description: "Online Courses & Education NEXTJS14 Template",
};

const WishlistLayout = async () => {
  const blog = await getAllPostsMeta();

  return (
    <>
      <WishlistPage getAllBlogs={blog} />
      <BackToTop />
    </>
  );
};

export default WishlistLayout;
