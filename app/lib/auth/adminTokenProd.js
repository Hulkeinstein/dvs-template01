/* eslint-disable */
// Production SSO Token Utilities using jose library
// Install: npm install jose

// Uncomment this file when jose is installed
/*
import { SignJWT, jwtVerify } from 'jose';
import crypto from 'crypto';

// JWT secret from environment variable
const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }
  return new TextEncoder().encode(secret);
};

/**
 * Issue a secure admin SSO token (Production version)
 * @param {Object} session - NextAuth session object
 * @returns {Promise<string>} Signed JWT token
 */
export async function issueAdminSso(session) {
  if (!session?.user || session.user.role !== 'admin') {
    throw new Error('Unauthorized: Admin role required');
  }

  const jti = crypto.randomUUID();
  const secret = getSecret();

  const jwt = await new SignJWT({
    sub: session.user.id,
    email: session.user.email,
    role: 'admin',
    jti,
    iss: 'main-app',
    aud: 'admin-app',
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setExpirationTime('5m')
    .setIssuedAt()
    .setNotBefore('0s')
    .sign(secret);

  // TODO: Store jti in database for one-time use verification
  // await storeTokenJti(jti, session.user.id);

  return jwt;
}

/**
 * Verify an admin SSO token (Production version)
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Verified payload
 */
export async function verifyAdminSso(token) {
  const secret = getSecret();

  const { payload } = await jwtVerify(token, secret, {
    issuer: 'main-app',
    audience: 'admin-app',
    maxTokenAge: '5m',
  });

  // TODO: Check if token has been consumed
  // const isConsumed = await checkTokenConsumed(payload.jti);
  // if (isConsumed) {
  //   throw new Error('Token already consumed');
  // }
  // await markTokenConsumed(payload.jti);

  return payload;
}

/**
 * Store token JTI in database for one-time use
 * @param {string} jti - JWT ID
 * @param {string} userId - User ID
 */
async function storeTokenJti(jti, userId) {
  // Implementation depends on your database client
  // Example with Supabase:
  //
  // import { supabaseAdmin } from '@/lib/supabase/admin';
  //
  // const { error } = await supabaseAdmin
  //   .from('admin.sso_tokens')
  //   .insert({
  //     jti,
  //     user_id: userId,
  //     expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
  //   });
  //
  // if (error) throw error;
}

/**
 * Check if token has been consumed
 * @param {string} jti - JWT ID
 * @returns {Promise<boolean>}
 */
async function checkTokenConsumed(jti) {
  // Example with Supabase:
  //
  // const { data } = await supabaseAdmin
  //   .from('admin.sso_tokens')
  //   .select('consumed_at')
  //   .eq('jti', jti)
  //   .single();
  //
  // return data?.consumed_at !== null;

  return false;
}

/**
 * Mark token as consumed
 * @param {string} jti - JWT ID
 */
async function markTokenConsumed(jti) {
  // Example with Supabase:
  //
  // await supabaseAdmin
  //   .from('admin.sso_tokens')
  //   .update({ consumed_at: new Date().toISOString() })
  //   .eq('jti', jti);
}

export default {
  issueAdminSso,
  verifyAdminSso,
};
