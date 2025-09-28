import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

const ProgressBar = ({
  value = 0,
  max = 100,
  height = 'medium',
  color = 'blue',
  showLabel = true,
  showPercentage = true,
  animated = true,
  striped = false,
  glow = false,
  pulse = false,
  className = '',
  label = '',
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const controls = useAnimation();

  const percentage = Math.min((value / max) * 100, 100);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayValue(percentage);
        controls.start({
          width: `${percentage}%`,
          transition: { duration: 1, ease: 'easeOut' }
        });
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayValue(percentage);
      controls.start({ width: `${percentage}%` });
    }
  }, [percentage, animated, controls]);

  const heights = {
    thin: 'h-1',
    small: 'h-2',
    medium: 'h-4',
    large: 'h-6',
    xl: 'h-8'
  };

  const colors = {
    blue: {
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
      glow: 'shadow-blue-500/50',
      light: 'bg-blue-100'
    },
    purple: {
      bg: 'bg-gradient-to-r from-purple-500 to-purple-600',
      glow: 'shadow-purple-500/50',
      light: 'bg-purple-100'
    },
    green: {
      bg: 'bg-gradient-to-r from-green-500 to-emerald-600',
      glow: 'shadow-green-500/50',
      light: 'bg-green-100'
    },
    red: {
      bg: 'bg-gradient-to-r from-red-500 to-pink-600',
      glow: 'shadow-red-500/50',
      light: 'bg-red-100'
    },
    yellow: {
      bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      glow: 'shadow-yellow-500/50',
      light: 'bg-yellow-100'
    },
    rainbow: {
      bg: 'bg-gradient-to-r from-pink-500 via-purple-500 via-blue-500 via-green-500 to-yellow-500',
      glow: 'shadow-purple-500/50',
      light: 'bg-gray-100'
    }
  };

  const stripeAnimation = {
    animate: {
      x: ['0%', '100%'],
      transition: {
        duration: 1,
        ease: 'linear',
        repeat: Infinity
      }
    }
  };

  const pulseAnimation = pulse
    ? {
        boxShadow: [
          '0 0 0 0 rgba(59, 130, 246, 0.4)',
          '0 0 0 10px rgba(59, 130, 246, 0)',
          '0 0 0 0 rgba(59, 130, 246, 0)'
        ],
        transition: {
          duration: 2,
          repeat: Infinity
        }
      }
    : {};

  const sparkleVariants = {
    sparkle: {
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
      transition: {
        duration: 1,
        repeat: Infinity,
        repeatDelay: 0.5
      }
    }
  };

  return (
    <div className={`w-full ${className}`} {...props}>
      {/* Label and Percentage */}
      {(showLabel || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {showLabel && (
            <motion.span
              className="text-sm font-medium text-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {label}
            </motion.span>
          )}
          {showPercentage && (
            <motion.span
              className="text-sm font-medium text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={Math.floor(displayValue)}
              >
                {Math.round(displayValue)}%
              </motion.span>
            </motion.span>
          )}
        </div>
      )}

      {/* Progress Bar Container */}
      <div
        className={`w-full ${heights[height]} ${colors[color].light} rounded-full relative overflow-hidden ${
          glow ? `shadow-lg ${colors[color].glow}` : 'shadow-sm'
        }`}
      >
        {/* Animated Progress Fill */}
        <motion.div
          className={`${heights[height]} ${colors[color].bg} rounded-full relative overflow-hidden ${
            glow ? 'shadow-md' : ''
          }`}
          initial={{ width: '0%' }}
          animate={controls}
          style={pulse ? pulseAnimation : {}}
        >
          {/* Striped Pattern */}
          {striped && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
              style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
              }}
              variants={stripeAnimation}
              animate="animate"
            />
          )}

          {/* Shine Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
            initial={{ x: '-100%' }}
            animate={{ x: '200%', opacity: [0, 0.3, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
              ease: 'easeInOut'
            }}
          />
        </motion.div>

        {/* Sparkle Effects */}
        {percentage > 0 && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 w-1 h-1 bg-white rounded-full transform -translate-y-1/2"
                style={{ left: `${Math.min(displayValue - 5 + (i * 2), 95)}%` }}
                variants={sparkleVariants}
                animate="sparkle"
                transition={{ delay: i * 0.2 }}
              />
            ))}
          </>
        )}

        {/* Value Indicator */}
        {percentage > 10 && (
          <motion.div
            className="absolute top-1/2 right-2 transform -translate-y-1/2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span className="text-xs text-white font-bold drop-shadow-sm">
              {Math.round(displayValue)}%
            </span>
          </motion.div>
        )}
      </div>

      {/* Additional Progress Info */}
      {value !== percentage && (
        <motion.div
          className="mt-2 text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {value} / {max} completed
        </motion.div>
      )}
    </div>
  );
};

export default ProgressBar;