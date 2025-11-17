'use server';

import { z } from 'zod';
import { supabaseServer as supabase } from '@/app/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';

// ============================================
// Type Definitions
// ============================================

// Error codes
type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'DUPLICATE_TEMPLATE_NAME'
  | 'UNAUTHORIZED'
  | 'INSTRUCTOR_ONLY'
  | 'NOT_FOUND'
  | 'UNKNOWN';

// Common action result type (GPT-5 feedback #2)
type ActionResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      code: ErrorCode;
      message?: string;
      issues?: unknown;
    };

// ============================================
// Zod Schemas (GPT-5 feedback #1)
// ============================================

// Attachment metadata
const AttachmentMetaSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  size: z
    .number()
    .positive()
    .max(100 * 1024 * 1024), // 100MB max
  type: z.string(),
});

// Time limit
const TimeLimitSchema = z.object({
  value: z.number().int().min(0),
  unit: z.enum(['minutes', 'hours', 'days', 'weeks', 'months']),
});

// Template content (template_data JSONB structure)
const TemplateContentSchema = z.object({
  instructions: z.string(),
  attachments: z.array(AttachmentMetaSchema).max(10).default([]),
  timeLimit: TimeLimitSchema,
  totalPoints: z.number().int().min(0).max(1000),
  passingPoints: z.number().int().min(0).max(1000),
  maxUploads: z.number().int().min(1).max(10),
  maxFileSize: z.number().int().min(1).max(500), // MB
});

// Save template input schema
const SaveTemplateSchema = z.object({
  name: z.string().min(1, '템플릿 이름 필수').max(100, '최대 100자'),
  description: z.string().optional(),
  template_data: TemplateContentSchema,
});

// Export types from Zod schemas
export type SaveTemplateInput = z.infer<typeof SaveTemplateSchema>;
export type TemplateContent = z.infer<typeof TemplateContentSchema>;

// Database row type
export interface TemplateRow {
  id: string;
  instructor_id: string;
  name: string;
  description: string | null;
  template_data: TemplateContent;
  created_at: string;
  updated_at: string;
}

// ============================================
// Helper Functions (GPT-5 feedback #3)
// ============================================

/**
 * Get current session and verify instructor role
 * DRY principle - reused across all actions
 */
async function getInstructorSession(): Promise<
  ActionResult<{ id: string; email: string }>
> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return {
      success: false,
      code: 'UNAUTHORIZED',
      message: 'You must be logged in',
    };
  }

  const { data: userData, error } = await supabase
    .from('user')
    .select('id, role')
    .eq('email', session.user.email)
    .single();

  if (error || !userData) {
    return {
      success: false,
      code: 'UNAUTHORIZED',
      message: 'User not found',
    };
  }

  if (userData.role !== 'instructor') {
    return {
      success: false,
      code: 'INSTRUCTOR_ONLY',
      message: 'Only instructors can manage templates',
    };
  }

  return {
    success: true,
    data: { id: userData.id, email: session.user.email },
  };
}

// ============================================
// CRUD Functions
// ============================================

/**
 * Save assignment as template
 * @param input - Template data to save
 * @returns ActionResult with saved template or error
 */
export async function saveAsTemplate(
  input: SaveTemplateInput
): Promise<ActionResult<TemplateRow>> {
  try {
    // Session validation
    const sessionResult = await getInstructorSession();
    if (!sessionResult.success) {
      return sessionResult;
    }

    // Zod validation (safeParse)
    const parsed = SaveTemplateSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        issues: parsed.error.flatten(),
      };
    }

    // Database insert
    const { data, error } = await supabase
      .from('assignment_templates')
      .insert({
        instructor_id: sessionResult.data.id, // Server-enforced
        name: parsed.data.name,
        description: parsed.data.description,
        template_data: parsed.data.template_data,
      })
      .select()
      .single();

    if (error) {
      // 23505: UNIQUE constraint violation
      if (error.code === '23505') {
        return {
          success: false,
          code: 'DUPLICATE_TEMPLATE_NAME',
          message: 'A template with this name already exists',
        };
      }

      console.error('[assignmentTemplateActions] Save error:', error);
      return {
        success: false,
        code: 'UNKNOWN',
        message: error.message,
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[assignmentTemplateActions] Unexpected error:', error);
    return {
      success: false,
      code: 'UNKNOWN',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get all templates for current instructor
 * @returns ActionResult with template list or error
 */
export async function getMyTemplates(): Promise<ActionResult<TemplateRow[]>> {
  try {
    const sessionResult = await getInstructorSession();
    if (!sessionResult.success) {
      return sessionResult;
    }

    const { data, error } = await supabase
      .from('assignment_templates')
      .select('*')
      .eq('instructor_id', sessionResult.data.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[assignmentTemplateActions] Fetch error:', error);
      return {
        success: false,
        code: 'UNKNOWN',
        message: error.message,
      };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[assignmentTemplateActions] Unexpected error:', error);
    return {
      success: false,
      code: 'UNKNOWN',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete a template
 * @param templateId - Template ID to delete
 * @returns ActionResult with null data or error
 */
export async function deleteTemplate(
  templateId: string
): Promise<ActionResult<null>> {
  try {
    const sessionResult = await getInstructorSession();
    if (!sessionResult.success) {
      return sessionResult;
    }

    // Double check: RLS + explicit instructor_id check
    const { error } = await supabase
      .from('assignment_templates')
      .delete()
      .eq('id', templateId)
      .eq('instructor_id', sessionResult.data.id);

    if (error) {
      console.error('[assignmentTemplateActions] Delete error:', error);
      return {
        success: false,
        code: 'UNKNOWN',
        message: error.message,
      };
    }

    return { success: true, data: null };
  } catch (error) {
    console.error('[assignmentTemplateActions] Unexpected error:', error);
    return {
      success: false,
      code: 'UNKNOWN',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Increment template usage count
 * @param templateId - Template ID
 * @returns ActionResult with null data or error
 */
export async function incrementTemplateUsage(
  templateId: string
): Promise<ActionResult<null>> {
  try {
    const { error } = await supabase.rpc('increment_template_usage', {
      template_id: templateId,
    });

    if (error) {
      console.error('[assignmentTemplateActions] Increment error:', error);
      return {
        success: false,
        code: 'UNKNOWN',
        message: error.message,
      };
    }

    return { success: true, data: null };
  } catch (error) {
    console.error('[assignmentTemplateActions] Unexpected error:', error);
    return {
      success: false,
      code: 'UNKNOWN',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
