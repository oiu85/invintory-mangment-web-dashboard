/** @type {import('tailwindcss').Config} */
import { colors, typography, spacing, borderRadius, shadows, animations } from './src/styles/design-tokens.js';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: colors.primary,
        secondary: colors.secondary,
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
        neutral: colors.neutral,
        semantic: colors.semantic,
      },
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      spacing: spacing,
      borderRadius: borderRadius,
      boxShadow: shadows,
      transitionDuration: {
        ...animations.duration,
      },
      transitionTimingFunction: {
        ...animations.easing,
      },
      zIndex: {
        dropdown: 1000,
        sticky: 1020,
        fixed: 1030,
        'modal-backdrop': 1040,
        modal: 1050,
        popover: 1060,
        tooltip: 1070,
        toast: 1080,
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-in',
        'scale-in': 'scale-in 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
