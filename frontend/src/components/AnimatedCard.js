import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AnimatedCard = ({
  children,
  className = '',
  hoverEffect = 'lift',
  glowColor = 'blue',
  clickable = false,
  onClick = null,
  delay = 0,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseClasses = 'bg-white rounded-xl shadow-lg relative overflow-hidden';

  const hoverEffects = {
    lift: {
      rest: { y: 0, scale: 1, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' },
      hover: {
        y: -8,
        scale: 1.02,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
        transition: { duration: 0.3, ease: 'easeOut' }
      }
    },
    scale: {
      rest: { scale: 1, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' },
      hover: {
        scale: 1.05,
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
        transition: { duration: 0.3 }
      }
    },
    glow: {
      rest: { boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' },
      hover: {
        boxShadow: `0 8px 32px rgba(${glowColor === 'blue' ? '59, 130, 246' : glowColor === 'purple' ? '147, 51, 234' : '34, 197, 94'}, 0.3)`,
        transition: { duration: 0.3 }
      }
    },
    tilt: {
      rest: { rotateY: 0, rotateX: 0 },
      hover: {
        rotateY: 5,
        rotateX: 5,
        transition: { duration: 0.3 }
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay,
        ease: 'easeOut'
      }
    }
  };

  const glowColors = {
    blue: 'rgba(59, 130, 246, 0.1)',
    purple: 'rgba(147, 51, 234, 0.1)',
    green: 'rgba(34, 197, 94, 0.1)',
    red: 'rgba(239, 68, 68, 0.1)',
    yellow: 'rgba(245, 158, 11, 0.1)'
  };

  return (
    <motion.div
      className={`${baseClasses} ${className} ${clickable ? 'cursor-pointer' : ''}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={hoverEffects[hoverEffect]?.hover || hoverEffects.lift.hover}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000
      }}
      {...props}
    >
      {/* Animated background glow */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${glowColors[glowColor]}, transparent 70%)`
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1.2 : 0.8
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Floating particles effect */}
      {isHovered && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-60"
              style={{
                left: `${20 + (i * 10)}%`,
                top: `${30 + (i * 5)}%`
              }}
              initial={{ y: 0, opacity: 0 }}
              animate={{
                y: [-20, -40, -20],
                opacity: [0, 0.8, 0],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: 2,
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
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
        animate={{
          x: isHovered ? ['0%', '100%'] : '0%',
          opacity: isHovered ? [0, 0.1, 0] : 0
        }}
        transition={{
          duration: 1.5,
          ease: 'easeInOut',
          repeat: isHovered ? Infinity : 0
        }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          transform: 'skewX(-15deg)'
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default AnimatedCard;