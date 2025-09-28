import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, MapPin, Trophy, Users, Settings } from 'lucide-react';

const FloatingActionButton = ({
  actions = [],
  position = 'bottom-right',
  size = 'large',
  color = 'blue',
  icon = <Plus />,
  tooltip = 'Actions',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const positions = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-left': 'fixed bottom-6 left-6',
    'top-right': 'fixed top-20 right-6',
    'top-left': 'fixed top-20 left-6'
  };

  const sizes = {
    small: 'w-12 h-12',
    medium: 'w-14 h-14',
    large: 'w-16 h-16'
  };

  const iconSizes = {
    small: 'w-5 h-5',
    medium: 'w-6 h-6',
    large: 'w-7 h-7'
  };

  const colors = {
    blue: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    purple: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    green: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
    red: 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700'
  };

  const mainButtonVariants = {
    closed: { rotate: 0 },
    open: { rotate: 45 }
  };

  const menuVariants = {
    closed: {
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    },
    open: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    closed: {
      y: 20,
      opacity: 0,
      scale: 0
    },
    open: {
      y: 0,
      opacity: 1,
      scale: 1
    }
  };

  const pulseVariants = {
    pulse: {
      boxShadow: [
        '0 0 0 0 rgba(59, 130, 246, 0.4)',
        '0 0 0 20px rgba(59, 130, 246, 0)',
      ],
      transition: {
        duration: 2,
        repeat: Infinity
      }
    }
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.fab-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const defaultActions = [
    { icon: <MapPin />, label: 'View Map', color: 'blue', onClick: () => console.log('Map') },
    { icon: <Trophy />, label: 'Leaderboard', color: 'yellow', onClick: () => console.log('Leaderboard') },
    { icon: <Users />, label: 'Friends', color: 'green', onClick: () => console.log('Friends') },
    { icon: <Settings />, label: 'Settings', color: 'gray', onClick: () => console.log('Settings') }
  ];

  const actionList = actions.length > 0 ? actions : defaultActions;

  return (
    <div className={`fab-container ${positions[position]} z-50 ${className}`}>
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap">
              {tooltip}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-full mb-4"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {actionList.map((action, index) => (
              <motion.div
                key={index}
                className="relative mb-4"
                variants={itemVariants}
                custom={index}
              >
                {/* Action Button */}
                <motion.button
                  className={`${sizes.medium} ${colors[action.color || color]} text-white rounded-full shadow-lg flex items-center justify-center relative`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    action.onClick && action.onClick();
                    setIsOpen(false);
                  }}
                >
                  {action.icon}
                </motion.button>

                {/* Action Label */}
                <motion.div
                  className="absolute right-full mr-4 top-1/2 transform -translate-y-1/2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap">
                    {action.label}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.button
        className={`${sizes[size]} ${colors[color]} text-white rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden`}
        variants={mainButtonVariants}
        animate={isOpen ? 'open' : 'closed'}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Pulse Effect */}
        {!isOpen && (
          <motion.div
            className="absolute inset-0 rounded-full"
            variants={pulseVariants}
            animate="pulse"
          />
        )}

        {/* Main Icon */}
        <motion.div
          className={iconSizes[size]}
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? <X /> : icon}
        </motion.div>

        {/* Ripple Effect */}
        <motion.div
          className="absolute inset-0 bg-white rounded-full"
          initial={{ scale: 0, opacity: 0.3 }}
          animate={{ scale: 0, opacity: 0.3 }}
          whileTap={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Gradient Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"
          initial={{ x: '-100%' }}
          animate={{ x: isOpen ? '0%' : '-100%' }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>
    </div>
  );
};

export default FloatingActionButton;