/**
 * Certificate Template Registry
 * Templates are now handled by API route only
 * UI components should use the API to generate PDFs
 */

// Template metadata only - no components
export const TEMPLATE_METADATA = {
  'default': { name: 'Default Template', orientation: 'landscape' },
  'template1': { name: 'Template 1', orientation: 'landscape' },
  'template2': { name: 'Template 2', orientation: 'landscape' },
  'template3': { name: 'Template 3', orientation: 'landscape' },
  'template4': { name: 'Template 4', orientation: 'landscape' },
  'template5': { name: 'Template 5', orientation: 'landscape' },
  'template-port1': { name: 'Portrait Template 1', orientation: 'portrait' },
  'template-port2': { name: 'Portrait Template 2', orientation: 'portrait' },
  'template-port3': { name: 'Portrait Template 3', orientation: 'portrait' },
  'template-port5': { name: 'Portrait Template 5', orientation: 'portrait' },
  'template-port6': { name: 'Portrait Template 6', orientation: 'portrait' },
};

/**
 * Get template metadata by ID
 * @param {string} templateId - Template identifier
 * @returns {Object} Template metadata
 */
export function getTemplateMetadata(templateId) {
  return TEMPLATE_METADATA[templateId] || TEMPLATE_METADATA['default'];
}