/**
 * Centralized Security Configuration
 * Import this in next.config.mjs to apply security headers
 */

// Content Security Policy
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:",
  "style-src 'self' 'unsafe-inline' https: http:",
  "img-src 'self' data: https: http: blob:",
  "font-src 'self' data: https: http:",
  "connect-src 'self' https: http: wss: ws:",
  "media-src 'self' https: http:",
  "object-src 'none'",
  "base-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "frame-src 'self' https://www.youtube.com https://youtube.com https://player.vimeo.com https://vimeo.com",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
];

// Join CSP directives for production
export const csp = cspDirectives.join('; ');

// Strict CSP for production (no unsafe-eval)
export const cspProduction = cspDirectives
  .map((directive) => {
    // Remove unsafe-eval for production
    if (directive.startsWith('script-src')) {
      return "script-src 'self' 'unsafe-inline' https:";
    }
    return directive;
  })
  .join('; ');

// CORS Configuration
export const cors = {
  // Allowed origins for API access
  allowedOrigins: [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'https://admin.yourdomain.com',
    // Add staging domain if needed
    // 'https://staging.yourdomain.com',
  ],
  // Allowed methods
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // Allowed headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
  ],
  // Credentials
  credentials: true,
  // Max age for preflight cache (24 hours)
  maxAge: 86400,
};

// Rate Limiting Configuration
export const rateLimit = {
  // Default rate limit
  default: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
  },
  // Auth endpoints (stricter)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
  },
  // Password reset (stricter)
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests per hour
  },
  // API endpoints
  api: {
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
  },
  // File upload (less strict)
  upload: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 uploads per minute
  },
};

// Security Headers
export const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: process.env.NODE_ENV === 'production' ? cspProduction : csp,
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'browsing-topics=()',
      'interest-cohort=()',
    ].join(', '),
  },
];

// Trusted Domains (for various checks)
export const trustedDomains = [
  'yourdomain.com',
  'www.yourdomain.com',
  'admin.yourdomain.com',
  'supabase.co',
  'googleapis.com',
  'googleusercontent.com',
  'resend.com',
];

// API Security Settings
export const apiSecurity = {
  // API key header name
  apiKeyHeader: 'X-API-Key',
  // Request signature header
  signatureHeader: 'X-Signature',
  // Timestamp header for replay attack prevention
  timestampHeader: 'X-Timestamp',
  // Max age for request timestamp (5 minutes)
  maxTimestampAge: 5 * 60 * 1000,
};

// Session Configuration
export const sessionConfig = {
  // Session cookie name
  cookieName: 'dvs-session',
  // Session duration (30 days)
  maxAge: 30 * 24 * 60 * 60,
  // Update session every 24 hours
  updateAge: 24 * 60 * 60,
  // Cookie settings
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  },
};

// Password Policy
export const passwordPolicy = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false, // Optional for better UX
  // Password expiry (optional, in days)
  expiryDays: null, // Set to number to enforce password rotation
  // Previous passwords to check (prevent reuse)
  historyCount: 0, // Set to number to prevent password reuse
};

// File Upload Restrictions
export const uploadRestrictions = {
  // Max file size (5MB default)
  maxFileSize: 5 * 1024 * 1024,
  // Allowed MIME types for different upload types
  allowedTypes: {
    image: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
    ],
    video: ['video/mp4', 'video/mpeg', 'video/webm', 'video/ogg'],
    audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
  },
  // Blocked file extensions
  blockedExtensions: [
    '.exe',
    '.bat',
    '.cmd',
    '.com',
    '.msi',
    '.sh',
    '.app',
    '.deb',
    '.rpm',
  ],
};

// Monitoring and Logging
export const monitoring = {
  // Log security events
  logSecurityEvents: true,
  // Security event types to log
  eventTypes: [
    'failed_login',
    'password_reset',
    'suspicious_activity',
    'rate_limit_exceeded',
    'invalid_token',
    'unauthorized_access',
  ],
  // Alert thresholds
  alertThresholds: {
    failedLogins: 10, // Alert after 10 failed logins
    rateLimitHits: 50, // Alert after 50 rate limit hits
    suspiciousRequests: 20, // Alert after 20 suspicious requests
  },
};

/**
 * Example usage in next.config.mjs:
 *
 * import { securityHeaders } from './security.config.js';
 *
 * const nextConfig = {
 *   async headers() {
 *     return [
 *       {
 *         source: '/:path*',
 *         headers: securityHeaders,
 *       },
 *     ];
 *   },
 * };
 */

const securityConfig = {
  csp,
  cspProduction,
  cors,
  rateLimit,
  securityHeaders,
  trustedDomains,
  apiSecurity,
  sessionConfig,
  passwordPolicy,
  uploadRestrictions,
  monitoring,
};

export default securityConfig;
