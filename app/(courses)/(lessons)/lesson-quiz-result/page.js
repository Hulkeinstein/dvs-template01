import BackToTop from "@/app/backToTop";
import QuizResultContent from "./QuizResultContent";

export const metadata = {
  title: "Lesson Quiz Result - Online Courses & Education NEXTJS14 Template",
  description: "Online Courses & Education NEXTJS14 Template",
};

const LessonQuizResultPage = () => {
  return (
    <>
      <QuizResultContent />
      <BackToTop />
    </>
  );
};

export default LessonQuizResultPage;
