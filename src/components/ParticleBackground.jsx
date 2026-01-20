import { useCallback, useMemo } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import { useTheme } from '../context/ThemeContext';

const ParticleBackground = () => {
  const { isDark } = useTheme();
  
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  // Always call hooks - conditionally render content
  const particlesConfig = useMemo(() => ({
    fullScreen: {
      enable: false,
      zIndex: 0,
    },
    fpsLimit: 120,
    particles: {
      number: {
        value: 70,
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        value: '#ffffff',
      },
      shape: {
        type: 'circle',
      },
      opacity: {
        value: 0.8,
        random: true,
        anim: {
          enable: true,
          speed: 1.5,
          opacity_min: 0.3,
          sync: false,
        },
      },
      size: {
        value: 2.5,
        random: true,
        anim: {
          enable: true,
          speed: 3,
          size_min: 1,
          sync: false,
        },
      },
      line_linked: {
        enable: true,
        distance: 120,
        color: '#ffffff',
        opacity: 0.3,
        width: 1,
      },
      move: {
        enable: true,
        speed: 1.5,
        direction: 'none',
        random: true,
        straight: false,
        out_mode: 'out',
        bounce: false,
        attract: {
          enable: false,
          rotateX: 600,
          rotateY: 1200,
        },
      },
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: {
          enable: true,
          mode: ['grab', 'bubble'],
        },
        onclick: {
          enable: true,
          mode: 'push',
        },
        resize: true,
      },
      modes: {
        grab: {
          distance: 180,
          line_linked: {
            opacity: 0.6,
          },
        },
        bubble: {
          distance: 250,
          size: 8,
          duration: 2,
          opacity: 0.8,
          speed: 3,
        },
        repulse: {
          distance: 200,
          duration: 0.4,
        },
        push: {
          particles_nb: 6,
        },
        remove: {
          particles_nb: 2,
        },
      },
    },
    retina_detect: true,
    background: {
      color: '#0d0d0d',
      opacity: 0,
    },
  }), [isDark]);

  // Show particles only in dark mode - but hooks are always called
  if (!isDark) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'auto',
      }}
    >
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particlesConfig}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

export default ParticleBackground;
