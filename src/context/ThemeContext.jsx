import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const isInitializedRef = useRef(false);
  const isUpdatingRef = useRef(false);

  const [isDark, setIsDark] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark' || saved === 'light') {
          return saved === 'dark';
        }
        // Check system preference only if no saved preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          return true;
        }
      }
    } catch (e) {
      console.warn('Error reading theme preference:', e);
    }
    return false;
  });

  // Apply theme to document safely
  const applyTheme = useCallback((dark) => {
    if (typeof window === 'undefined' || isUpdatingRef.current) return;
    
    try {
      isUpdatingRef.current = true;
      const root = document.documentElement;
      
      if (dark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } catch (e) {
      console.warn('Error applying theme:', e);
    } finally {
      // Use setTimeout to prevent race conditions
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  }, []);

  // Apply theme on mount and when isDark changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    applyTheme(isDark);
    
    // Save to localStorage (but don't block)
    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch (e) {
      console.warn('Failed to save theme preference:', e);
    }
  }, [isDark, applyTheme]);

  // Initialize theme on mount (only once)
  useEffect(() => {
    if (typeof window === 'undefined' || isInitializedRef.current) return;
    
    try {
      isInitializedRef.current = true;
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      const shouldBeDark = saved === 'dark' ? true : saved === 'light' ? false : prefersDark;
      
      // Only update if different from current state
      if (shouldBeDark !== isDark) {
        setIsDark(shouldBeDark);
      }
      // Note: applyTheme will be called by the other useEffect when isDark changes
    } catch (e) {
      console.warn('Error initializing theme:', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - intentionally excluding dependencies

  // Listen for system theme changes (only if user hasn't set preference)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e) => {
        try {
          // Only auto-switch if user hasn't manually set a preference
          const saved = localStorage.getItem('theme');
          if (!saved || saved !== 'dark' && saved !== 'light') {
            setIsDark(e.matches);
          }
        } catch (err) {
          console.warn('Error handling theme change:', err);
        }
      };
      
      // Use modern API if available, fallback to addEventListener
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => {
          try {
            mediaQuery.removeEventListener('change', handleChange);
          } catch (e) {
            console.warn('Error removing theme listener:', e);
          }
        };
      } else if (mediaQuery.addListener) {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange);
        return () => {
          try {
            mediaQuery.removeListener(handleChange);
          } catch (e) {
            console.warn('Error removing theme listener:', e);
          }
        };
      }
    } catch (e) {
      console.warn('Error setting up theme listener:', e);
    }
  }, []);

  // Memoize toggleTheme to prevent unnecessary re-renders
  const toggleTheme = useCallback(() => {
    try {
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
    } catch (e) {
      console.error('Error toggling theme:', e);
    }
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
