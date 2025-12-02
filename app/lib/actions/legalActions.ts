'use server';

import { z } from 'zod';
import { supabaseServer as supabase } from '@/app/lib/supabase/server';

// ============================================
// Type Definitions
// ============================================

// Error codes
type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'DATABASE_ERROR'
  | 'UNKNOWN';

// Common action result type
type ActionResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      code: ErrorCode;
      message?: string;
      issues?: unknown;
    };

// ============================================
// Zod Schemas
// ============================================

// Consent metadata schema
const ConsentMetadataSchema = z.object({
  terms_agreed: z.boolean().optional(),
  privacy_agreed: z.boolean().optional(),
  marketing_consent: z.boolean().optional(),
});

// Record legal consent input schema
const RecordLegalConsentSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  consentType: z.string().min(1, 'Consent type required'),
  policyVersion: z.string().min(1, 'Policy version required'),
  policyChecksum: z.string().min(1, 'Policy checksum required'),
  route: z.string().min(1, 'Route required'),
  metadata: ConsentMetadataSchema,
});

// Export types from Zod schemas
export type RecordLegalConsentInput = z.infer<typeof RecordLegalConsentSchema>;

// Database row type
export interface LegalConsentRow {
  id: string;
  user_id: string;
  consent_type: string;
  policy_version: string;
  policy_checksum: string;
  agreed_at: string;
  ip_address: string | null;
  user_agent: string | null;
  route: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ============================================
// CRUD Functions
// ============================================

/**
 * Record legal consent (GDPR/CCPA compliance)
 * @param input - Consent data to record
 * @returns ActionResult with saved consent or error
 */
export async function recordLegalConsent(
  input: RecordLegalConsentInput
): Promise<ActionResult<LegalConsentRow>> {
  try {
    // Zod validation (safeParse)
    const parsed = RecordLegalConsentSchema.safeParse(input);
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
      .from('legal_consents')
      .insert({
        user_id: parsed.data.userId,
        consent_type: parsed.data.consentType,
        policy_version: parsed.data.policyVersion,
        policy_checksum: parsed.data.policyChecksum,
        route: parsed.data.route,
        metadata: parsed.data.metadata,
        agreed_at: new Date().toISOString(),
        // ip_address and user_agent could be added via headers if needed
      })
      .select()
      .single();

    if (error) {
      console.error('[legalActions] Record consent error:', error);
      return {
        success: false,
        code: 'DATABASE_ERROR',
        message: error.message,
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[legalActions] Unexpected error:', error);
    return {
      success: false,
      code: 'UNKNOWN',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get user's legal consents
 * @param userId - User ID
 * @returns ActionResult with consent list or error
 */
export async function getUserConsents(
  userId: string
): Promise<ActionResult<LegalConsentRow[]>> {
  try {
    // Validate userId
    const userIdSchema = z.string().uuid('Invalid user ID');
    const validUserId = userIdSchema.parse(userId);

    const { data, error } = await supabase
      .from('legal_consents')
      .select('*')
      .eq('user_id', validUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[legalActions] Fetch consents error:', error);
      return {
        success: false,
        code: 'DATABASE_ERROR',
        message: error.message,
      };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[legalActions] Unexpected error:', error);
    return {
      success: false,
      code: 'UNKNOWN',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
