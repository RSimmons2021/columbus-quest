import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, MapPin, Trophy, Target } from 'lucide-react';

const LoadingSpinner = ({
  size = 'medium',
  variant = 'default',
  message = 'Loading...',
  showMessage = true,
  color = 'blue'
}) => {
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xl: 'text-xl'
  };

  const colors = {
    blue: 'text-blue-500',
    purple: 'text-purple-500',
    green: 'text-green-500',
    red: 'text-red-500',
    yellow: 'text-yellow-500'
  };

  const spinVariants = {
    spin: {
      rotate: 360,
      transition: {
        duration: 1,
        ease: 'linear',
        repeat: Infinity
      }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 1.5,
        ease: 'easeInOut',
        repeat: Infinity
      }
    }
  };

  const bounceVariants = {
    bounce: {
      y: [0, -10, 0],
      transition: {
        duration: 0.6,
        ease: 'easeInOut',
        repeat: Infinity
      }
    }
  };

  const orbitVariants = {
    orbit: {
      rotate: 360,
      transition: {
        duration: 2,
        ease: 'linear',
        repeat: Infinity
      }
    }
  };

  const questVariants = {
    float: {
      y: [0, -5, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 2,
        ease: 'easeInOut',
        repeat: Infinity
      }
    }
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'pulse':
        return (
          <motion.div
            className={`${sizes[size]} ${colors[color]} flex items-center justify-center`}
            variants={pulseVariants}
            animate="pulse"
          >
            <div className={`w-full h-full rounded-full border-2 border-current`} />
          </motion.div>
        );

      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`w-2 h-2 ${colors[color]} rounded-full bg-current`}
                variants={bounceVariants}
                animate="bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        );

      case 'orbit':
        return (
          <div className={`relative ${sizes[size]}`}>
            <motion.div
              className="absolute inset-0"
              variants={orbitVariants}
              animate="orbit"
            >
              <div className={`w-2 h-2 ${colors[color]} bg-current rounded-full absolute top-0 left-1/2 transform -translate-x-1/2`} />
              <div className={`w-2 h-2 ${colors[color]} bg-current rounded-full absolute bottom-0 left-1/2 transform -translate-x-1/2`} />
              <div className={`w-2 h-2 ${colors[color]} bg-current rounded-full absolute left-0 top-1/2 transform -translate-y-1/2`} />
              <div className={`w-2 h-2 ${colors[color]} bg-current rounded-full absolute right-0 top-1/2 transform -translate-y-1/2`} />
            </motion.div>
          </div>
        );

      case 'quest':
        return (
          <div className="flex items-center space-x-3">
            <motion.div variants={questVariants} animate="float">
              <MapPin className={`${sizes[size]} ${colors[color]}`} />
            </motion.div>
            <motion.div
              variants={questVariants}
              animate="float"
              style={{ animationDelay: '0.3s' }}
            >
              <Trophy className={`${sizes[size]} ${colors[color]}`} />
            </motion.div>
            <motion.div
              variants={questVariants}
              animate="float"
              style={{ animationDelay: '0.6s' }}
            >
              <Target className={`${sizes[size]} ${colors[color]}`} />
            </motion.div>
          </div>
        );

      case 'progress':
        return (
          <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full`}
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                duration: 1.5,
                ease: 'easeInOut',
                repeat: Infinity
              }}
            />
          </div>
        );

      default:
        return (
          <motion.div
            variants={spinVariants}
            animate="spin"
          >
            <Loader2 className={`${sizes[size]} ${colors[color]}`} />
          </motion.div>
        );
    }
  };

  const messageVariants = {
    float: {
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        ease: 'easeInOut',
        repeat: Infinity
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {renderSpinner()}

      {showMessage && (
        <motion.p
          className={`mt-4 ${textSizes[size]} ${colors[color]} font-medium`}
          variants={messageVariants}
          animate="float"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

export default LoadingSpinner;