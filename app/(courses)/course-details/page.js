'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CourseDetailsPage() {
  const router = useRouter();

  useEffect(() => {
    // 데모 코스로 리다이렉트
    router.push('/course-details/1');
  }, [router]);

  return null;
}
