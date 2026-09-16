'use server';

import { supabaseServer as supabase } from '@/app/lib/supabase/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth.config';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { Resend } from 'resend';

// Types
interface SetPasswordData {
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Password validation
function validatePassword(password: string): {
  valid: boolean;
  error?: string;
} {
  if (password.length < 8) {
    return { valid: false, error: '비밀번호는 최소 8자 이상이어야 합니다.' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: '비밀번호는 대문자를 포함해야 합니다.' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, error: '비밀번호는 소문자를 포함해야 합니다.' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, error: '비밀번호는 숫자를 포함해야 합니다.' };
  }

  return { valid: true };
}

// Set password for OAuth users (first time)
export async function setPassword(data: SetPasswordData) {
  try {
    const { newPassword, confirmPassword } = data;

    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return { success: false, error: '비밀번호가 일치하지 않습니다.' };
    }

    // Validate password
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Get current user
    const { data: user, error: userError } = await supabase
      .from('user')
      .select('auth_provider, password_hash')
      .eq('id', session.user.id)
      .single();

    if (userError || !user) {
      return { success: false, error: '사용자를 찾을 수 없습니다.' };
    }

    // Check if password already exists
    if (user.password_hash) {
      return {
        success: false,
        error:
          '이미 비밀번호가 설정되어 있습니다. 비밀번호 변경을 사용해주세요.',
      };
    }

    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update user with password and auth_provider
    const { error: updateError } = await supabase
      .from('user')
      .update({
        password_hash: passwordHash,
        auth_provider: user.auth_provider === 'google' ? 'both' : 'email',
        password_set_at: new Date().toISOString(),
      })
      .eq('id', session.user.id);

    if (updateError) {
      console.error('Password update error:', updateError);
      return { success: false, error: '비밀번호 설정에 실패했습니다.' };
    }

    return { success: true, message: '비밀번호가 성공적으로 설정되었습니다.' };
  } catch (error) {
    console.error('Set password error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Set password error details:', errorMessage);
    return { success: false, error: `비밀번호 설정 중 오류: ${errorMessage}` };
  }
}

// Change existing password
export async function changePassword(data: ChangePasswordData) {
  try {
    const { currentPassword, newPassword, confirmPassword } = data;

    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return { success: false, error: '새 비밀번호가 일치하지 않습니다.' };
    }

    // Validate new password
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Get current user with password
    const { data: user, error: userError } = await supabase
      .from('user')
      .select('password_hash')
      .eq('id', session.user.id)
      .single();

    if (userError || !user) {
      return { success: false, error: '사용자를 찾을 수 없습니다.' };
    }

    // Check if user has a password
    if (!user.password_hash) {
      return {
        success: false,
        error:
          '비밀번호가 설정되어 있지 않습니다. 먼저 비밀번호를 설정해주세요.',
      };
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );
    if (!isPasswordValid) {
      return { success: false, error: '현재 비밀번호가 올바르지 않습니다.' };
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(
      newPassword,
      user.password_hash
    );
    if (isSamePassword) {
      return {
        success: false,
        error: '새 비밀번호는 현재 비밀번호와 달라야 합니다.',
      };
    }

    // Hash the new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const { error: updateError } = await supabase
      .from('user')
      .update({
        password_hash: newPasswordHash,
        password_changed_at: new Date().toISOString(),
      })
      .eq('id', session.user.id);

    if (updateError) {
      console.error('Password change error:', updateError);
      return { success: false, error: '비밀번호 변경에 실패했습니다.' };
    }

    return { success: true, message: '비밀번호가 성공적으로 변경되었습니다.' };
  } catch (error) {
    console.error('Change password error:', error);
    return { success: false, error: '비밀번호 변경 중 오류가 발생했습니다.' };
  }
}

// Check if user has password set
export async function checkPasswordStatus() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { hasPassword: false, authProvider: null };
    }

    const { data: user, error } = await supabase
      .from('user')
      .select('password_hash, auth_provider')
      .eq('id', session.user.id)
      .single();

    if (error || !user) {
      return { hasPassword: false, authProvider: null };
    }

    return {
      hasPassword: !!user.password_hash,
      authProvider: user.auth_provider,
    };
  } catch (error) {
    console.error('Check password status error:', error);
    return { hasPassword: false, authProvider: null };
  }
}

// Initialize email service
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const EMAIL_FROM =
  process.env.EMAIL_FROM || 'DVS Education <no-reply@dvs-education.com>';

// 키가 없는 환경(CI, Docker 빌드)에서 import만으로 실패하지 않도록 발송 시점에 생성한다
function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(apiKey);
}

// SHA-256 hash function for token security
function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

// Request password reset (send email)
export async function requestPasswordReset(email: string) {
  try {
    if (!email || !email.includes('@')) {
      return { success: true, message: '이메일을 확인해주세요.' };
    }

    // Find user by email (don't reveal if exists or not)
    const { data: user } = await supabase
      .from('user')
      .select('id, name, email')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    // Generate token regardless (for security)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = sha256Hex(rawToken);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // If user exists, save the token
    if (user?.id) {
      const { error: updateError } = await supabase
        .from('user')
        .update({
          password_reset_token: tokenHash,
          password_reset_expires: expiresAt.toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Failed to save reset token:', updateError);
        // Continue anyway to not reveal user existence
      }

      // Send email
      const resetLink = `${APP_URL}/auth/reset-password?token=${rawToken}`;

      try {
        const resend = getResendClient();

        await resend.emails.send({
          from: EMAIL_FROM,
          to: email,
          subject: '비밀번호 재설정 요청',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>비밀번호 재설정</h2>
              <p>안녕하세요${user.name ? ` ${user.name}님` : ''},</p>
              <p>비밀번호 재설정을 요청하셨습니다.</p>
              <p>아래 버튼을 클릭하여 새 비밀번호를 설정하세요:</p>
              <div style="margin: 30px 0;">
                <a href="${resetLink}" 
                   style="background-color: #4CAF50; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 4px; display: inline-block;">
                  비밀번호 재설정하기
                </a>
              </div>
              <p style="color: #666; font-size: 14px;">
                이 링크는 30분간 유효합니다.<br>
                요청하지 않으셨다면 이 메일을 무시하세요.
              </p>
              <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px;">
                링크가 작동하지 않으면 다음 URL을 복사하여 브라우저에 붙여넣으세요:<br>
                ${resetLink}
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Still return success to not reveal issues
      }
    }

    // Always return the same message (security)
    return {
      success: true,
      message:
        '해당 이메일 주소로 비밀번호 재설정 안내를 발송했습니다. 이메일을 확인해주세요.',
    };
  } catch (error) {
    console.error('Password reset request error:', error);
    return {
      success: true,
      message:
        '해당 이메일 주소로 비밀번호 재설정 안내를 발송했습니다. 이메일을 확인해주세요.',
    };
  }
}

// Validate reset token
export async function validateResetToken(rawToken: string) {
  try {
    if (!rawToken) {
      return { valid: false };
    }

    const tokenHash = sha256Hex(rawToken);
    const now = new Date();

    const { data: user, error } = await supabase
      .from('user')
      .select('id')
      .eq('password_reset_token', tokenHash)
      .gt('password_reset_expires', now.toISOString())
      .maybeSingle();

    if (error || !user) {
      return { valid: false };
    }

    return { valid: true, userId: user.id };
  } catch (error) {
    console.error('Token validation error:', error);
    return { valid: false };
  }
}

// Reset password with token
export async function resetPasswordWithToken(
  rawToken: string,
  newPassword: string
) {
  try {
    if (!rawToken || !newPassword) {
      return { success: false, error: '잘못된 요청입니다.' };
    }

    // Validate password
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const tokenHash = sha256Hex(rawToken);
    const now = new Date();

    // Find user with valid token
    const { data: user, error: findError } = await supabase
      .from('user')
      .select('id, auth_provider')
      .eq('password_reset_token', tokenHash)
      .gt('password_reset_expires', now.toISOString())
      .maybeSingle();

    if (findError || !user) {
      return {
        success: false,
        error: '토큰이 유효하지 않거나 만료되었습니다.',
      };
    }

    // Hash the new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Determine auth provider
    const nextProvider =
      user.auth_provider === 'google' ? 'both' : user.auth_provider || 'email';

    // Update password and clear reset token
    const { error: updateError } = await supabase
      .from('user')
      .update({
        password_hash: passwordHash,
        password_set_at: now.toISOString(),
        password_changed_at: now.toISOString(),
        password_reset_token: null,
        password_reset_expires: null,
        auth_provider: nextProvider,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Password reset error:', updateError);
      return { success: false, error: '비밀번호 재설정에 실패했습니다.' };
    }

    // TODO: Invalidate all existing sessions for this user
    // This depends on your session management strategy

    return {
      success: true,
      message: '비밀번호가 성공적으로 재설정되었습니다. 다시 로그인해주세요.',
    };
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, error: '비밀번호 재설정 중 오류가 발생했습니다.' };
  }
}
