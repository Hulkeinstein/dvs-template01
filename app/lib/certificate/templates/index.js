/**
 * Certificate Template Registry
 * Exports all available certificate templates
 */

import dynamic from 'next/dynamic';

// Dynamically import templates to avoid SSR issues with React PDF
export const DefaultTemplate = dynamic(
  () => import('./DefaultTemplate'),
  { ssr: false }
);

// Map template IDs to components
export const TEMPLATE_COMPONENTS = {
  'default': DefaultTemplate,
  'template1': DefaultTemplate, // Using default for now
  'template2': DefaultTemplate, // Will create unique designs later
  'template3': DefaultTemplate,
  'template4': DefaultTemplate,
  'template5': DefaultTemplate,
  'template-port1': DefaultTemplate,
  'template-port2': DefaultTemplate,
  'template-port3': DefaultTemplate,
  'template-port5': DefaultTemplate,
  'template-port6': DefaultTemplate,
};

/**
 * Get template component by ID
 * @param {string} templateId - Template identifier
 * @returns {React.Component} Template component
 */
export function getTemplateComponent(templateId) {
  return TEMPLATE_COMPONENTS[templateId] || TEMPLATE_COMPONENTS['default'];
}