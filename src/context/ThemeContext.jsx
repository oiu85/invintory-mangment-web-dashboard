import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first (only on initial load)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) {
        return saved === 'dark';
      }
      // Check system preference only if no saved preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return true;
      }
    }
    return false;
  });

  // Apply theme to document immediately on mount and when isDark changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    
    // Apply theme class immediately without waiting
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Save to localStorage (but don't block)
    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch (e) {
      console.warn('Failed to save theme preference:', e);
    }
  }, [isDark]);

  // Set initial theme on mount (before React hydration)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldBeDark = saved ? saved === 'dark' : prefersDark;
    
    // Only update if different from current state
    if (shouldBeDark !== isDark) {
      setIsDark(shouldBeDark);
    }
    
    // Apply immediately to prevent flash
    const root = document.documentElement;
    if (shouldBeDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []); // Only run once on mount

  // Listen for system theme changes (only if user hasn't set preference)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      const saved = localStorage.getItem('theme');
      if (!saved) {
        setIsDark(e.matches);
      }
    };
    
    // Use modern API if available, fallback to addEventListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Memoize toggleTheme to prevent unnecessary re-renders
  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const newValue = !prev;
      // Update localStorage immediately
      try {
        localStorage.setItem('theme', newValue ? 'dark' : 'light');
      } catch (e) {
        console.warn('Failed to save theme preference:', e);
      }
      return newValue;
    });
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      isDark,
      toggleTheme,
    }),
    [isDark, toggleTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
