// =============================================================================
// DEPARTMENT CONSTANTS
// =============================================================================

/**
 * Predefined list of departments for engineer and admin registration
 * Used across multiple components to ensure consistency
 */

export const DEPARTMENTS = [
  'Engineering',
  'Operations',
  'Customer Support', 
  'Sales',
  'Marketing',
  'Finance',
  'Human Resources',
  'IT & Technology',
  'Quality Assurance',
  'Research & Development',
] as const;

export type Department = typeof DEPARTMENTS[number];
