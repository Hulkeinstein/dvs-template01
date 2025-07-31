/**
 * Template Mapper
 * Maps template IDs to actual certificate designs
 */

export const CERTIFICATE_TEMPLATES = {
  // Landscape templates
  'template1': {
    id: 'template1',
    name: 'Classic Blue',
    orientation: 'landscape',
    preview: '/images/others/preview-01.png'
  },
  'template2': {
    id: 'template2',
    name: 'Modern Gold',
    orientation: 'landscape',
    preview: '/images/others/preview-02.png'
  },
  'template3': {
    id: 'template3',
    name: 'Elegant Purple',
    orientation: 'landscape',
    preview: '/images/others/preview-03.png'
  },
  'template4': {
    id: 'template4',
    name: 'Professional Green',
    orientation: 'landscape',
    preview: '/images/others/preview-04.png'
  },
  'template5': {
    id: 'template5',
    name: 'Minimal Gray',
    orientation: 'landscape',
    preview: '/images/others/preview-05.png'
  },
  
  // Portrait templates
  'template-port1': {
    id: 'template-port1',
    name: 'Classic Portrait',
    orientation: 'portrait',
    preview: '/images/others/preview-port-01.png'
  },
  'template-port2': {
    id: 'template-port2',
    name: 'Modern Portrait',
    orientation: 'portrait',
    preview: '/images/others/preview-port-02.png'
  },
  'template-port3': {
    id: 'template-port3',
    name: 'Elegant Portrait',
    orientation: 'portrait',
    preview: '/images/others/preview-port-03.png'
  },
  'template-port5': {
    id: 'template-port5',
    name: 'Professional Portrait',
    orientation: 'portrait',
    preview: '/images/others/preview-port-05.png'
  },
  'template-port6': {
    id: 'template-port6',
    name: 'Minimal Portrait',
    orientation: 'portrait',
    preview: '/images/others/preview-port-06.png'
  },
  
  // Default/None
  'none': {
    id: 'none',
    name: 'No Certificate',
    orientation: null,
    preview: null
  }
};

/**
 * Get template configuration by ID
 * @param {string} templateId - Template identifier
 * @returns {Object} Template configuration
 */
export function getTemplateConfig(templateId) {
  return CERTIFICATE_TEMPLATES[templateId] || CERTIFICATE_TEMPLATES['template1'];
}

/**
 * Check if template ID is valid
 * @param {string} templateId - Template identifier
 * @returns {boolean} True if valid
 */
export function isValidTemplateId(templateId) {
  return templateId in CERTIFICATE_TEMPLATES && templateId !== 'none';
}

/**
 * Get all available templates
 * @param {string} orientation - Filter by orientation (landscape/portrait)
 * @returns {Array} Array of template configurations
 */
export function getAvailableTemplates(orientation = null) {
  return Object.values(CERTIFICATE_TEMPLATES).filter(template => {
    if (template.id === 'none') return false;
    if (!orientation) return true;
    return template.orientation === orientation;
  });
}