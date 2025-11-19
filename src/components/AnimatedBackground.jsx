import { useTheme } from '../context/ThemeContext';

const AnimatedBackground = () => {
  const { isDark } = useTheme();

  // Show only in dark mode
  if (!isDark) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Stars Background - More visible in dark mode */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
              boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
            }}
          />
        ))}
      </div>

      {/* Gradient Overlay - Dark mode only */}
      <div 
        className="absolute inset-0 transition-opacity duration-500 bg-gradient-to-br from-gray-900/95 via-blue-900/40 to-purple-900/40"
      />

      {/* Floating Particles - More visible */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full blur-xl animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 250 + 150}px`,
              height: `${Math.random() * 250 + 150}px`,
              backgroundColor: `rgba(${Math.random() * 50 + 100}, ${Math.random() * 50 + 150}, ${Math.random() * 50 + 200}, 0.2)`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 15}s`,
            }}
          />
        ))}
      </div>

      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)]"
        style={{ backgroundSize: '50px 50px' }}
      />
    </div>
  );
};

export default AnimatedBackground;
