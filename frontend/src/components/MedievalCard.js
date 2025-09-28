import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const MedievalCard = ({
  children,
  className = '',
  variant = 'parchment',
  elevation = 'low',
  onClick,
  hoverable = true,
  ...props
}) => {
  const { isDarkMode } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const variants = {
    parchment: {
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(60, 50, 35, 0.9) 0%, rgba(45, 35, 25, 0.95) 100%)'
        : 'linear-gradient(135deg, rgba(250, 245, 235, 0.95) 0%, rgba(240, 230, 210, 0.9) 100%)',
      border: isDarkMode
        ? '2px solid rgba(120, 100, 70, 0.6)'
        : '2px solid rgba(100, 80, 60, 0.4)',
      boxShadow: isDarkMode
        ? '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(218, 165, 32, 0.1)'
        : '0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(218, 165, 32, 0.2)'
    },
    scroll: {
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(80, 70, 50, 0.9) 0%, rgba(60, 50, 35, 0.95) 100%)'
        : 'linear-gradient(135deg, rgba(245, 240, 225, 0.95) 0%, rgba(235, 225, 200, 0.9) 100%)',
      border: isDarkMode
        ? '3px solid rgba(140, 120, 90, 0.7)'
        : '3px solid rgba(120, 100, 80, 0.5)',
      boxShadow: isDarkMode
        ? '0 6px 25px rgba(0, 0, 0, 0.4), inset 0 2px 0 rgba(218, 165, 32, 0.15)'
        : '0 6px 25px rgba(0, 0, 0, 0.15), inset 0 2px 0 rgba(218, 165, 32, 0.25)'
    },
    leather: {
      background: isDarkMode
        ? 'linear-gradient(135deg, rgba(40, 30, 20, 0.95) 0%, rgba(50, 35, 25, 0.9) 100%)'
        : 'linear-gradient(135deg, rgba(139, 119, 90, 0.9) 0%, rgba(120, 100, 75, 0.95) 100%)',
      border: isDarkMode
        ? '2px solid rgba(100, 80, 60, 0.8)'
        : '2px solid rgba(80, 65, 50, 0.6)',
      boxShadow: isDarkMode
        ? '0 5px 22px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(139, 69, 69, 0.1)'
        : '0 5px 22px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(139, 69, 69, 0.2)'
    }
  };

  const cardVariants = {
    rest: {
      scale: 1,
      rotateX: 0,
      boxShadow: variants[variant].boxShadow
    },
    hover: hoverable ? {
      scale: 1.02,
      rotateX: 2,
      boxShadow: isDarkMode
        ? `0 8px 30px rgba(0, 0, 0, 0.4), inset 0 2px 0 rgba(218, 165, 32, 0.2), 0 0 20px rgba(218, 165, 32, 0.1)`
        : `0 8px 30px rgba(0, 0, 0, 0.2), inset 0 2px 0 rgba(218, 165, 32, 0.3), 0 0 20px rgba(218, 165, 32, 0.15)`,
      transition: {
        duration: 0.3,
        ease: 'easeOut'
      }
    } : {}
  };

  return (
    <motion.div
      className={`medieval-card relative rounded-lg ${className} ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        ...variants[variant],
        transformStyle: 'preserve-3d',
        backgroundImage: isDarkMode
          ? `
            radial-gradient(circle at 20% 30%, rgba(218, 165, 32, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(139, 69, 69, 0.02) 0%, transparent 50%),
            linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.1) 100%)
          `
          : `
            radial-gradient(circle at 20% 30%, rgba(218, 165, 32, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(139, 69, 69, 0.03) 0%, transparent 50%),
            linear-gradient(180deg, transparent 0%, rgba(139, 119, 90, 0.05) 100%)
          `
      }}
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      {...props}
    >
      {/* Decorative corner elements */}
      <div className="absolute top-2 left-2 w-4 h-4 opacity-30">
        <div
          className="w-full h-0.5 rounded"
          style={{ background: `rgb(var(--accent-color))` }}
        />
        <div
          className="w-0.5 h-full rounded absolute top-0 left-0"
          style={{ background: `rgb(var(--accent-color))` }}
        />
      </div>
      <div className="absolute top-2 right-2 w-4 h-4 opacity-30">
        <div
          className="w-full h-0.5 rounded"
          style={{ background: `rgb(var(--accent-color))` }}
        />
        <div
          className="w-0.5 h-full rounded absolute top-0 right-0"
          style={{ background: `rgb(var(--accent-color))` }}
        />
      </div>
      <div className="absolute bottom-2 left-2 w-4 h-4 opacity-30">
        <div
          className="w-full h-0.5 rounded absolute bottom-0"
          style={{ background: `rgb(var(--accent-color))` }}
        />
        <div
          className="w-0.5 h-full rounded absolute bottom-0 left-0"
          style={{ background: `rgb(var(--accent-color))` }}
        />
      </div>
      <div className="absolute bottom-2 right-2 w-4 h-4 opacity-30">
        <div
          className="w-full h-0.5 rounded absolute bottom-0"
          style={{ background: `rgb(var(--accent-color))` }}
        />
        <div
          className="w-0.5 h-full rounded absolute bottom-0 right-0"
          style={{ background: `rgb(var(--accent-color))` }}
        />
      </div>

      {/* Subtle aging texture */}
      <div
        className="absolute inset-0 rounded-lg opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(139, 119, 90, 0.1) 0%, transparent 30%),
            radial-gradient(circle at 75% 75%, rgba(139, 119, 90, 0.08) 0%, transparent 25%),
            radial-gradient(circle at 50% 10%, rgba(100, 80, 60, 0.05) 0%, transparent 20%)
          `
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Hover glow effect */}
      {isHovered && hoverable && (
        <motion.div
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: `linear-gradient(135deg, rgba(218, 165, 32, 0.05) 0%, transparent 50%, rgba(218, 165, 32, 0.05) 100%)`
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
};

export default MedievalCard;