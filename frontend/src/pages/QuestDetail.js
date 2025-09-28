import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { questService } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import MedievalCard from '../components/MedievalCard';
import LoadingSpinner from '../components/LoadingSpinner';
import PageTransition, { StaggerContainer, StaggerItem } from '../components/PageTransition';
import ProgressBar from '../components/ProgressBar';
import { ArrowLeft, Trophy, Scroll, MapPin, Coins, Star, Crown, Shield } from 'lucide-react';

function QuestDetail() {
  const { isDarkMode } = useTheme();
  const { id } = useParams();
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadQuest();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadQuest = async () => {
    try {
      const questData = await questService.getQuest(id);
      setQuest(questData);
    } catch (error) {
      console.error('Error loading quest:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (checkpoint) => {
    if (checkpoint.visited) {
      alert('You have already checked in here!');
      return;
    }

    setCheckingIn(true);
    setSelectedCheckpoint(checkpoint);

    try {
      const result = await questService.checkIn(quest.id, checkpoint.id);

      // Update the quest data to reflect the check-in
      setQuest(prevQuest => ({
        ...prevQuest,
        completed_checkpoints: prevQuest.completed_checkpoints + 1,
        is_completed: result.quest_completed,
        checkpoints: prevQuest.checkpoints.map(cp =>
          cp.id === checkpoint.id ? { ...cp, visited: true } : cp
        )
      }));

      setShowSuccess({
        message: result.message,
        points: result.points_earned,
        questCompleted: result.quest_completed,
        totalPoints: result.total_points
      });

    } catch (error) {
      console.error('Check-in failed:', error);
      alert('Check-in failed. Please try again.');
    } finally {
      setCheckingIn(false);
      setSelectedCheckpoint(null);
    }
  };

  const getProgressPercent = () => {
    return (quest.completed_checkpoints / quest.total_checkpoints) * 100;
  };

  const getNextCheckpoint = () => {
    return quest.checkpoints.find(cp => !cp.visited);
  };

  if (loading) {
    return (
      <PageTransition variant="fade">
        <LoadingSpinner
          size="large"
          variant="quest"
          message="Loading Quest Details..."
        />
      </PageTransition>
    );
  }

  if (!quest) {
    return (
      <PageTransition variant="fade">
        <div className="container mx-auto px-6 py-4 text-center">
          <MedievalCard
            variant="parchment"
            elevation="medium"
            className="p-12"
          >
            <h2
              className="text-2xl font-bold mb-4"
              style={{
                color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)',
                fontFamily: 'serif'
              }}
            >
              Quest Not Found
            </h2>
            <Link to="/quests">
              <motion.button
                className="px-6 py-3 rounded-lg font-semibold border-2 flex items-center space-x-2 mx-auto"
                style={{
                  background: isDarkMode
                    ? `linear-gradient(135deg, rgba(var(--accent-color), 0.2), rgba(var(--accent-color), 0.1))`
                    : `linear-gradient(135deg, rgba(var(--accent-color), 0.3), rgba(var(--accent-color), 0.2))`,
                  borderColor: `rgba(var(--accent-color), 0.6)`,
                  color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Quests</span>
              </motion.button>
            </Link>
          </MedievalCard>
        </div>
      </PageTransition>
    );
  }

  const progressPercent = getProgressPercent();
  const nextCheckpoint = getNextCheckpoint();

  return (
    <PageTransition variant="slideUp" duration={0.6}>
      <div className="quest-detail container mx-auto px-6 py-4">
        {/* Success Modal - Medieval Style */}
        {showSuccess && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(10px)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="max-w-md w-full"
            >
              <MedievalCard
                variant="scroll"
                elevation="high"
                className="p-8 text-center relative overflow-visible"
              >
                {/* Celebration animation */}
                <motion.div
                  className="absolute -top-6 left-1/2 transform -translate-x-1/2"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center border-2"
                    style={{
                      background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.9), rgba(255, 215, 0, 0.7))',
                      borderColor: 'rgba(218, 165, 32, 0.8)',
                      boxShadow: '0 0 30px rgba(218, 165, 32, 0.7)'
                    }}
                  >
                    <Trophy className="w-8 h-8 text-amber-900" />
                  </div>
                </motion.div>

                <div className="mt-8">
                  <h3
                    className="text-2xl font-bold mb-4"
                    style={{
                      color: `rgb(var(--accent-color))`,
                      fontFamily: 'serif'
                    }}
                  >
                    Check-in Successful!
                  </h3>

                  <p
                    className="text-lg mb-6"
                    style={{
                      color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)',
                      fontStyle: 'italic'
                    }}
                  >
                    {showSuccess.message}
                  </p>

                  <div className="mb-6">
                    <div
                      className="text-3xl font-bold mb-2"
                      style={{
                        color: `rgb(var(--accent-color))`,
                        fontFamily: 'serif'
                      }}
                    >
                      +{showSuccess.points} Gold
                    </div>
                    <div
                      className="text-sm opacity-70"
                      style={{ color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)' }}
                    >
                      Total: {showSuccess.totalPoints} gold
                    </div>
                  </div>

                  {showSuccess.questCompleted && (
                    <motion.div
                      className="mb-6 p-4 rounded-lg border-2"
                      style={{
                        background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.2), rgba(255, 215, 0, 0.1))',
                        borderColor: 'rgba(218, 165, 32, 0.6)'
                      }}
                      animate={{
                        scale: [1, 1.02, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    >
                      <Crown className="w-8 h-8 mx-auto mb-2" style={{ color: `rgb(var(--accent-color))` }} />
                      <strong
                        className="block text-lg mb-2"
                        style={{
                          color: `rgb(var(--accent-color))`,
                          fontFamily: 'serif'
                        }}
                      >
                        Quest Completed!
                      </strong>
                      <p
                        className="text-sm"
                        style={{
                          color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)',
                          fontStyle: 'italic'
                        }}
                      >
                        Congratulations on finishing "{quest.name}"
                      </p>
                    </motion.div>
                  )}

                  <motion.button
                    className="px-8 py-3 rounded-lg font-semibold border-2"
                    style={{
                      background: isDarkMode
                        ? `linear-gradient(135deg, rgba(var(--accent-color), 0.2), rgba(var(--accent-color), 0.1))`
                        : `linear-gradient(135deg, rgba(var(--accent-color), 0.3), rgba(var(--accent-color), 0.2))`,
                      borderColor: `rgba(var(--accent-color), 0.6)`,
                      color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)'
                    }}
                    onClick={() => setShowSuccess(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Continue Adventure
                  </motion.button>
                </div>
              </MedievalCard>
            </motion.div>
          </motion.div>
        )}

        {/* Quest Header - Medieval Style */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <MedievalCard
            variant="scroll"
            elevation="high"
            className="p-8 relative overflow-visible"
          >
            {/* Breadcrumb */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link to="/quests">
                <motion.div
                  className="flex items-center space-x-2 text-sm font-semibold"
                  style={{ color: `rgb(var(--accent-color))` }}
                  whileHover={{ x: -5 }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Quest Board</span>
                </motion.div>
              </Link>
            </motion.div>

            {/* Quest Status Badge */}
            <motion.div
              className="absolute -top-4 -right-4 z-20"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 500 }}
            >
              <div
                className="px-4 py-2 rounded-full text-sm font-bold border-2 backdrop-blur-sm"
                style={{
                  background: quest.is_completed
                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(34, 197, 94, 0.1))'
                    : quest.completed_checkpoints > 0
                      ? 'linear-gradient(135deg, rgba(218, 165, 32, 0.3), rgba(218, 165, 32, 0.1))'
                      : 'linear-gradient(135deg, rgba(120, 100, 70, 0.3), rgba(120, 100, 70, 0.1))',
                  borderColor: quest.is_completed
                    ? 'rgba(34, 197, 94, 0.6)'
                    : quest.completed_checkpoints > 0
                      ? 'rgba(218, 165, 32, 0.6)'
                      : 'rgba(120, 100, 70, 0.6)',
                  color: quest.is_completed
                    ? 'rgb(34, 197, 94)'
                    : quest.completed_checkpoints > 0
                      ? 'rgb(218, 165, 32)'
                      : isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)',
                  boxShadow: quest.is_completed
                    ? '0 0 15px rgba(34, 197, 94, 0.3)'
                    : quest.completed_checkpoints > 0
                      ? '0 0 15px rgba(218, 165, 32, 0.3)'
                      : 'none'
                }}
              >
                {quest.is_completed ? (
                  <div className="flex items-center space-x-1">
                    <Trophy className="w-4 h-4" />
                    <span>Completed</span>
                  </div>
                ) : quest.completed_checkpoints > 0 ? (
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4" />
                    <span>In Progress</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <Scroll className="w-4 h-4" />
                    <span>Ready to Start</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quest Title */}
            <motion.div
              className="text-center mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h1
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{
                  color: `rgb(var(--accent-color))`,
                  fontFamily: 'serif',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
                }}
              >
                {quest.name}
              </h1>
              <p
                className="text-lg leading-relaxed max-w-2xl mx-auto"
                style={{
                  color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)',
                  fontStyle: 'italic'
                }}
              >
                {quest.description}
              </p>
            </motion.div>

            {/* Quest Stats */}
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { value: quest.completed_checkpoints, label: 'Completed', icon: Trophy },
                { value: quest.total_checkpoints, label: 'Total Stops', icon: MapPin },
                { value: quest.points_per_checkpoint, label: 'Gold Each', icon: Coins },
                { value: quest.total_checkpoints * quest.points_per_checkpoint, label: 'Max Gold', icon: Star }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <StaggerItem key={index} variant="scale">
                    <motion.div
                      className="text-center p-4 rounded-lg border-2"
                      style={{
                        background: isDarkMode
                          ? 'rgba(60, 50, 35, 0.3)'
                          : 'rgba(40, 30, 20, 0.05)',
                        borderColor: isDarkMode
                          ? 'rgba(120, 100, 70, 0.3)'
                          : 'rgba(100, 80, 60, 0.2)'
                      }}
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      <Icon
                        className="w-6 h-6 mx-auto mb-2"
                        style={{ color: `rgb(var(--accent-color))` }}
                      />
                      <div
                        className="text-2xl font-bold mb-1"
                        style={{
                          color: `rgb(var(--accent-color))`,
                          fontFamily: 'serif'
                        }}
                      >
                        {stat.value}
                      </div>
                      <div
                        className="text-sm font-medium"
                        style={{ color: isDarkMode ? 'rgb(220, 205, 180)' : 'rgb(60, 50, 30)' }}
                      >
                        {stat.label}
                      </div>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>

            {/* Progress Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="mb-3 flex justify-between items-center">
                <span
                  className="text-lg font-semibold"
                  style={{ color: isDarkMode ? 'rgb(220, 205, 180)' : 'rgb(60, 50, 30)' }}
                >
                  Overall Progress
                </span>
                <span
                  className="text-lg font-bold"
                  style={{ color: `rgb(var(--accent-color))` }}
                >
                  {Math.round(progressPercent)}% Complete
                </span>
              </div>
              <ProgressBar
                value={quest.completed_checkpoints}
                max={quest.total_checkpoints}
                color={quest.is_completed ? 'emerald' : quest.completed_checkpoints > 0 ? 'gold' : 'bronze'}
                height="large"
                animated={true}
                striped={quest.completed_checkpoints > 0 && !quest.is_completed}
                glow={quest.completed_checkpoints > 0}
                showPercentage={false}
              />
            </motion.div>
          </MedievalCard>
        </motion.div>

      {/* Next Checkpoint Highlight */}
      {nextCheckpoint && !quest.is_completed && (
        <div className="next-checkpoint">
          <h3>🎯 Next Stop</h3>
          <div className="next-checkpoint-card">
            <div className="checkpoint-info">
              <h4>{nextCheckpoint.name}</h4>
              <p>{nextCheckpoint.description}</p>
              <span className="checkpoint-order">Stop #{nextCheckpoint.order_number}</span>
            </div>
            <button
              className="btn btn-primary btn-large"
              onClick={() => handleCheckIn(nextCheckpoint)}
              disabled={checkingIn}
            >
              {checkingIn && selectedCheckpoint?.id === nextCheckpoint.id
                ? 'Checking In...'
                : 'Check In Here'
              }
            </button>
          </div>
        </div>
      )}

      {/* All Checkpoints */}
      <div className="checkpoints-section">
        <h3>📍 All Quest Locations</h3>
        <div className="checkpoints-list">
          {quest.checkpoints
            .sort((a, b) => a.order_number - b.order_number)
            .map((checkpoint, index) => (
            <div
              key={checkpoint.id}
              className={`checkpoint-card ${checkpoint.visited ? 'visited' : 'unvisited'}`}
            >
              <div className="checkpoint-number">
                {checkpoint.visited ? '✅' : index + 1}
              </div>

              <div className="checkpoint-content">
                <h4>{checkpoint.name}</h4>
                <p>{checkpoint.description}</p>

                <div className="checkpoint-meta">
                  <span className="order">Stop #{checkpoint.order_number}</span>
                  <span className="points">+{quest.points_per_checkpoint} points</span>
                </div>
              </div>

              <div className="checkpoint-action">
                {checkpoint.visited ? (
                  <div className="visited-badge">
                    <span className="visited-icon">✅</span>
                    <span>Visited</span>
                  </div>
                ) : (
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleCheckIn(checkpoint)}
                    disabled={checkingIn}
                  >
                    {checkingIn && selectedCheckpoint?.id === checkpoint.id
                      ? 'Checking In...'
                      : 'Check In'
                    }
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completion Section */}
      {quest.is_completed && (
        <div className="completion-section">
          <div className="completion-card">
            <span className="completion-icon">🏆</span>
            <h3>Quest Completed!</h3>
            <p>Congratulations! You've successfully completed "{quest.name}"</p>
            <div className="completion-stats">
              <span>Total Points Earned: {quest.total_checkpoints * quest.points_per_checkpoint}</span>
            </div>
            <div className="completion-actions">
              <Link to="/quests" className="btn btn-primary">
                Find Another Quest
              </Link>
              <Link to="/leaderboard" className="btn btn-secondary">
                View Leaderboard
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <Link to="/map" className="action-link">
          🗺️ View on Map
        </Link>
        <Link to="/quests" className="action-link">
          📋 All Quests
        </Link>
        <Link to="/leaderboard" className="action-link">
          🏆 Leaderboard
        </Link>
      </div>
      </div>
    </PageTransition>
  );
}

export default QuestDetail;