import React, { useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const MedievalParticles = ({
  particleCount = 30,
  particleType = 'dust',
  speed = 0.3,
  interactive = false,
  className = ''
}) => {
  const { isDarkMode } = useTheme();
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const particlesRef = useRef([]);

  // Generate particles based on type
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => {
      const baseParticle = {
        id: i,
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 600),
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        life: 1,
        maxLife: 1
      };

      switch (particleType) {
        case 'dust':
          return {
            ...baseParticle,
            size: 0.5 + Math.random() * 1.5,
            opacity: 0.1 + Math.random() * 0.3,
            color: isDarkMode
              ? `hsla(45, 30%, ${70 + Math.random() * 20}%, 0.3)`
              : `hsla(35, 40%, ${40 + Math.random() * 20}%, 0.4)`,
            driftSpeed: 0.1 + Math.random() * 0.2
          };

        case 'embers':
          return {
            ...baseParticle,
            size: 1 + Math.random() * 2,
            opacity: 0.3 + Math.random() * 0.4,
            color: `hsla(${15 + Math.random() * 30}, 80%, ${50 + Math.random() * 30}%, 0.6)`,
            flicker: Math.random(),
            life: 0.5 + Math.random() * 0.5,
            maxLife: 0.5 + Math.random() * 0.5,
            vy: -(0.5 + Math.random() * 1)
          };

        case 'fireflies':
          return {
            ...baseParticle,
            size: 1.5 + Math.random() * 1,
            opacity: 0.4 + Math.random() * 0.4,
            color: `hsla(60, 100%, ${80 + Math.random() * 15}%, 0.7)`,
            glowIntensity: 0.5 + Math.random() * 0.5,
            pulsePhase: Math.random() * Math.PI * 2,
            driftRadius: 20 + Math.random() * 30,
            centerX: baseParticle.x,
            centerY: baseParticle.y
          };

        case 'pollen':
          return {
            ...baseParticle,
            size: 0.8 + Math.random() * 1.2,
            opacity: 0.2 + Math.random() * 0.3,
            color: isDarkMode
              ? `hsla(50, 60%, ${75 + Math.random() * 15}%, 0.4)`
              : `hsla(45, 70%, ${60 + Math.random() * 20}%, 0.5)`,
            swayAmplitude: 5 + Math.random() * 10,
            swayFrequency: 0.01 + Math.random() * 0.02
          };

        default:
          return baseParticle;
      }
    });
  }, [particleCount, speed, particleType, isDarkMode]);

  useEffect(() => {
    particlesRef.current = [...particles];
  }, [particles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let frameCount = 0;

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
      frameCount++;

      particlesRef.current.forEach((particle) => {
        // Update particle based on type
        switch (particleType) {
          case 'dust':
            // Slow drifting motion
            particle.x += particle.vx * particle.driftSpeed;
            particle.y += particle.vy * particle.driftSpeed;

            // Add slight random movement
            particle.vx += (Math.random() - 0.5) * 0.001;
            particle.vy += (Math.random() - 0.5) * 0.001;
            break;

          case 'embers':
            // Upward drifting with random sway
            particle.x += particle.vx + Math.sin(frameCount * 0.01) * 0.5;
            particle.y += particle.vy;

            // Fade out over time
            particle.life -= 0.005;
            particle.opacity = Math.max(0, particle.opacity * (particle.life / particle.maxLife));

            // Flicker effect
            particle.flicker = Math.sin(frameCount * 0.1 + particle.id) * 0.3 + 0.7;
            break;

          case 'fireflies':
            // Circular drifting motion
            const angle = frameCount * 0.01 + particle.pulsePhase;
            particle.x = particle.centerX + Math.cos(angle) * particle.driftRadius;
            particle.y = particle.centerY + Math.sin(angle * 0.7) * particle.driftRadius * 0.5;

            // Pulsing glow
            particle.glowIntensity = 0.3 + Math.sin(frameCount * 0.05 + particle.pulsePhase) * 0.4;
            break;

          case 'pollen':
            // Gentle swaying motion
            particle.x += particle.vx + Math.sin(frameCount * particle.swayFrequency) * particle.swayAmplitude * 0.01;
            particle.y += particle.vy;
            break;

          default:
            particle.x += particle.vx;
            particle.y += particle.vy;
        }

        // Boundary wrapping
        if (particle.x < -10) particle.x = canvas.width + 10;
        if (particle.x > canvas.width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = canvas.height + 10;
        if (particle.y > canvas.height + 10) particle.y = -10;

        // For embers, reset when they fade out
        if (particleType === 'embers' && particle.life <= 0) {
          particle.x = Math.random() * canvas.width;
          particle.y = canvas.height + 10;
          particle.life = particle.maxLife;
          particle.opacity = 0.3 + Math.random() * 0.4;
        }

        // Mouse interaction for interactive particles
        if (interactive && particleType === 'fireflies') {
          const dx = mouseRef.current.x - particle.x;
          const dy = mouseRef.current.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            const force = (100 - distance) / 100;
            particle.centerX += (dx / distance) * force * 2;
            particle.centerY += (dy / distance) * force * 2;
          }
        }

        // Render particle
        ctx.save();

        switch (particleType) {
          case 'dust':
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            break;

          case 'embers':
            ctx.globalAlpha = particle.opacity * particle.flicker;

            // Glow effect
            const emberGradient = ctx.createRadialGradient(
              particle.x, particle.y, 0,
              particle.x, particle.y, particle.size * 3
            );
            emberGradient.addColorStop(0, particle.color);
            emberGradient.addColorStop(1, particle.color.replace(/[\d\.]+\)$/g, '0)'));

            ctx.fillStyle = emberGradient;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
            ctx.fill();

            // Core
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            break;

          case 'fireflies':
            ctx.globalAlpha = particle.opacity * particle.glowIntensity;

            // Glow effect
            const fireflyGradient = ctx.createRadialGradient(
              particle.x, particle.y, 0,
              particle.x, particle.y, particle.size * 4
            );
            fireflyGradient.addColorStop(0, particle.color);
            fireflyGradient.addColorStop(0.5, particle.color.replace(/[\d\.]+\)$/g, '0.3)'));
            fireflyGradient.addColorStop(1, particle.color.replace(/[\d\.]+\)$/g, '0)'));

            ctx.fillStyle = fireflyGradient;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
            ctx.fill();

            // Core
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            break;

          case 'pollen':
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();

            // Slight blur effect
            ctx.shadowBlur = 2;
            ctx.shadowColor = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
            break;
        }

        ctx.restore();
      });

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
  }, [particleType, interactive, isDarkMode]);

  return (
    <motion.canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none -z-30 ${className}`}
      style={{ background: 'transparent' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    />
  );
};

// Specialized particle effects for different contexts
export const DustParticles = () => (
  <MedievalParticles
    particleCount={25}
    particleType="dust"
    speed={0.2}
    interactive={false}
  />
);

export const EmberParticles = () => (
  <MedievalParticles
    particleCount={15}
    particleType="embers"
    speed={0.4}
    interactive={false}
  />
);

export const FireflyParticles = () => (
  <MedievalParticles
    particleCount={8}
    particleType="fireflies"
    speed={0.3}
    interactive={true}
  />
);

export const PollenParticles = () => (
  <MedievalParticles
    particleCount={20}
    particleType="pollen"
    speed={0.15}
    interactive={false}
  />
);

export default MedievalParticles;