import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const GlassCard = ({
  children,
  className = '',
  intensity = 'medium',
  glow = false,
  floating = false,
  tilt = false,
  onClick,
  ...props
}) => {
  const { isDarkMode } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  // 3D tilt effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (e) => {
    if (!tilt) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const intensityClasses = {
    light: 'backdrop-blur-sm bg-opacity-30 border-opacity-20',
    medium: 'backdrop-blur-md bg-opacity-20 border-opacity-30',
    heavy: 'backdrop-blur-lg bg-opacity-10 border-opacity-40',
    ultra: 'backdrop-blur-xl bg-opacity-5 border-opacity-50'
  };

  const baseClasses = `
    relative overflow-hidden rounded-2xl border
    ${isDarkMode ? 'bg-white border-white' : 'bg-black border-black'}
    ${intensityClasses[intensity]}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `;

  const cardVariants = {
    rest: {
      scale: 1,
      z: 0,
      boxShadow: isDarkMode
        ? '0 8px 32px rgba(0, 255, 255, 0.1)'
        : '0 8px 32px rgba(0, 0, 0, 0.1)'
    },
    hover: {
      scale: floating ? 1.02 : 1,
      z: floating ? 50 : 0,
      boxShadow: isDarkMode
        ? glow
          ? '0 20px 60px rgba(0, 255, 255, 0.3), 0 0 0 1px rgba(0, 255, 255, 0.2)'
          : '0 20px 60px rgba(255, 255, 255, 0.1)'
        : glow
          ? '0 20px 60px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.2)'
          : '0 20px 60px rgba(0, 0, 0, 0.15)',
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    }
  };

  const glowVariants = {
    rest: { opacity: 0 },
    hover: { opacity: 1 }
  };

  return (
    <motion.div
      className={baseClasses}
      style={tilt ? {
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      } : {}}
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      {...props}
    >
      {/* Liquid morphing background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: isDarkMode
            ? 'radial-gradient(circle at 30% 50%, rgba(0, 255, 255, 0.1), transparent 50%), radial-gradient(circle at 70% 80%, rgba(147, 51, 234, 0.1), transparent 50%)'
            : 'radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.1), transparent 50%), radial-gradient(circle at 70% 80%, rgba(147, 51, 234, 0.1), transparent 50%)'
        }}
        animate={isHovered ? {
          background: isDarkMode
            ? 'radial-gradient(circle at 70% 30%, rgba(0, 255, 255, 0.15), transparent 60%), radial-gradient(circle at 30% 70%, rgba(147, 51, 234, 0.15), transparent 60%)'
            : 'radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.15), transparent 60%), radial-gradient(circle at 30% 70%, rgba(147, 51, 234, 0.15), transparent 60%)'
        } : {}}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />

      {/* Glow effect */}
      {glow && (
        <motion.div
          className="absolute -inset-0.5 rounded-2xl opacity-0"
          style={{
            background: isDarkMode
              ? 'linear-gradient(45deg, rgba(0, 255, 255, 0.6), rgba(147, 51, 234, 0.6), rgba(0, 255, 255, 0.6))'
              : 'linear-gradient(45deg, rgba(59, 130, 246, 0.6), rgba(147, 51, 234, 0.6), rgba(59, 130, 246, 0.6))',
            filter: 'blur(10px)'
          }}
          variants={glowVariants}
          animate={isHovered ? 'hover' : 'rest'}
        />
      )}

      {/* Floating particles */}
      {isHovered && floating && (
        <>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                backgroundColor: isDarkMode ? 'rgba(0, 255, 255, 0.8)' : 'rgba(59, 130, 246, 0.8)',
                left: `${20 + (i * 8)}%`,
                top: `${30 + (i * 5)}%`
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                y: [-10, -30, -10],
                x: [0, Math.sin(i) * 20, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut'
              }}
            />
          ))}
        </>
      )}

      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 opacity-0"
        style={{
          background: isDarkMode
            ? 'linear-gradient(45deg, transparent 30%, rgba(0, 255, 255, 0.1) 50%, transparent 70%)'
            : 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)'
        }}
        animate={isHovered ? {
          opacity: [0, 0.5, 0],
          x: ['-100%', '100%']
        } : {}}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />

      {/* Content */}
      <div
        className="relative z-10"
        style={tilt ? { transform: "translateZ(50px)" } : {}}
      >
        {children}
      </div>

      {/* Liquid border animation */}
      <motion.div
        className="absolute inset-0 rounded-2xl border"
        style={{
          borderColor: isDarkMode ? 'rgba(0, 255, 255, 0.3)' : 'rgba(59, 130, 246, 0.3)',
          borderWidth: '1px'
        }}
        animate={isHovered ? {
          borderColor: isDarkMode
            ? ['rgba(0, 255, 255, 0.3)', 'rgba(147, 51, 234, 0.5)', 'rgba(0, 255, 255, 0.3)']
            : ['rgba(59, 130, 246, 0.3)', 'rgba(147, 51, 234, 0.5)', 'rgba(59, 130, 246, 0.3)']
        } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
};

export default GlassCard;