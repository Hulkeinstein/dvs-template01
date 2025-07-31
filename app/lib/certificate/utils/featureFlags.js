/**
 * Certificate Feature Flags
 * Controls certificate feature availability
 */

export const CERTIFICATE_FEATURES = {
  // Main feature toggle
  CERTIFICATE_ENABLED: process.env.NEXT_PUBLIC_CERTIFICATE_ENABLED === 'true' || false,
  
  // Sub-features
  CERTIFICATE_AUTO_ISSUE: false, // Automatically issue on course completion
  CERTIFICATE_VERIFICATION: true, // Enable verification system
  CERTIFICATE_QR_CODE: false, // Include QR code in certificates
  CERTIFICATE_BLOCKCHAIN: false, // Future: blockchain verification
  
  // Template features
  CUSTOM_TEMPLATES: false, // Allow custom template upload
  TEMPLATE_EDITOR: false, // In-app template editor
  
  // Admin features
  BULK_ISSUE: false, // Bulk certificate issuance
  REVOKE_CERTIFICATE: false, // Certificate revocation
};

/**
 * Check if a certificate feature is enabled
 * @param {string} feature - Feature name
 * @returns {boolean} True if enabled
 */
export function isFeatureEnabled(feature) {
  // If main feature is disabled, all sub-features are disabled
  if (!CERTIFICATE_FEATURES.CERTIFICATE_ENABLED) {
    return false;
  }
  
  return CERTIFICATE_FEATURES[feature] || false;
}

/**
 * Get all enabled features
 * @returns {Object} Enabled features
 */
export function getEnabledFeatures() {
  if (!CERTIFICATE_FEATURES.CERTIFICATE_ENABLED) {
    return {};
  }
  
  return Object.entries(CERTIFICATE_FEATURES)
    .filter(([key, value]) => value === true)
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
}