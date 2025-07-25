import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect, notFound } from "next/navigation";
import { supabase } from "@/app/lib/supabase/client";
import EditCourse from "@/components/Instructor/EditCourse";

export const metadata = {
  title: "Edit Course - Instructor Dashboard",
  description: "Edit your course content and settings",
};

async function getUserProfile(email) {
  const { data, error } = await supabase
    .from('user')
    .select('*')
    .eq('email', email)
    .single();
    
  if (error || !data) {
    return null;
  }
  
  return data;
}

async function checkCourseExists(courseId) {
  const { data, error } = await supabase
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .single();
    
  return !error && data;
}

export default async function EditCoursePage({ params }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/auth/signin");
  }
  
  const userProfile = await getUserProfile(session.user.email);
  
  if (!userProfile || userProfile.role !== 'instructor') {
    redirect("/student/dashboard");
  }
  
  // Check if course exists
  const courseExists = await checkCourseExists(params.id);
  if (!courseExists) {
    notFound();
  }
  
  return <EditCourse courseId={params.id} userProfile={userProfile} />;
}