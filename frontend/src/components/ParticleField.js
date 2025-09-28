import React, { useRef, useEffect, useMemo } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const ParticleField = ({
  particleCount = 100,
  connectionDistance = 100,
  particleSize = 2,
  speed = 0.5,
  showConnections = true,
  interactive = true,
  className = ''
}) => {
  const { isDarkMode } = useTheme();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef([]);

  // Generate initial particle positions
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
      y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 600),
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      size: particleSize + Math.random() * 2,
      opacity: 0.1 + Math.random() * 0.5,
      color: isDarkMode
        ? `hsl(${180 + Math.random() * 60}, 70%, ${60 + Math.random() * 30}%)`
        : `hsl(${200 + Math.random() * 60}, 70%, ${40 + Math.random() * 30}%)`
    }));
  }, [particleCount, speed, particleSize, isDarkMode]);

  useEffect(() => {
    particlesRef.current = [...particles];
  }, [particles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e) => {
      if (!interactive) return;
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY
      };
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update particles
      particlesRef.current.forEach((particle) => {
        // Mouse interaction
        if (interactive) {
          const dx = mouseRef.current.x - particle.x;
          const dy = mouseRef.current.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            const force = (150 - distance) / 150;
            particle.vx -= (dx / distance) * force * 0.03;
            particle.vy -= (dy / distance) * force * 0.03;
          }
        }

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Boundary collision with smooth wrap
        if (particle.x < 0) {
          particle.x = canvas.width;
        } else if (particle.x > canvas.width) {
          particle.x = 0;
        }

        if (particle.y < 0) {
          particle.y = canvas.height;
        } else if (particle.y > canvas.height) {
          particle.y = 0;
        }

        // Add some friction
        particle.vx *= 0.999;
        particle.vy *= 0.999;

        // Add slight random movement
        particle.vx += (Math.random() - 0.5) * 0.001;
        particle.vy += (Math.random() - 0.5) * 0.001;

        // Draw particle with glow effect
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 3
        );

        gradient.addColorStop(0, particle.color.replace(')', `, ${particle.opacity})`).replace('hsl', 'hsla'));
        gradient.addColorStop(1, particle.color.replace(')', ', 0)').replace('hsl', 'hsla'));

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw core particle
        ctx.fillStyle = particle.color.replace(')', `, ${particle.opacity * 2})`).replace('hsl', 'hsla');
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections
      if (showConnections) {
        particlesRef.current.forEach((particle, i) => {
          for (let j = i + 1; j < particlesRef.current.length; j++) {
            const other = particlesRef.current[j];
            const dx = particle.x - other.x;
            const dy = particle.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < connectionDistance) {
              const opacity = (1 - distance / connectionDistance) * 0.2;
              const gradient = ctx.createLinearGradient(
                particle.x, particle.y, other.x, other.y
              );

              gradient.addColorStop(0, particle.color.replace(')', `, ${opacity})`).replace('hsl', 'hsla'));
              gradient.addColorStop(1, other.color.replace(')', `, ${opacity})`).replace('hsl', 'hsla'));

              ctx.strokeStyle = gradient;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(other.x, other.y);
              ctx.stroke();
            }
          }
        });
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [connectionDistance, showConnections, interactive, isDarkMode]);

  return (
    <motion.canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none -z-40 ${className}`}
      style={{
        background: 'transparent'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    />
  );
};

// Specialized particle effects for different contexts
export const QuestParticles = () => (
  <ParticleField
    particleCount={60}
    connectionDistance={120}
    particleSize={1.5}
    speed={0.3}
    showConnections={true}
    interactive={true}
  />
);

export const MenuParticles = () => (
  <ParticleField
    particleCount={40}
    connectionDistance={80}
    particleSize={1}
    speed={0.2}
    showConnections={false}
    interactive={false}
  />
);

export const HeroParticles = () => (
  <ParticleField
    particleCount={80}
    connectionDistance={150}
    particleSize={2}
    speed={0.4}
    showConnections={true}
    interactive={true}
  />
);

export default ParticleField;