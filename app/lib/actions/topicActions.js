'use server';

import { supabase } from '@/app/lib/supabase/client';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Create a new topic
export async function createTopic(courseId, topicData) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { error: 'You must be logged in to create a topic' };
    }

    // Verify the user owns this course
    const { data: courseCheck, error: checkError } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single();

    if (checkError || !courseCheck) {
      return { error: 'Course not found' };
    }

    // Get user ID
    const { data: userData } = await supabase
      .from('user')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (!userData || courseCheck.instructor_id !== userData.id) {
      return {
        error: 'You do not have permission to add topics to this course',
      };
    }

    // Get the next sort order
    const { data: existingTopics, error: orderError } = await supabase
      .from('course_topics')
      .select('sort_order')
      .eq('course_id', courseId)
      .order('sort_order', { ascending: false })
      .limit(1);

    if (orderError) throw orderError;

    const nextSortOrder = existingTopics?.[0]?.sort_order
      ? existingTopics[0].sort_order + 1
      : 0;

    // Create the topic
    const { data, error } = await supabase
      .from('course_topics')
      .insert({
        course_id: courseId,
        title: topicData.title || topicData.name,
        description: topicData.description || topicData.summary,
        sort_order: nextSortOrder,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath(`/instructor/courses/${courseId}/edit`);

    return { success: true, data };
  } catch (error) {
    console.error('Error creating topic:', error);
    return { success: false, error: error.message };
  }
}

// Update a topic
export async function updateTopic(topicId, updates) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { error: 'You must be logged in to update a topic' };
    }

    // Verify ownership through course
    const { data: topicData, error: topicError } = await supabase
      .from('course_topics')
      .select('course_id')
      .eq('id', topicId)
      .single();

    if (topicError || !topicData) {
      return { error: 'Topic not found' };
    }

    // Verify the user owns this course
    const { data: courseCheck } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', topicData.course_id)
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
      return { error: 'You do not have permission to update this topic' };
    }

    // Update the topic
    const { data, error } = await supabase
      .from('course_topics')
      .update({
        title: updates.title || updates.name,
        description: updates.description || updates.summary,
        updated_at: new Date().toISOString(),
      })
      .eq('id', topicId)
      .select()
      .single();

    if (error) throw error;

    revalidatePath(`/instructor/courses/${topicData.course_id}/edit`);

    return { success: true, data };
  } catch (error) {
    console.error('Error updating topic:', error);
    return { success: false, error: error.message };
  }
}

// Delete a topic
export async function deleteTopic(topicId) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { error: 'You must be logged in to delete a topic' };
    }

    // Get topic data including course_id and sort_order
    const { data: topicData, error: topicError } = await supabase
      .from('course_topics')
      .select('course_id, sort_order')
      .eq('id', topicId)
      .single();

    if (topicError || !topicData) {
      return { error: 'Topic not found' };
    }

    // Verify ownership
    const { data: courseCheck } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', topicData.course_id)
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
      return { error: 'You do not have permission to delete this topic' };
    }

    // Delete the topic (lessons will be set to null topic_id due to ON DELETE SET NULL)
    const { error: deleteError } = await supabase
      .from('course_topics')
      .delete()
      .eq('id', topicId);

    if (deleteError) throw deleteError;

    // Update sort_order for remaining topics
    const { error: reorderError } = await supabase
      .from('course_topics')
      .update({ sort_order: supabase.raw('sort_order - 1') })
      .eq('course_id', topicData.course_id)
      .gt('sort_order', topicData.sort_order);

    if (reorderError) {
      console.error('Error reordering topics:', reorderError);
      // Non-critical error, continue
    }

    revalidatePath(`/instructor/courses/${topicData.course_id}/edit`);

    return { success: true };
  } catch (error) {
    console.error('Error deleting topic:', error);
    return { success: false, error: error.message };
  }
}

// Reorder topics
export async function reorderTopics(courseId, topicOrders) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return { error: 'You must be logged in to reorder topics' };
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
      return {
        error: 'You do not have permission to reorder topics in this course',
      };
    }

    // Update each topic's sort_order
    const updatePromises = topicOrders.map(({ id, sort_order }) =>
      supabase
        .from('course_topics')
        .update({ sort_order })
        .eq('id', id)
        .eq('course_id', courseId)
    );

    const results = await Promise.all(updatePromises);

    // Check if any updates failed
    const hasError = results.some((result) => result.error);
    if (hasError) {
      return { error: 'Failed to update some topic orders' };
    }

    revalidatePath(`/instructor/courses/${courseId}/edit`);

    return { success: true };
  } catch (error) {
    console.error('Error reordering topics:', error);
    return { success: false, error: error.message };
  }
}

// Get topics by course ID (with lessons)
export async function getTopicsByCourse(courseId) {
  try {
    const { data, error } = await supabase
      .from('course_topics')
      .select(
        `
        *,
        lessons (
          *
        )
      `
      )
      .eq('course_id', courseId)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    // Sort lessons within each topic
    if (data) {
      data.forEach((topic) => {
        if (topic.lessons) {
          topic.lessons.sort((a, b) => a.sort_order - b.sort_order);
        }
      });
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching topics:', error);
    return { success: false, error: error.message };
  }
}
