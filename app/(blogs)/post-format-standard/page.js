"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const PostFormatStandardLayout = ({ params }) => {
  const router = useRouter();

  useEffect(() => {
    router.push("/post-format-standard/blog-1");
  }, []);
};

export default PostFormatStandardLayout;
