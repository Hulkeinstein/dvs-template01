'use client';

import Image from 'next/image';
import { usePathname, useParams } from 'next/navigation';

import CourseBreadcrumb from './Breadcrumb/Course-Breadcrumb';

import bgImage from '../../../public/images/bg/bg-image-10.jpg';

const CourseHead = ({ checkMatch, reviewStats }) => {
  const pathname = usePathname();
  const path = useParams();

  return (
    <>
      {pathname === `/course-details/${path.courseId}` ? (
        <>
          <div className="breadcrumb-inner breadcrumb-dark">
            <Image
              src={bgImage}
              width={1425}
              height={583}
              unoptimized={true}
              alt="Education Images"
            />
          </div>
          <div className="container">
            <div className="row">
              <CourseBreadcrumb
                getMatchCourse={checkMatch && checkMatch}
                reviewStats={reviewStats}
              />
            </div>
          </div>
        </>
      ) : (
        ''
      )}
    </>
  );
};

export default CourseHead;
