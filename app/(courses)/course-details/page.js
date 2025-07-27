"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CourseDetailsPage() {
  const router = useRouter();
  
  useEffect(() => {
    // 코스 목록 페이지로 리다이렉트
    router.push("/course-filter-one-toggle");
  }, [router]);
  
  return null;
}
