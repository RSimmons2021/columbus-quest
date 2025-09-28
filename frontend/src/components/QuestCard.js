import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Trophy, Clock, Users } from 'lucide-react';
import AnimatedCard from './AnimatedCard';
import AnimatedButton from './AnimatedButton';
import ProgressBar from './ProgressBar';

const QuestCard = ({
  quest,
  onStartQuest,
  onContinueQuest,
  showFullDetails = false,
  delay = 0,
  className = ''
}) => {

  const isCompleted = quest.completed_checkpoints === quest.total_checkpoints;
  const isStarted = quest.completed_checkpoints > 0;

  const getStatusColor = () => {
    if (isCompleted) return 'green';
    if (isStarted) return 'yellow';
    return 'blue';
  };

  const getStatusText = () => {
    if (isCompleted) return 'Completed';
    if (isStarted) return 'In Progress';
    return 'Not Started';
  };

  const handleQuestAction = () => {
    if (isStarted && !isCompleted) {
      onContinueQuest && onContinueQuest(quest);
    } else if (!isStarted) {
      onStartQuest && onStartQuest(quest);
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

  const badgeVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <motion.div
      className={`quest-card-wrapper ${className}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatedCard
        className="h-full flex flex-col relative overflow-visible"
        hoverEffect="lift"
        glowColor={getStatusColor()}
        clickable={!isCompleted}
        onClick={!isCompleted ? handleQuestAction : undefined}
      >
        {/* Status Badge */}
        <motion.div
          className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-semibold z-10 shadow-lg ${
            isCompleted
              ? 'bg-green-500 text-white'
              : isStarted
              ? 'bg-yellow-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
          variants={isStarted && !isCompleted ? badgeVariants : {}}
          animate={isStarted && !isCompleted ? 'pulse' : ''}
        >
          {getStatusText()}
        </motion.div>

        {/* Completion Crown */}
        {isCompleted && (
          <motion.div
            className="absolute -top-3 left-1/2 transform -translate-x-1/2"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 500 }}
          >
            <div className="bg-yellow-400 p-2 rounded-full shadow-lg">
              <Trophy className="w-5 h-5 text-yellow-900" />
            </div>
          </motion.div>
        )}

        <div className="p-6 flex flex-col h-full">
          {/* Quest Header */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
              {quest.name}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-3 mb-3">
              {quest.description}
            </p>
          </div>

          {/* Quest Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center text-sm text-gray-500">
              <MapPin className="w-4 h-4 mr-2 text-blue-500" />
              <span>{quest.total_checkpoints} stops</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              <span>{quest.points_per_checkpoint} pts each</span>
            </div>
            {showFullDetails && (
              <>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-2 text-green-500" />
                  <span>~{Math.ceil(quest.total_checkpoints * 15)} min</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-2 text-purple-500" />
                  <span>{quest.difficulty || 'Easy'}</span>
                </div>
              </>
            )}
          </div>

          {/* Progress Section */}
          <div className="mb-6 flex-grow">
            <ProgressBar
              value={quest.completed_checkpoints}
              max={quest.total_checkpoints}
              color={getStatusColor()}
              height="medium"
              label="Progress"
              showPercentage={true}
              animated={true}
              striped={isStarted && !isCompleted}
              glow={isStarted}
              pulse={isStarted && !isCompleted}
            />

            {showFullDetails && quest.completed_checkpoints > 0 && (
              <motion.div
                className="mt-3 text-sm text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex justify-between">
                  <span>Points Earned:</span>
                  <span className="font-semibold text-blue-600">
                    {quest.completed_checkpoints * quest.points_per_checkpoint}
                  </span>
                </div>
                {!isCompleted && (
                  <div className="flex justify-between mt-1">
                    <span>Potential Points:</span>
                    <span className="font-semibold text-gray-500">
                      +{(quest.total_checkpoints - quest.completed_checkpoints) * quest.points_per_checkpoint}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Action Button */}
          <div className="mt-auto">
            {!isCompleted && (
              <AnimatedButton
                variant={isStarted ? 'success' : 'primary'}
                size="medium"
                className="w-full"
                onClick={handleQuestAction}
                icon={
                  isStarted
                    ? <Trophy className="w-4 h-4" />
                    : <MapPin className="w-4 h-4" />
                }
              >
                {isStarted ? 'Continue Quest' : 'Start Quest'}
              </AnimatedButton>
            )}

            {isCompleted && (
              <motion.div
                className="text-center py-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-green-600 font-semibold">Quest Complete!</p>
                <p className="text-sm text-gray-500">
                  Earned {quest.total_checkpoints * quest.points_per_checkpoint} points
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Sparkle Effect for Completed Quests */}
        {isCompleted && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-70"
                style={{
                  top: `${20 + (i * 10)}%`,
                  left: `${20 + (i * 12)}%`
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 0.8, 0],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </>
        )}
      </AnimatedCard>
    </motion.div>
  );
};

export default QuestCard;