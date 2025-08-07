'use server';

import { supabase } from '@/app/lib/supabase/client';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// Validation Schemas - Simplified version
const QuestionSchema = z.object({
  id: z.string(),
  type: z.enum([
    'True/False',
    'Single Choice',
    'Multiple Choice',
    'Open Ended',
    'Fill in the Blanks',
    'Sort Answer',
    'Matching',
    'Image Matching',
  ]),
  question: z.string().min(1, 'Question is required'),
  points: z.number().positive('Points must be positive'),
  required: z.boolean().default(true),
  randomize: z.boolean().default(false),
  description: z.string().nullable().optional(),
  options: z.array(z.any()).nullable().optional(),
  correctAnswer: z.any().nullable().optional(),
  explanation: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  blanks: z.array(z.any()).nullable().optional(),
  fillInBlanksQuestion: z.string().nullable().optional(),
  fillInBlanksAnswers: z.string().nullable().optional(),
  sortItems: z.array(z.any()).nullable().optional(),
  imageMatchingImage: z.string().nullable().optional(),
  imageMatchingText: z.string().nullable().optional(),
  imageMatchingPairs: z.array(z.any()).nullable().optional(),
  questionImage: z.string().nullable().optional(),
  matchingPairs: z
    .object({
      leftItems: z.array(z.any()),
      rightItems: z.array(z.any()),
      correctMatches: z.record(z.string()),
    })
    .nullable()
    .optional(),
});

const QuizSettingsSchema = z.object({
  passingScore: z.number().min(0).max(100),
  feedbackMode: z.enum(['default', 'reveal', 'retry']).default('default'),
  randomizeQuestions: z.boolean().default(false),
  showAnswersAfterSubmit: z.boolean().default(true),
  maxQuestions: z.number().min(0).optional().nullable(),
  maxAttempts: z.number().min(1).optional().nullable(),
  questionLayout: z.string().optional(),
  questionsOrder: z.string().optional(),
  hideQuestionNumber: z.boolean().optional(),
  shortAnswerLimit: z.number().optional().nullable(),
  essayAnswerLimit: z.number().optional().nullable(),
});

const QuizContentSchema = z.object({
  questions: z
    .array(QuestionSchema)
    .min(1, 'At least one question is required'),
  settings: QuizSettingsSchema,
  metadata: z
    .object({
      totalPoints: z.number(),
      questionCount: z.number(),
    })
    .optional(),
});

// Create a quiz lesson
export async function createQuizLesson(courseId, topicId, quizData) {
  try {
    // 데이터 구조 검증
    if (!quizData || typeof quizData !== 'object') {
      throw new Error('퀴즈 데이터가 올바르지 않습니다.');
    }

    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error('퀴즈 문제 목록이 없거나 올바르지 않습니다.');
    }

    // Extract title and summary before validation
    const { title, summary, questions, settings } = quizData;

    // questions와 settings만 포함한 객체 생성
    const quizContent = { questions, settings };

    // Zod 검증 전에 데이터 정리
    const cleanedContent = {
      questions: questions.map((q) => {
        const cleaned = { ...q };
        // undefined 값 제거
        Object.keys(cleaned).forEach((key) => {
          if (cleaned[key] === undefined) {
            delete cleaned[key];
          }
        });
        return cleaned;
      }),
      settings: { ...settings },
    };

    // Validate quiz data (only questions and settings)
    let validatedData;
    try {
      const parseResult = QuizContentSchema.safeParse(cleanedContent);

      if (!parseResult.success) {
        console.error('Validation failed - Issues:', parseResult.error.issues);
        const errorMessages = parseResult.error.issues
          .map((issue) => {
            const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
            return `${path}: ${issue.message}`;
          })
          .join(', ');

        return {
          success: false,
          error: `데이터 유효성 검증 실패: ${errorMessages}`,
        };
      }

      validatedData = parseResult.data;
    } catch (zodError) {
      console.error('Zod parsing error:', zodError);
      // Zod 에러 시 검증 건너뛰기
      validatedData = cleanedContent;
    }

    // Calculate metadata
    const totalPoints = validatedData.questions.reduce(
      (sum, q) => sum + q.points,
      0
    );
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

    const nextOrderIndex = existingLessons?.[0]?.order_index
      ? existingLessons[0].order_index + 1
      : 0;

    // Create the quiz lesson
    const { data, error } = await supabase
      .from('lessons')
      .insert({
        course_id: courseId,
        topic_id: topicId,
        title: title || 'Quiz',
        description: summary || '',
        content_type: 'quiz',
        content_data: validatedData,
        order_index: nextOrderIndex,
        duration_minutes: Math.ceil(questionCount * 2), // Estimate 2 minutes per question
        is_preview: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Quiz creation database error:', error);
      throw error;
    }

    console.log('Quiz created successfully:', {
      id: data.id,
      title: data.title,
      content_type: data.content_type,
      course_id: data.course_id,
      topic_id: data.topic_id,
      order_index: data.order_index,
    });

    // revalidatePath를 제거하여 페이지 새로고침 방지
    // revalidatePath(`/instructor/courses/${courseId}/edit`);

    // Ensure we return a plain object without any Zod references
    const plainData = JSON.parse(JSON.stringify(data));
    return { success: true, data: plainData };
  } catch (error) {
    console.error('Error creating quiz lesson:', error);
    return { success: false, error: error.message };
  }
}

// Update a quiz lesson
export async function updateQuizLesson(lessonId, quizData) {
  try {
    // Check if quizData exists
    if (!quizData) {
      throw new Error('Quiz data is undefined or null');
    }

    // Extract title and summary before validation (same as createQuizLesson)
    const { title, summary, questions, settings } = quizData;

    // Check if questions and settings exist
    if (!questions || !settings) {
      throw new Error(
        `Missing required data: questions=${!!questions}, settings=${!!settings}`
      );
    }

    // Create quiz content object with only questions and settings
    const quizContent = { questions, settings };

    // Use safeParse instead of parse to avoid throwing errors
    const parseResult = QuizContentSchema.safeParse(quizContent);

    if (!parseResult.success) {
      console.error('Validation failed - Issues:', parseResult.error.issues);
      const errorMessages = parseResult.error.issues
        .map((issue) => {
          const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
          return `${path}: ${issue.message}`;
        })
        .join(', ');

      return {
        success: false,
        error: `데이터 유효성 검증 실패: ${errorMessages}`,
      };
    }

    const validatedData = parseResult.data;

    // Calculate metadata
    const totalPoints = validatedData.questions.reduce(
      (sum, q) => sum + q.points,
      0
    );
    const questionCount = validatedData.questions.length;

    validatedData.metadata = {
      totalPoints,
      questionCount,
    };

    const { data, error } = await supabase
      .from('lessons')
      .update({
        title: title || 'Quiz',
        description: summary || '',
        content_data: validatedData,
        duration_minutes: Math.ceil(questionCount * 2),
        updated_at: new Date().toISOString(),
      })
      .eq('id', lessonId)
      .eq('content_type', 'quiz')
      .select()
      .single();

    if (error) throw error;

    // revalidatePath를 제거하여 페이지 새로고침 방지
    // revalidatePath(`/lesson/${lessonId}`);

    // Ensure we're not returning any Zod objects - use JSON parse/stringify to create a plain object
    const plainData = JSON.parse(JSON.stringify(data));

    return { success: true, data: plainData };
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

    return { success: true, data: JSON.parse(JSON.stringify(data)) };
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

    return { success: true, data: JSON.parse(JSON.stringify(data)) };
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

    questions.forEach((question) => {
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
          if (
            Array.isArray(userAnswer) &&
            Array.isArray(question.correctAnswer)
          ) {
            isCorrect =
              userAnswer.length === question.correctAnswer.length &&
              userAnswer.every((ans) => question.correctAnswer.includes(ans));
          }
          break;

        case 'Fill in the Blanks':
          // Handle multiple blanks
          if (question.blanks && question.correctAnswer) {
            let allBlanksCorrect = true;
            let correctBlanks = 0;
            const totalBlanks = question.blanks.length;

            // userAnswer should be an object with blank IDs as keys
            if (typeof userAnswer === 'object' && userAnswer !== null) {
              question.blanks.forEach((blank) => {
                const userBlankAnswer = userAnswer[blank.id];
                const acceptableAnswers =
                  question.correctAnswer[blank.id] || [];

                let blankCorrect = false;
                if (userBlankAnswer) {
                  // Check if user answer matches any acceptable answer
                  blankCorrect = acceptableAnswers.some((acceptable) => {
                    if (blank.caseSensitive) {
                      return userBlankAnswer.trim() === acceptable.trim();
                    } else {
                      return (
                        userBlankAnswer.trim().toLowerCase() ===
                        acceptable.trim().toLowerCase()
                      );
                    }
                  });
                }

                if (blankCorrect) {
                  correctBlanks++;
                } else {
                  allBlanksCorrect = false;
                }
              });

              // Calculate partial credit
              if (correctBlanks > 0 && totalBlanks > 0) {
                const percentage = correctBlanks / totalBlanks;
                earnedPoints = Math.round(question.points * percentage);
                isCorrect = allBlanksCorrect;
              } else {
                isCorrect = false;
              }
            } else {
              // Legacy support for old format (single answer)
              isCorrect =
                userAnswer?.toLowerCase() ===
                question.correctAnswer?.toLowerCase();
            }
          } else {
            // Legacy format
            isCorrect =
              userAnswer?.toLowerCase() ===
              question.correctAnswer?.toLowerCase();
          }
          break;

        case 'Sort Answer':
          // Check if user sorted items correctly
          if (
            Array.isArray(userAnswer) &&
            Array.isArray(question.correctAnswer)
          ) {
            if (userAnswer.length === question.correctAnswer.length) {
              // Check for exact match
              const exactMatch = userAnswer.every(
                (id, index) => id === question.correctAnswer[index]
              );

              if (exactMatch) {
                isCorrect = true;
                earnedPoints = question.points;
              } else {
                // Calculate partial credit based on correct positions
                let correctPositions = 0;
                userAnswer.forEach((id, index) => {
                  if (id === question.correctAnswer[index]) {
                    correctPositions++;
                  }
                });

                // Give partial credit
                const percentage =
                  correctPositions / question.correctAnswer.length;
                earnedPoints = Math.round(question.points * percentage);
                isCorrect = false; // Not fully correct, but has partial credit
              }
            }
          }
          break;

        case 'Matching':
          // Check matching pairs
          if (question.matchingPairs && typeof userAnswer === 'object') {
            const correctMatches =
              question.matchingPairs.correctMatches || question.correctAnswer;
            if (correctMatches) {
              let correctCount = 0;
              const totalMatches = Object.keys(correctMatches).length;

              Object.keys(correctMatches).forEach((leftId) => {
                if (userAnswer[leftId] === correctMatches[leftId]) {
                  correctCount++;
                }
              });

              // Calculate partial credit
              if (correctCount > 0 && totalMatches > 0) {
                const percentage = correctCount / totalMatches;
                earnedPoints = Math.round(question.points * percentage);
                isCorrect = correctCount === totalMatches;
              }
            }
          }
          break;

        case 'Image Matching':
          // Check image matching pairs
          if (question.imageMatchingPairs && typeof userAnswer === 'object') {
            const correctAnswers = question.correctAnswer;
            if (correctAnswers) {
              let correctCount = 0;
              const totalPairs = question.imageMatchingPairs.length;

              question.imageMatchingPairs.forEach((pair) => {
                const userText = userAnswer[pair.id]?.trim().toLowerCase();
                const correctText = (correctAnswers[pair.id] || pair.text)
                  .trim()
                  .toLowerCase();

                if (userText === correctText) {
                  correctCount++;
                }
              });

              // Calculate partial credit
              if (correctCount > 0 && totalPairs > 0) {
                const percentage = correctCount / totalPairs;
                earnedPoints = Math.round(question.points * percentage);
                isCorrect = correctCount === totalPairs;
              }
            }
          }
          break;

        // Open Ended needs manual grading
        default:
          isCorrect = false;
      }

      // Only add earned points if not already calculated (Sort Answer calculates its own partial credit)
      if (isCorrect && earnedPoints === 0) {
        earnedPoints = question.points;
      }

      totalScore += earnedPoints;

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

    return { success: true, data: JSON.parse(JSON.stringify(data)) };
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
      .select(
        `
        *,
        lessons (
          title,
          course_id
        ),
        courses (
          title
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (lessonId) {
      query = query.eq('lesson_id', lessonId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data: JSON.parse(JSON.stringify(data)) };
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
      .select(
        `
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
      `
      )
      .eq('courses.instructor_id', instructorId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: JSON.parse(JSON.stringify(data)) };
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
