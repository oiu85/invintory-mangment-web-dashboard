/**
 * Theme Utilities
 * Helper functions for theme application
 */

import { colors, typography, spacing, borderRadius, shadows, animations } from './design-tokens';

/**
 * Get color value from theme
 * @param {string} colorPath - e.g., 'primary.500' or 'semantic.profit'
 * @param {string} mode - 'light' or 'dark'
 * @returns {string} Color value
 */
export const getColor = (colorPath, mode = 'light') => {
  const [category, shade] = colorPath.split('.');
  if (colors[category]) {
    if (shade && colors[category][shade]) {
      return colors[category][shade];
    }
    return colors[category];
  }
  return colorPath; // Fallback to raw value
};

/**
 * Get spacing value
 * @param {string|number} size - Spacing size key
 * @returns {string} Spacing value
 */
export const getSpacing = (size) => {
  return spacing[size] || `${size}px`;
};

/**
 * Get border radius value
 * @param {string} size - Border radius size key
 * @returns {string} Border radius value
 */
export const getBorderRadius = (size = 'md') => {
  return borderRadius[size] || borderRadius.md;
};

/**
 * Get shadow value
 * @param {string} size - Shadow size key
 * @returns {string} Shadow value
 */
export const getShadow = (size = 'md') => {
  return shadows[size] || shadows.md;
};

/**
 * Get animation duration
 * @param {string} speed - Animation speed key
 * @returns {string} Duration value
 */
export const getAnimationDuration = (speed = 'normal') => {
  return animations.duration[speed] || animations.duration.normal;
};

/**
 * Get animation easing
 * @param {string} type - Easing type key
 * @returns {string} Easing value
 */
export const getAnimationEasing = (type = 'inOut') => {
  return animations.easing[type] || animations.easing.inOut;
};

/**
 * Generate CSS custom properties for theme
 * @param {string} mode - 'light' or 'dark'
 * @returns {Object} CSS variables object
 */
export const generateThemeVariables = (mode = 'light') => {
  const isDark = mode === 'dark';
  
  return {
    '--color-primary': colors.primary[isDark ? 400 : 600],
    '--color-primary-hover': colors.primary[isDark ? 300 : 700],
    '--color-secondary': colors.secondary[isDark ? 400 : 600],
    '--color-success': colors.success[isDark ? 400 : 600],
    '--color-warning': colors.warning[isDark ? 400 : 600],
    '--color-error': colors.error[isDark ? 400 : 600],
    '--color-background': isDark ? colors.neutral[900] : colors.neutral[50],
    '--color-surface': isDark ? colors.neutral[800] : '#ffffff',
    '--color-text-primary': isDark ? colors.neutral[100] : colors.neutral[900],
    '--color-text-secondary': isDark ? colors.neutral[400] : colors.neutral[600],
    '--color-border': isDark ? colors.neutral[700] : colors.neutral[200],
    '--shadow-sm': shadows.sm,
    '--shadow-md': shadows.md,
    '--shadow-lg': shadows.lg,
    '--radius-sm': borderRadius.sm,
    '--radius-md': borderRadius.md,
    '--radius-lg': borderRadius.lg,
  };
};

export default {
  getColor,
  getSpacing,
  getBorderRadius,
  getShadow,
  getAnimationDuration,
  getAnimationEasing,
  generateThemeVariables,
};
