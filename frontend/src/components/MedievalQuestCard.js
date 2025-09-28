import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Trophy, Clock, Users, Scroll, Shield, Sword } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import MedievalCard from './MedievalCard';
import ProgressBar from './ProgressBar';

const MedievalQuestCard = ({
  quest,
  onStartQuest,
  onContinueQuest,
  showFullDetails = false,
  delay = 0,
  className = ''
}) => {
  const { isDarkMode } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const isCompleted = quest.completed_checkpoints === quest.total_checkpoints;
  const isStarted = quest.completed_checkpoints > 0;

  const getStatusColor = () => {
    if (isCompleted) return 'emerald';
    if (isStarted) return 'gold';
    return 'bronze';
  };

  const getStatusText = () => {
    if (isCompleted) return 'Completed';
    if (isStarted) return 'In Progress';
    return 'Available';
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'hard':
      case 'challenging':
        return <Sword className="w-4 h-4" />;
      case 'medium':
      case 'moderate':
        return <Shield className="w-4 h-4" />;
      default:
        return <Scroll className="w-4 h-4" />;
    }
  };

  const handleQuestAction = () => {
    if (isStarted && !isCompleted) {
      onContinueQuest && onContinueQuest(quest);
    } else if (!isStarted) {
      onStartQuest && onStartQuest(quest);
    }
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      rotateX: -10
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <motion.div
      className={`medieval-quest-card relative ${className}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <MedievalCard
        variant={isCompleted ? 'scroll' : 'parchment'}
        elevation="medium"
        onClick={!isCompleted ? handleQuestAction : undefined}
        hoverable={!isCompleted}
        className="h-full relative overflow-visible p-6"
      >
        {/* Quest Status Banner */}
        <motion.div
          className="absolute -top-3 -right-3 z-20"
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: delay + 0.3, type: 'spring', stiffness: 500 }}
        >
          <div
            className="px-3 py-1 rounded-full text-xs font-bold border-2 backdrop-blur-sm"
            style={{
              background: isDarkMode
                ? `linear-gradient(135deg, rgba(var(--accent-color), 0.3), rgba(var(--accent-color), 0.1))`
                : `linear-gradient(135deg, rgba(var(--accent-color), 0.4), rgba(var(--accent-color), 0.2))`,
              borderColor: `rgba(var(--accent-color), 0.6)`,
              color: `rgb(var(--accent-color))`,
              textShadow: `0 1px 2px rgba(0, 0, 0, 0.3)`,
              boxShadow: `0 0 15px rgba(var(--accent-color), 0.3)`
            }}
          >
            {getStatusText()}
          </div>
        </motion.div>

        {/* Completion Crown */}
        {isCompleted && (
          <motion.div
            className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20"
            initial={{ scale: 0, y: -20, rotate: -180 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            transition={{ delay: delay + 0.5, type: 'spring', stiffness: 300 }}
          >
            <motion.div
              className="w-10 h-10 rounded-full flex items-center justify-center border-2"
              style={{
                background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.9), rgba(255, 215, 0, 0.7))',
                borderColor: 'rgba(218, 165, 32, 0.8)',
                boxShadow: '0 0 20px rgba(218, 165, 32, 0.5)'
              }}
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{
                rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              }}
            >
              <Trophy className="w-6 h-6 text-amber-900" />
            </motion.div>
          </motion.div>
        )}

        {/* Quest Header */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: delay + 0.2 }}
        >
          <h3
            className="text-xl font-bold mb-2 line-clamp-2"
            style={{
              color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)',
              fontFamily: 'serif'
            }}
          >
            {quest.name}
          </h3>
          <p
            className="text-sm line-clamp-3 mb-3 opacity-80 leading-relaxed"
            style={{
              color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)',
              fontStyle: 'italic'
            }}
          >
            {quest.description}
          </p>
        </motion.div>

        {/* Quest Details Grid */}
        <motion.div
          className="grid grid-cols-2 gap-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.4, staggerChildren: 0.1 }}
        >
          {[
            { icon: MapPin, value: `${quest.total_checkpoints} Locations`, color: 'emerald' },
            { icon: Star, value: `${quest.points_per_checkpoint} Gold`, color: 'gold' },
            { icon: Clock, value: `~${Math.ceil(quest.total_checkpoints * 15)}m`, color: 'bronze' },
            { icon: getDifficultyIcon(quest.difficulty), value: quest.difficulty || 'Novice', color: 'ruby' }
          ].map((detail, index) => {
            const Icon = detail.icon;
            return (
              <motion.div
                key={index}
                className="flex items-center space-x-2 p-2 rounded border"
                style={{
                  background: isDarkMode
                    ? 'rgba(60, 50, 35, 0.3)'
                    : 'rgba(40, 30, 20, 0.05)',
                  borderColor: isDarkMode
                    ? 'rgba(120, 100, 70, 0.3)'
                    : 'rgba(100, 80, 60, 0.2)'
                }}
                whileHover={{ scale: 1.02, y: -1 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <motion.div
                  animate={isHovered ? {
                    scale: [1, 1.2, 1]
                  } : {}}
                  transition={{
                    duration: 1.5,
                    delay: index * 0.2,
                    ease: 'easeInOut'
                  }}
                >
                  {typeof Icon === 'function' ? (
                    <Icon
                      className="w-4 h-4"
                      style={{ color: `rgb(var(--accent-color))` }}
                    />
                  ) : (
                    Icon
                  )}
                </motion.div>
                <span
                  className="text-sm font-medium"
                  style={{ color: isDarkMode ? 'rgb(220, 205, 180)' : 'rgb(60, 50, 30)' }}
                >
                  {detail.value}
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Progress Section */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.6 }}
        >
          <div className="mb-2 flex justify-between items-center">
            <span
              className="text-sm font-semibold"
              style={{ color: isDarkMode ? 'rgb(220, 205, 180)' : 'rgb(60, 50, 30)' }}
            >
              Quest Progress
            </span>
            <span
              className="text-xs"
              style={{ color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)' }}
            >
              {quest.completed_checkpoints}/{quest.total_checkpoints}
            </span>
          </div>

          <ProgressBar
            value={quest.completed_checkpoints}
            max={quest.total_checkpoints}
            color={getStatusColor()}
            height="medium"
            showPercentage={false}
            animated={true}
            striped={isStarted && !isCompleted}
            glow={isStarted}
            className="medieval-progress"
          />

          {showFullDetails && quest.completed_checkpoints > 0 && (
            <motion.div
              className="mt-3 text-sm"
              style={{ color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex justify-between">
                <span>Gold Earned:</span>
                <span className="font-semibold" style={{ color: `rgb(var(--accent-color))` }}>
                  {quest.completed_checkpoints * quest.points_per_checkpoint}
                </span>
              </div>
              {!isCompleted && (
                <div className="flex justify-between mt-1">
                  <span>Potential Reward:</span>
                  <span className="font-semibold opacity-60">
                    +{(quest.total_checkpoints - quest.completed_checkpoints) * quest.points_per_checkpoint}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Action Section */}
        <motion.div
          className="mt-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.8 }}
        >
          {!isCompleted && (
            <motion.button
              className="w-full py-3 px-4 rounded-lg font-semibold relative overflow-hidden border-2"
              style={{
                background: isDarkMode
                  ? `linear-gradient(135deg, rgba(var(--accent-color), 0.2), rgba(var(--accent-color), 0.1))`
                  : `linear-gradient(135deg, rgba(var(--accent-color), 0.3), rgba(var(--accent-color), 0.2))`,
                borderColor: `rgba(var(--accent-color), 0.6)`,
                color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
              }}
              onClick={handleQuestAction}
              whileHover={{
                scale: 1.02,
                boxShadow: `0 6px 25px rgba(var(--accent-color), 0.3)`
              }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Button shine effect */}
              <motion.div
                className="absolute inset-0 rounded-lg"
                style={{
                  background: `linear-gradient(45deg, transparent 30%, rgba(var(--accent-color), 0.1) 50%, transparent 70%)`
                }}
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />

              <div className="flex items-center justify-center space-x-2 relative z-10">
                <motion.div
                  animate={{ rotate: isStarted ? [0, 360] : 0 }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                >
                  {isStarted ? (
                    <Scroll className="w-5 h-5" />
                  ) : (
                    <MapPin className="w-5 h-5" />
                  )}
                </motion.div>
                <span className="font-bold">
                  {isStarted ? 'Continue Quest' : 'Begin Journey'}
                </span>
              </div>
            </motion.button>
          )}

          {/* Completion Display */}
          {isCompleted && (
            <motion.div
              className="text-center py-4"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + 0.6, type: 'spring' }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-600" />
              </motion.div>
              <p
                className="font-bold text-lg mb-1"
                style={{ color: `rgb(var(--accent-color))` }}
              >
                Quest Completed!
              </p>
              <p
                className="text-sm opacity-70"
                style={{ color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)' }}
              >
                Earned {quest.total_checkpoints * quest.points_per_checkpoint} gold
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Decorative scroll corners for completed quests */}
        {isCompleted && (
          <>
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 opacity-60"
                style={{
                  background: 'radial-gradient(circle, rgba(218, 165, 32, 0.8), transparent)',
                  [i < 2 ? 'top' : 'bottom']: '10px',
                  [i % 2 === 0 ? 'left' : 'right']: '10px'
                }}
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.4, 0.8, 0.4],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </>
        )}
      </MedievalCard>
    </motion.div>
  );
};

export default MedievalQuestCard;