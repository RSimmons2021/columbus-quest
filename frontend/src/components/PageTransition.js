import React from 'react';
import { motion } from 'framer-motion';

const PageTransition = ({
  children,
  variant = 'fade',
  duration = 0.5,
  delay = 0,
  className = ''
}) => {
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 }
    },
    slideDown: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 }
    },
    slideLeft: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 }
    },
    slideRight: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.05 }
    },
    rotate: {
      initial: { opacity: 0, rotate: -5, scale: 0.95 },
      animate: { opacity: 1, rotate: 0, scale: 1 },
      exit: { opacity: 0, rotate: 5, scale: 0.95 }
    },
    blur: {
      initial: { opacity: 0, filter: 'blur(10px)' },
      animate: { opacity: 1, filter: 'blur(0px)' },
      exit: { opacity: 0, filter: 'blur(10px)' }
    },
    flip: {
      initial: { opacity: 0, rotateY: -90 },
      animate: { opacity: 1, rotateY: 0 },
      exit: { opacity: 0, rotateY: 90 }
    },
    bounce: {
      initial: { opacity: 0, y: -30, scale: 0.8 },
      animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          type: 'spring',
          damping: 25,
          stiffness: 500
        }
      },
      exit: { opacity: 0, y: 30, scale: 0.8 }
    },
    elastic: {
      initial: { opacity: 0, scale: 0 },
      animate: {
        opacity: 1,
        scale: 1,
        transition: {
          type: 'spring',
          damping: 20,
          stiffness: 300
        }
      },
      exit: { opacity: 0, scale: 0 }
    }
  };

  const transitionConfig = {
    duration,
    delay,
    ease: [0.25, 0.46, 0.45, 0.94] // easeOutQuart
  };

  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants[variant]}
      transition={transitionConfig}
      style={{ transformOrigin: 'center' }}
    >
      {children}
    </motion.div>
  );
};

// Stagger Container for animating multiple children
export const StaggerContainer = ({
  children,
  stagger = 0.1,
  className = ''
}) => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger
      }
    }
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
};

// Individual stagger item
export const StaggerItem = ({
  children,
  variant = 'slideUp',
  className = ''
}) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  const variants = {
    slideUp: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    },
    slideDown: {
      hidden: { opacity: 0, y: -20 },
      visible: { opacity: 1, y: 0 }
    },
    slideLeft: {
      hidden: { opacity: 0, x: 20 },
      visible: { opacity: 1, x: 0 }
    },
    slideRight: {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 }
    },
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 }
    },
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 }
    }
  };

  return (
    <motion.div
      className={className}
      variants={variants[variant] || itemVariants}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;