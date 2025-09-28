import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { MapPin, Star, Trophy, Clock, Users, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import GlassCard from './GlassCard';
import ProgressBar from './ProgressBar';

const EnhancedQuestCard = ({
  quest,
  onStartQuest,
  onContinueQuest,
  showFullDetails = false,
  delay = 0,
  className = ''
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

  const isCompleted = quest.completed_checkpoints === quest.total_checkpoints;
  const isStarted = quest.completed_checkpoints > 0;

  const getStatusColor = () => {
    if (isCompleted) return 'green';
    if (isStarted) return 'cyan';
    return 'blue';
  };

  const getStatusText = () => {
    if (isCompleted) return 'Completed';
    if (isStarted) return 'In Progress';
    return 'Available';
  };

  const handleMouseMove = (e) => {
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
      y: 50,
      rotateX: -15,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const floatingElements = [
    { icon: MapPin, color: 'cyan', delay: 0 },
    { icon: Star, color: 'yellow', delay: 0.2 },
    { icon: Trophy, color: 'orange', delay: 0.4 },
    { icon: Zap, color: 'purple', delay: 0.6 }
  ];

  return (
    <motion.div
      className={`quest-card-enhanced relative ${className}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Floating background elements */}
      {isHovered && (
        <>
          {floatingElements.map((element, index) => {
            const Icon = element.icon;
            return (
              <motion.div
                key={index}
                className="absolute opacity-20 pointer-events-none"
                style={{
                  left: `${20 + (index * 15)}%`,
                  top: `${15 + (index * 10)}%`,
                  transform: "translateZ(30px)"
                }}
                initial={{ scale: 0, rotate: 0 }}
                animate={{
                  scale: [0, 1.2, 1],
                  rotate: [0, 180, 360],
                  y: [0, -20, 0]
                }}
                transition={{
                  duration: 2,
                  delay: element.delay,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <Icon
                  className="w-8 h-8"
                  style={{
                    color: isDarkMode
                      ? `rgba(var(--accent-color), 0.6)`
                      : `rgba(var(--accent-color), 0.4)`
                  }}
                />
              </motion.div>
            );
          })}
        </>
      )}

      <GlassCard
        intensity="medium"
        glow={isHovered}
        floating={isHovered}
        tilt={false} // We're handling tilt at the parent level
        onClick={!isCompleted ? handleQuestAction : undefined}
        className="h-full relative"
      >
        {/* Status hologram */}
        <motion.div
          className="absolute -top-3 -right-3 z-20"
          initial={{ scale: 0, rotateY: -90 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ delay: delay + 0.3, type: 'spring', stiffness: 500 }}
          style={{ transform: "translateZ(20px)" }}
        >
          <div
            className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border"
            style={{
              background: isDarkMode
                ? `linear-gradient(135deg, rgba(var(--accent-color), 0.3), rgba(var(--accent-color), 0.1))`
                : `linear-gradient(135deg, rgba(var(--accent-color), 0.2), rgba(var(--accent-color), 0.05))`,
              borderColor: `rgba(var(--accent-color), 0.4)`,
              color: `rgb(var(--accent-color))`,
              boxShadow: `0 0 20px rgba(var(--accent-color), 0.3)`
            }}
          >
            {getStatusText()}
          </div>
        </motion.div>

        {/* Completion crown effect */}
        {isCompleted && (
          <motion.div
            className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20"
            initial={{ scale: 0, y: -20, rotateY: -180 }}
            animate={{ scale: 1, y: 0, rotateY: 0 }}
            transition={{ delay: delay + 0.5, type: 'spring', stiffness: 300 }}
            style={{ transform: "translateZ(40px)" }}
          >
            <motion.div
              className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border-2"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 165, 0, 0.1))',
                borderColor: 'rgba(255, 215, 0, 0.6)',
                boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)'
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
              <Trophy className="w-6 h-6 text-yellow-400" />
            </motion.div>
          </motion.div>
        )}

        <div className="p-6 relative" style={{ transform: "translateZ(10px)" }}>
          {/* Quest Header */}
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.2 }}
          >
            <h3
              className="text-xl font-bold mb-2 line-clamp-2"
              style={{ color: isDarkMode ? 'white' : 'black' }}
            >
              {quest.name}
            </h3>
            <p
              className="text-sm line-clamp-3 mb-3 opacity-80"
              style={{ color: isDarkMode ? 'rgb(200, 200, 200)' : 'rgb(80, 80, 80)' }}
            >
              {quest.description}
            </p>
          </motion.div>

          {/* Animated Stats Grid */}
          <motion.div
            className="grid grid-cols-2 gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.4, staggerChildren: 0.1 }}
          >
            {[
              { icon: MapPin, value: `${quest.total_checkpoints} stops`, color: 'blue' },
              { icon: Star, value: `${quest.points_per_checkpoint} pts`, color: 'yellow' },
              { icon: Clock, value: `~${Math.ceil(quest.total_checkpoints * 15)} min`, color: 'green' },
              { icon: Users, value: quest.difficulty || 'Easy', color: 'purple' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  className="flex items-center space-x-2 p-2 rounded-lg backdrop-blur-sm"
                  style={{
                    background: isDarkMode
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.05)'
                  }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <motion.div
                    animate={isHovered ? {
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    } : {}}
                    transition={{
                      duration: 2,
                      delay: index * 0.2,
                      ease: 'easeInOut'
                    }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ color: `rgb(var(--accent-color))` }}
                    />
                  </motion.div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: isDarkMode ? 'rgb(220, 220, 220)' : 'rgb(60, 60, 60)' }}
                  >
                    {stat.value}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Enhanced Progress Bar */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.6 }}
          >
            <ProgressBar
              value={quest.completed_checkpoints}
              max={quest.total_checkpoints}
              color={getStatusColor()}
              height="large"
              label="Progress"
              showPercentage={true}
              animated={true}
              striped={isStarted && !isCompleted}
              glow={true}
              pulse={isStarted && !isCompleted}
            />
          </motion.div>

          {/* Action Button */}
          <motion.div
            className="mt-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.8 }}
          >
            {!isCompleted && (
              <motion.button
                className="w-full py-3 px-4 rounded-xl font-semibold text-white relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, rgba(var(--accent-color), 0.8), rgba(var(--accent-color), 0.6))`,
                  border: `1px solid rgba(var(--accent-color), 0.4)`,
                  boxShadow: `0 4px 20px rgba(var(--accent-color), 0.3)`
                }}
                onClick={handleQuestAction}
                whileHover={{
                  scale: 1.02,
                  boxShadow: `0 8px 30px rgba(var(--accent-color), 0.4)`
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Button glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: `linear-gradient(45deg, rgba(var(--accent-color), 0.1), transparent, rgba(var(--accent-color), 0.1))`
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
                    animate={{ rotate: isStarted ? [0, 180, 360] : 0 }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                  >
                    {isStarted ? (
                      <Trophy className="w-5 h-5" />
                    ) : (
                      <MapPin className="w-5 h-5" />
                    )}
                  </motion.div>
                  <span>{isStarted ? 'Continue Quest' : 'Start Quest'}</span>
                </div>
              </motion.button>
            )}

            {/* Completion display */}
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
                  <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
                </motion.div>
                <p className="text-green-400 font-bold text-lg mb-1">Quest Complete!</p>
                <p
                  className="text-sm opacity-70"
                  style={{ color: isDarkMode ? 'rgb(200, 200, 200)' : 'rgb(80, 80, 80)' }}
                >
                  Earned {quest.total_checkpoints * quest.points_per_checkpoint} points
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Particle effects for completed quests */}
        {isCompleted && isHovered && (
          <>
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full opacity-80 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(255, 215, 0, 0.8), transparent)',
                  left: `${20 + (i * 8)}%`,
                  top: `${20 + (i * 6)}%`,
                  transform: "translateZ(50px)"
                }}
                animate={{
                  scale: [0, 1.5, 0],
                  opacity: [0, 0.8, 0],
                  rotate: [0, 180, 360],
                  x: [0, Math.sin(i) * 30, 0],
                  y: [0, -Math.cos(i) * 30, 0]
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
      </GlassCard>
    </motion.div>
  );
};

export default EnhancedQuestCard;