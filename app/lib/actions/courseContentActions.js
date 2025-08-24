'use server';

import { supabaseServer as supabase } from '@/app/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import { createTopic, updateTopic, deleteTopic } from './topicActions';
import { createLesson, updateLesson, deleteLesson } from './lessonActions';
import {
  createQuizLesson,
  updateQuizLesson,
  deleteQuizLesson,
} from './quizActions';
import {
  createAssignmentLesson,
  updateAssignmentLesson,
  deleteAssignmentLesson,
} from './assignmentActions';

// Save complete course content (topics, lessons, quizzes)
export async function saveCourseContent(courseId, topics) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { error: 'You must be logged in to save course content' };
    }

    // Verify ownership
    const { data: courseCheck } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single();

    const { data: userData } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (
      !userData ||
      !courseCheck ||
      courseCheck.instructor_id !== userData.id
    ) {
      return { error: 'You do not have permission to modify this course' };
    }

    // Get existing topics to determine what to create/update/delete
    const { data: existingTopics } = await supabase
      .from('course_topics')
      .select(
        `
        *,
        lessons (*)
      `
      )
      .eq('course_id', courseId)
      .order('sort_order', { ascending: true });

    const existingTopicIds = existingTopics?.map((t) => t.id) || [];
    const newTopicIds = topics
      .filter((t) => !t.id.toString().startsWith('temp_'))
      .map((t) => t.id);

    // Delete topics that are no longer in the list
    const topicsToDelete = existingTopicIds.filter(
      (id) => !newTopicIds.includes(id)
    );
    for (const topicId of topicsToDelete) {
      await deleteTopic(topicId);
    }

    // Process each topic
    for (let i = 0; i < topics.length; i++) {
      const topic = topics[i];
      let topicId = topic.id;

      // Create new topic if it has a temporary ID
      if (
        topicId.toString().startsWith('temp_') ||
        typeof topicId === 'number'
      ) {
        const result = await createTopic(courseId, {
          name: topic.name,
          summary: topic.summary,
          sort_order: i,
        });

        if (!result.success) {
          return { error: `Failed to create topic: ${result.error}` };
        }

        topicId = result.data.id;
      } else {
        // Update existing topic
        await updateTopic(topicId, {
          name: topic.name,
          summary: topic.summary,
          sort_order: i,
        });
      }

      // Process lessons for this topic
      if (topic.lessons && topic.lessons.length > 0) {
        const existingLessons =
          existingTopics?.find((t) => t.id === topic.id)?.lessons || [];
        const existingLessonIds = existingLessons
          .filter((l) => l.content_type !== 'quiz')
          .map((l) => l.id);
        const newLessonIds = topic.lessons
          .filter((l) => !l.id.toString().startsWith('temp_'))
          .map((l) => l.id);

        // Delete lessons that are no longer in the list
        const lessonsToDelete = existingLessonIds.filter(
          (id) => !newLessonIds.includes(id)
        );
        for (const lessonId of lessonsToDelete) {
          await deleteLesson(lessonId);
        }

        // Create or update lessons
        for (let j = 0; j < topic.lessons.length; j++) {
          const lesson = topic.lessons[j];

          if (
            lesson.id.toString().startsWith('temp_') ||
            typeof lesson.id === 'number'
          ) {
            // Create new lesson
            await createLesson({
              course_id: courseId,
              topic_id: topicId,
              title: lesson.title,
              description: lesson.description,
              video_url: lesson.videoUrl,
              video_source: lesson.videoSource,
              duration_minutes: lesson.duration,
              is_preview: lesson.enablePreview,
              sort_order: j,
              attachments: lesson.attachments,
              thumbnail_url: lesson.thumbnail,
            });
          } else {
            // Update existing lesson
            await updateLesson(lesson.id, {
              title: lesson.title,
              description: lesson.description,
              video_url: lesson.videoUrl,
              video_source: lesson.videoSource,
              duration_minutes: lesson.duration,
              is_preview: lesson.enablePreview,
              sort_order: j,
              attachments: lesson.attachments,
              thumbnail_url: lesson.thumbnail,
            });
          }
        }
      }

      // Process quizzes for this topic
      if (topic.quizzes && topic.quizzes.length > 0) {
        const existingQuizzes =
          existingTopics
            ?.find((t) => t.id === topic.id)
            ?.lessons?.filter((l) => l.content_type === 'quiz') || [];
        const existingQuizIds = existingQuizzes.map((q) => q.id);
        const newQuizIds = topic.quizzes
          .filter((q) => !q.id.toString().startsWith('temp_'))
          .map((q) => q.id);

        // Delete quizzes that are no longer in the list
        const quizzesToDelete = existingQuizIds.filter(
          (id) => !newQuizIds.includes(id)
        );
        for (const quizId of quizzesToDelete) {
          await deleteQuizLesson(quizId);
        }

        // Create or update quizzes
        for (let k = 0; k < topic.quizzes.length; k++) {
          const quiz = topic.quizzes[k];
          const quizOrder = (topic.lessons?.length || 0) + k; // Place quizzes after lessons

          if (
            quiz.id.toString().startsWith('temp_') ||
            typeof quiz.id === 'number'
          ) {
            // Create new quiz
            const quizData = {
              title: quiz.title,
              summary: quiz.summary,
              questions: quiz.questions,
              settings: quiz.settings,
            };

            await createQuizLesson(courseId, topicId, quizData);
          } else {
            // Update existing quiz
            const quizData = {
              title: quiz.title,
              summary: quiz.summary,
              questions: quiz.questions,
              settings: quiz.settings,
            };

            await updateQuizLesson(quiz.id, quizData);
          }
        }
      }

      // Process assignments for this topic
      if (topic.assignments && topic.assignments.length > 0) {
        const existingAssignments =
          existingTopics
            ?.find((t) => t.id === topic.id)
            ?.lessons?.filter((l) => l.content_type === 'assignment') || [];
        const existingAssignmentIds = existingAssignments.map((a) => a.id);
        const newAssignmentIds = topic.assignments
          .filter((a) => !a.id.toString().startsWith('temp_'))
          .map((a) => a.id);

        // Delete assignments that are no longer in the list
        const assignmentsToDelete = existingAssignmentIds.filter(
          (id) => !newAssignmentIds.includes(id)
        );
        for (const assignmentId of assignmentsToDelete) {
          await deleteAssignmentLesson(assignmentId);
        }

        // Create or update assignments
        for (let m = 0; m < topic.assignments.length; m++) {
          const assignment = topic.assignments[m];
          const assignmentOrder =
            (topic.lessons?.length || 0) + (topic.quizzes?.length || 0) + m;

          if (
            assignment.id.toString().startsWith('temp_') ||
            typeof assignment.id === 'number'
          ) {
            // Create new assignment
            await createAssignmentLesson(courseId, topicId, assignment);
          } else {
            // Update existing assignment
            await updateAssignmentLesson(assignment.id, assignment);
          }
        }
      }
    }

    revalidatePath(`/instructor/courses/${courseId}/edit`);
    revalidatePath('/instructor-personal-courses');

    return { success: true };
  } catch (error) {
    console.error('Error saving course content:', error);
    return { success: false, error: error.message };
  }
}

// Sync course content changes (optimized for partial updates)
export async function syncCourseContent(courseId, changes) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { error: 'You must be logged in to sync course content' };
    }

    // Verify ownership
    const { data: courseCheck } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single();

    const { data: userData } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (
      !userData ||
      !courseCheck ||
      courseCheck.instructor_id !== userData.id
    ) {
      return { error: 'You do not have permission to modify this course' };
    }

    // Process changes
    const results = {
      topics: { created: 0, updated: 0, deleted: 0 },
      lessons: { created: 0, updated: 0, deleted: 0 },
      quizzes: { created: 0, updated: 0, deleted: 0 },
      assignments: { created: 0, updated: 0, deleted: 0 },
    };

    // Handle topic changes
    if (changes.topics) {
      for (const change of changes.topics.created || []) {
        const result = await createTopic(courseId, change);
        if (result.success) results.topics.created++;
      }

      for (const change of changes.topics.updated || []) {
        const result = await updateTopic(change.id, change);
        if (result.success) results.topics.updated++;
      }

      for (const topicId of changes.topics.deleted || []) {
        const result = await deleteTopic(topicId);
        if (result.success) results.topics.deleted++;
      }
    }

    // Handle lesson changes
    if (changes.lessons) {
      for (const change of changes.lessons.created || []) {
        const result = await createLesson(change);
        if (result.success) results.lessons.created++;
      }

      for (const change of changes.lessons.updated || []) {
        const result = await updateLesson(change.id, change);
        if (result.success) results.lessons.updated++;
      }

      for (const lessonId of changes.lessons.deleted || []) {
        const result = await deleteLesson(lessonId);
        if (result.success) results.lessons.deleted++;
      }
    }

    // Handle quiz changes
    if (changes.quizzes) {
      for (const change of changes.quizzes.created || []) {
        const result = await createQuizLesson(
          change.courseId,
          change.topicId,
          change
        );
        if (result.success) results.quizzes.created++;
      }

      for (const change of changes.quizzes.updated || []) {
        const result = await updateQuizLesson(change.id, change);
        if (result.success) results.quizzes.updated++;
      }

      for (const quizId of changes.quizzes.deleted || []) {
        const result = await deleteQuizLesson(quizId);
        if (result.success) results.quizzes.deleted++;
      }
    }

    // Handle assignment changes
    if (changes.assignments) {
      for (const change of changes.assignments.created || []) {
        const result = await createAssignmentLesson(
          change.courseId,
          change.topicId,
          change
        );
        if (result.success) results.assignments.created++;
      }

      for (const change of changes.assignments.updated || []) {
        const result = await updateAssignmentLesson(change.id, change);
        if (result.success) results.assignments.updated++;
      }

      for (const assignmentId of changes.assignments.deleted || []) {
        const result = await deleteAssignmentLesson(assignmentId);
        if (result.success) results.assignments.deleted++;
      }
    }

    revalidatePath(`/instructor/courses/${courseId}/edit`);

    return { success: true, results };
  } catch (error) {
    console.error('Error syncing course content:', error);
    return { success: false, error: error.message };
  }
}

// Get complete course content structure
export async function getCourseContent(courseId) {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select(
        `
        *,
        course_topics (
          *,
          lessons (*)
        )
      `
      )
      .eq('id', courseId)
      .single();

    if (error) throw error;

    // Sort topics and lessons
    if (data?.course_topics) {
      data.course_topics.sort((a, b) => a.sort_order - b.sort_order);

      data.course_topics.forEach((topic) => {
        if (topic.lessons) {
          topic.lessons.sort((a, b) => a.sort_order - b.sort_order);
        }
      });
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching course content:', error);
    return { success: false, error: error.message };
  }
}
