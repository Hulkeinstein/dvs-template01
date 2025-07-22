/**
 * Phone verification utility functions
 */

/**
 * Check if user has verified their phone number
 * @param {Object} userProfile - User profile object
 * @returns {boolean} - Whether phone is verified
 */
export const isPhoneVerified = (userProfile) => {
  return userProfile?.is_phone_verified === true;
};

/**
 * Check if a specific feature requires phone verification
 * @param {string} feature - Feature name
 * @returns {boolean} - Whether the feature requires phone verification
 */
export const requiresPhoneVerification = (feature) => {
  // List of features that require phone verification
  const protectedFeatures = [
    'create_course',
    'publish_course',
    'payment',
    'withdrawal',
    'certificate_generation',
    'bulk_notifications'
  ];
  
  return protectedFeatures.includes(feature);
};

/**
 * Get phone verification status message
 * @param {Object} userProfile - User profile object
 * @returns {Object} - Status object with message and type
 */
export const getPhoneVerificationStatus = (userProfile) => {
  if (!userProfile) {
    return {
      verified: false,
      message: 'Profile not found',
      type: 'error'
    };
  }

  if (userProfile.is_phone_verified) {
    return {
      verified: true,
      message: 'Phone number verified',
      type: 'success'
    };
  }

  if (userProfile.phone) {
    return {
      verified: false,
      message: 'Phone number not verified',
      type: 'warning'
    };
  }

  return {
    verified: false,
    message: 'No phone number added',
    type: 'info'
  };
};

/**
 * Format phone number for display
 * @param {string} phone - Phone number
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-numeric characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Format based on length and country code
  if (cleaned.startsWith('+1') && cleaned.length === 12) {
    // US/Canada format: +1 (XXX) XXX-XXXX
    return cleaned.replace(/^(\+1)(\d{3})(\d{3})(\d{4})$/, '$1 ($2) $3-$4');
  } else if (cleaned.startsWith('+82') && cleaned.length === 13) {
    // Korea format: +82 10-XXXX-XXXX
    return cleaned.replace(/^(\+82)(\d{2})(\d{4})(\d{4})$/, '$1 $2-$3-$4');
  } else if (cleaned.startsWith('+44') && cleaned.length === 13) {
    // UK format: +44 XXXX XXX XXX
    return cleaned.replace(/^(\+44)(\d{4})(\d{3})(\d{3})$/, '$1 $2 $3 $4');
  }
  
  // Default format: just add spaces after country code
  return cleaned.replace(/^(\+\d{1,3})(\d+)$/, '$1 $2');
};

/**
 * Get phone verification prompt message for a feature
 * @param {string} feature - Feature name
 * @returns {string} - Custom message for the feature
 */
export const getVerificationPromptMessage = (feature) => {
  const messages = {
    create_course: 'Phone verification is required to create and publish courses. This helps us maintain quality and contact instructors when needed.',
    publish_course: 'To publish your course, please verify your phone number for security purposes.',
    payment: 'Phone verification is required for payment processing to ensure account security.',
    withdrawal: 'For your security, phone verification is required before making withdrawals.',
    certificate_generation: 'Phone verification ensures the authenticity of certificates issued.',
    bulk_notifications: 'Verify your phone to send bulk notifications to your students.'
  };
  
  return messages[feature] || 'This action requires phone verification for security purposes.';
};