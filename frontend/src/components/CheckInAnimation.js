import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Star, Trophy, MapPin, Zap } from 'lucide-react';

const CheckInAnimation = ({
  isVisible,
  onComplete,
  questName = 'Quest Location',
  points = 100,
  isQuestComplete = false,
  achievements = []
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const steps = [
        { delay: 0, duration: 800 }, // Check-in animation
        { delay: 1000, duration: 1000 }, // Points animation
        { delay: 2200, duration: 800 }, // Quest completion (if applicable)
        { delay: 3200, duration: 1200 } // Final celebration
      ];

      steps.forEach((step, index) => {
        setTimeout(() => {
          setCurrentStep(index + 1);
          if (index === 1) setShowConfetti(true);
        }, step.delay);
      });

      setTimeout(() => {
        onComplete && onComplete();
      }, 4500);
    }
  }, [isVisible, onComplete]);

  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b'][Math.floor(Math.random() * 5)]
  }));

  const checkInVariants = {
    hidden: { scale: 0, rotate: -180, opacity: 0 },
    visible: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 500,
        duration: 0.8
      }
    }
  };

  const pointsVariants = {
    hidden: { y: 50, opacity: 0, scale: 0.5 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300
      }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.2, 1],
      boxShadow: [
        '0 0 0 0 rgba(34, 197, 94, 0.4)',
        '0 0 0 20px rgba(34, 197, 94, 0)',
        '0 0 0 0 rgba(34, 197, 94, 0)'
      ],
      transition: {
        duration: 2,
        repeat: Infinity
      }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Confetti */}
          {showConfetti && (
            <div className="absolute inset-0 overflow-hidden">
              {confettiPieces.map((piece) => (
                <motion.div
                  key={piece.id}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: piece.color,
                    left: `${piece.x}%`,
                    top: '-10px'
                  }}
                  initial={{ y: -10, rotate: 0 }}
                  animate={{
                    y: window.innerHeight + 10,
                    rotate: 720,
                    x: Math.random() * 200 - 100
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    ease: 'easeOut',
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </div>
          )}

          {/* Main Card */}
          <motion.div
            className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center relative overflow-hidden"
            initial={{ scale: 0.5, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.5, y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 500 }}
          >
            {/* Background Glow */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100 opacity-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ delay: 0.5 }}
            />

            <div className="relative z-10">
              {/* Step 1: Check-in Success */}
              <AnimatePresence>
                {currentStep >= 1 && (
                  <motion.div
                    variants={checkInVariants}
                    initial="hidden"
                    animate="visible"
                    className="mb-6"
                  >
                    <motion.div
                      className="inline-block relative"
                      variants={pulseVariants}
                      animate="pulse"
                    >
                      <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />

                      {/* Success particles */}
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 bg-green-400 rounded-full"
                          style={{
                            top: '50%',
                            left: '50%',
                            marginTop: '-4px',
                            marginLeft: '-4px'
                          }}
                          initial={{ scale: 0, x: 0, y: 0 }}
                          animate={{
                            scale: [0, 1, 0],
                            x: Math.cos((i * 60) * Math.PI / 180) * 40,
                            y: Math.sin((i * 60) * Math.PI / 180) * 40
                          }}
                          transition={{
                            duration: 1,
                            delay: 0.3 + (i * 0.1),
                            ease: 'easeOut'
                          }}
                        />
                      ))}
                    </motion.div>

                    <motion.h2
                      className="text-2xl font-bold text-gray-800 mt-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      Check-in Successful!
                    </motion.h2>

                    <motion.p
                      className="text-gray-600 mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      <MapPin className="w-4 h-4 inline mr-1" />
                      {questName}
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 2: Points Earned */}
              <AnimatePresence>
                {currentStep >= 2 && (
                  <motion.div
                    variants={pointsVariants}
                    initial="hidden"
                    animate="visible"
                    className="mb-6"
                  >
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-4 px-6 rounded-xl">
                      <motion.div
                        className="flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 500 }}
                      >
                        <Zap className="w-6 h-6 mr-2" />
                        <span className="text-2xl font-bold">+{points}</span>
                        <span className="ml-1">points</span>
                      </motion.div>

                      {/* Point particles */}
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0],
                            x: Math.cos((i * 45) * Math.PI / 180) * 30,
                            y: Math.sin((i * 45) * Math.PI / 180) * 30
                          }}
                          transition={{
                            duration: 0.8,
                            delay: 0.5 + (i * 0.1)
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 3: Quest Complete */}
              <AnimatePresence>
                {currentStep >= 3 && isQuestComplete && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="mb-6"
                  >
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-6 rounded-xl">
                      <Trophy className="w-8 h-8 mx-auto mb-2" />
                      <h3 className="text-xl font-bold">Quest Complete!</h3>
                      <p className="text-sm opacity-90">You've completed all checkpoints</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 4: Achievements */}
              <AnimatePresence>
                {currentStep >= 4 && achievements.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <h4 className="font-semibold text-gray-800">New Achievements:</h4>
                    {achievements.map((achievement, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center justify-center bg-blue-50 text-blue-800 py-2 px-4 rounded-lg"
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.2 }}
                      >
                        <Star className="w-4 h-4 mr-2 text-yellow-500" />
                        <span className="text-sm font-medium">{achievement}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Continue Button */}
              <AnimatePresence>
                {currentStep >= 4 && (
                  <motion.button
                    className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-medium"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onComplete}
                  >
                    Continue Quest
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CheckInAnimation;