'use server';

import { supabase } from '@/app/lib/supabase/client';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Validation Schemas
const QuestionSchema = z.object({
  id: z.string(),
  type: z.enum(['True/False', 'Single Choice', 'Multiple Choice', 'Open Ended', 'Fill in the Blanks', 'Sort Answer', 'Matching', 'Image Matching']),
  question: z.string().min(1, "Question is required"),
  points: z.number().positive("Points must be positive"),
  required: z.boolean().default(true),
  randomize: z.boolean().default(false),
  description: z.string().optional(),
  // Type-specific fields
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([
    z.string(),
    z.array(z.string()),
    z.boolean(),
    z.record(z.string())
  ]).nullable().optional(),
  explanation: z.string().optional(),
  imageUrl: z.string().optional(),
});

const QuizSettingsSchema = z.object({
  passingScore: z.number().min(0).max(100),
  feedbackMode: z.enum(['default', 'reveal', 'retry']).default('default'),
  randomizeQuestions: z.boolean().default(false),
  showAnswersAfterSubmit: z.boolean().default(true),
  maxQuestions: z.number().min(0).optional(),
});

const QuizContentSchema = z.object({
  questions: z.array(QuestionSchema).min(1, "At least one question is required"),
  settings: QuizSettingsSchema,
  metadata: z.object({
    totalPoints: z.number(),
    questionCount: z.number(),
  }).optional(),
});

// Create a quiz lesson
export async function createQuizLesson(courseId, topicId, quizData) {
  try {
    // Validate quiz data
    const validatedData = QuizContentSchema.parse(quizData);
    
    // Calculate metadata
    const totalPoints = validatedData.questions.reduce((sum, q) => sum + q.points, 0);
    const questionCount = validatedData.questions.length;
    
    validatedData.metadata = {
      totalPoints,
      questionCount,
    };

    // Get the next order index
    const { data: existingLessons, error: orderError } = await supabase
      .from('lessons')
      .select('order_index')
      .eq('course_id', courseId)
      .eq('topic_id', topicId)
      .order('order_index', { ascending: false })
      .limit(1);

    if (orderError) throw orderError;

    const nextOrderIndex = existingLessons?.[0]?.order_index ? existingLessons[0].order_index + 1 : 0;

    // Create the quiz lesson
    const { data, error } = await supabase
      .from('lessons')
      .insert({
        course_id: courseId,
        topic_id: topicId,
        title: quizData.title || 'Quiz',
        description: quizData.summary || '',
        content_type: 'quiz',
        content_data: validatedData,
        order_index: nextOrderIndex,
        duration_minutes: Math.ceil(questionCount * 2), // Estimate 2 minutes per question
        is_preview: false,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath(`/instructor/courses/${courseId}/edit`);
    
    return { success: true, data };
  } catch (error) {
    console.error('Error creating quiz lesson:', error);
    return { success: false, error: error.message };
  }
}

// Update a quiz lesson
export async function updateQuizLesson(lessonId, quizData) {
  try {
    // Validate quiz data
    const validatedData = QuizContentSchema.parse(quizData);
    
    // Calculate metadata
    const totalPoints = validatedData.questions.reduce((sum, q) => sum + q.points, 0);
    const questionCount = validatedData.questions.length;
    
    validatedData.metadata = {
      totalPoints,
      questionCount,
    };

    const { data, error } = await supabase
      .from('lessons')
      .update({
        title: quizData.title || 'Quiz',
        description: quizData.summary || '',
        content_data: validatedData,
        duration_minutes: Math.ceil(questionCount * 2),
        updated_at: new Date().toISOString(),
      })
      .eq('id', lessonId)
      .eq('content_type', 'quiz')
      .select()
      .single();

    if (error) throw error;

    revalidatePath(`/lesson/${lessonId}`);
    
    return { success: true, data };
  } catch (error) {
    console.error('Error updating quiz lesson:', error);
    return { success: false, error: error.message };
  }
}

// Get quiz data by lesson ID
export async function getQuizByLessonId(lessonId) {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .eq('content_type', 'quiz')
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return { success: false, error: error.message };
  }
}

// Start a quiz attempt
export async function startQuizAttempt(lessonId, userId) {
  try {
    // Get the lesson to verify it's a quiz and get course_id
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('course_id, content_type')
      .eq('id', lessonId)
      .single();

    if (lessonError) throw lessonError;
    if (lesson.content_type !== 'quiz') {
      throw new Error('This lesson is not a quiz');
    }

    // Create a new attempt
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        lesson_id: lessonId,
        user_id: userId,
        course_id: lesson.course_id,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error starting quiz attempt:', error);
    return { success: false, error: error.message };
  }
}

// Submit quiz answers and calculate score
export async function submitQuizAttempt(attemptId, answers) {
  try {
    // Get the attempt and quiz data
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .select('lesson_id, started_at, completed_at')
      .eq('id', attemptId)
      .single();

    if (attemptError) throw attemptError;
    if (attempt.completed_at) {
      throw new Error('This quiz attempt has already been completed');
    }

    // Get the quiz lesson
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('content_data')
      .eq('id', attempt.lesson_id)
      .single();

    if (lessonError) throw lessonError;

    const quizData = lesson.content_data;
    const questions = quizData.questions;
    const settings = quizData.settings;

    // Calculate score
    let totalScore = 0;
    const processedAnswers = {};

    questions.forEach(question => {
      const userAnswer = answers[question.id];
      let isCorrect = false;
      let earnedPoints = 0;

      switch (question.type) {
        case 'True/False':
          isCorrect = userAnswer === question.correctAnswer;
          break;
        
        case 'Single Choice':
          isCorrect = userAnswer === question.correctAnswer;
          break;
        
        case 'Multiple Choice':
          if (Array.isArray(userAnswer) && Array.isArray(question.correctAnswer)) {
            isCorrect = 
              userAnswer.length === question.correctAnswer.length &&
              userAnswer.every(ans => question.correctAnswer.includes(ans));
          }
          break;
        
        case 'Fill in the Blanks':
          // Simple string matching for now
          isCorrect = userAnswer?.toLowerCase() === question.correctAnswer?.toLowerCase();
          break;
        
        // Open Ended, Sort Answer, Matching, Image Matching need manual grading
        // For now, we'll give 0 points and mark for review
        default:
          isCorrect = false;
      }

      if (isCorrect) {
        earnedPoints = question.points;
        totalScore += earnedPoints;
      }

      processedAnswers[question.id] = {
        answer: userAnswer,
        isCorrect,
        points: earnedPoints,
      };
    });

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = totalPoints > 0 ? (totalScore / totalPoints) * 100 : 0;
    const passed = percentage >= settings.passingScore;

    // Calculate time spent
    const startTime = new Date(attempt.started_at);
    const endTime = new Date();
    const timeSpentSeconds = Math.floor((endTime - startTime) / 1000);

    // Update the attempt
    const { data, error } = await supabase
      .from('quiz_attempts')
      .update({
        completed_at: endTime.toISOString(),
        time_spent_seconds: timeSpentSeconds,
        score: totalScore,
        total_points: totalPoints,
        passed,
        answers: processedAnswers,
      })
      .eq('id', attemptId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    return { success: false, error: error.message };
  }
}

// Get quiz attempts for a user
export async function getQuizAttempts(userId, lessonId = null) {
  try {
    let query = supabase
      .from('quiz_attempts')
      .select(`
        *,
        lessons (
          title,
          course_id
        ),
        courses (
          title
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (lessonId) {
      query = query.eq('lesson_id', lessonId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    return { success: false, error: error.message };
  }
}

// Get quiz attempts for instructor's courses
export async function getInstructorQuizAttempts(instructorId) {
  try {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        user:user_id (
          name,
          email
        ),
        lessons (
          title
        ),
        courses!inner (
          title,
          instructor_id
        )
      `)
      .eq('courses.instructor_id', instructorId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching instructor quiz attempts:', error);
    return { success: false, error: error.message };
  }
}

// Delete a quiz lesson
export async function deleteQuizLesson(lessonId) {
  try {
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', lessonId)
      .eq('content_type', 'quiz');

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting quiz lesson:', error);
    return { success: false, error: error.message };
  }
}