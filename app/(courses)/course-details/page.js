"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const CourseLayout = ({ params }) => {
  const router = useRouter();
  const postId = params.courseId;

  useEffect(() => {
    if (postId === undefined) {
      router.push("/course-details/1");
    }
  }, []);
};

export default CourseLayout;
