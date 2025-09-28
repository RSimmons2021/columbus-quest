import React from 'react';
import { motion } from 'framer-motion';

const AnimatedButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  icon = null,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 relative overflow-hidden';

  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm hover:shadow-md',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl',
    danger: 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 shadow-lg hover:shadow-xl',
    ghost: 'text-blue-600 hover:bg-blue-50 border border-blue-200 hover:border-blue-300'
  };

  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  };

  const rippleVariants = {
    rest: { scale: 0, opacity: 0 },
    tap: {
      scale: 4,
      opacity: 0.3,
      transition: { duration: 0.15 }
    }
  };

  return (
    <motion.button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      variants={buttonVariants}
      initial="rest"
      whileHover={disabled ? "rest" : "hover"}
      whileTap={disabled ? "rest" : "tap"}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      <motion.div
        className="absolute inset-0 bg-white rounded-lg"
        variants={rippleVariants}
        initial="rest"
        whileTap="tap"
      />

      {icon && (
        <motion.span
          className="mr-2"
          initial={{ rotate: 0 }}
          whileHover={{ rotate: 15 }}
          transition={{ duration: 0.2 }}
        >
          {icon}
        </motion.span>
      )}

      <span className="relative z-10">{children}</span>

      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
        initial={{ x: '-100%', opacity: 0 }}
        whileHover={{ x: '100%', opacity: 0.2 }}
        transition={{ duration: 0.6 }}
      />
    </motion.button>
  );
};

export default AnimatedButton;