import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { questService } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import MedievalCard from '../components/MedievalCard';
import LoadingSpinner from '../components/LoadingSpinner';
import PageTransition, { StaggerContainer, StaggerItem } from '../components/PageTransition';
import ProgressBar from '../components/ProgressBar';
import { Trophy, Coins, MapPin, Star, Scroll, Crown, Shield, Sword } from 'lucide-react';

function Progress() {
  const { isDarkMode } = useTheme();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuests: 0,
    completedQuests: 0,
    totalPoints: 0,
    totalCheckpoints: 0,
    completedCheckpoints: 0
  });

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const questsData = await questService.getQuests();
      setQuests(questsData);

      // Calculate stats
      const totalQuests = questsData.length;
      const completedQuests = questsData.filter(q => q.is_completed).length;
      const totalCheckpoints = questsData.reduce((sum, q) => sum + q.total_checkpoints, 0);
      const completedCheckpoints = questsData.reduce((sum, q) => sum + q.completed_checkpoints, 0);
      const totalPoints = questsData.reduce((sum, q) => sum + (q.completed_checkpoints * q.points_per_checkpoint), 0);

      setStats({
        totalQuests,
        completedQuests,
        totalPoints,
        totalCheckpoints,
        completedCheckpoints
      });
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageTransition variant="fade">
        <LoadingSpinner
          size="large"
          variant="quest"
          message="Loading Your Chronicle..."
        />
      </PageTransition>
    );
  }

  const completionRate = stats.totalQuests > 0 ? (stats.completedQuests / stats.totalQuests) * 100 : 0;
  const checkpointRate = stats.totalCheckpoints > 0 ? (stats.completedCheckpoints / stats.totalCheckpoints) * 100 : 0;

  return (
    <PageTransition variant="slideUp" duration={0.6}>
      <div className="progress-page container mx-auto px-6 py-4">
        {/* Medieval Progress Header */}
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <MedievalCard
            variant="scroll"
            elevation="high"
            className="p-8 text-center relative overflow-visible"
          >
            <motion.div
              className="flex items-center justify-center mb-4"
              animate={{
                rotateY: [0, 10, -10, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <span className="text-4xl md:text-5xl">📜</span>
            </motion.div>

            <h1
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{
                color: `rgb(var(--accent-color))`,
                fontFamily: 'serif',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
              }}
            >
              Your Progress
            </h1>

            <motion.p
              className="text-lg font-semibold tracking-wide mb-6"
              style={{ color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)' }}
              animate={{
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              ~ Chronicle of Your Adventures ~
            </motion.p>
          </MedievalCard>
        </motion.div>

        {/* Overall Stats - Medieval Style */}
        <StaggerContainer className="mb-12">
          <motion.h2
            className="text-3xl font-bold mb-8 text-center"
            style={{
              color: `rgb(var(--accent-color))`,
              fontFamily: 'serif',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            ⚔️ Your Achievements
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Trophy,
                number: stats.completedQuests,
                label: 'Quests Completed',
                progress: completionRate,
                subtext: `${Math.round(completionRate)}% of all quests`
              },
              {
                icon: Coins,
                number: stats.totalPoints,
                label: 'Gold Earned',
                subtext: 'Keep exploring to earn more!'
              },
              {
                icon: MapPin,
                number: stats.completedCheckpoints,
                label: 'Locations Visited',
                progress: checkpointRate,
                subtext: `${Math.round(checkpointRate)}% of all locations`
              }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <StaggerItem key={index} variant="scale">
                  <MedievalCard
                    variant="parchment"
                    elevation="medium"
                    className="p-6 text-center h-full"
                  >
                    <motion.div
                      className="mb-4"
                      animate={{
                        scale: [1, 1.05, 1]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: index * 0.8
                      }}
                    >
                      <Icon
                        className="w-12 h-12 mx-auto"
                        style={{ color: `rgb(var(--accent-color))` }}
                      />
                    </motion.div>

                    <div
                      className="text-3xl font-bold mb-2"
                      style={{
                        color: `rgb(var(--accent-color))`,
                        fontFamily: 'serif'
                      }}
                    >
                      {stat.number}
                    </div>

                    <div
                      className="text-lg font-semibold mb-3"
                      style={{ color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)' }}
                    >
                      {stat.label}
                    </div>

                    {stat.progress !== undefined && (
                      <div className="mb-3">
                        <ProgressBar
                          value={stat.progress}
                          max={100}
                          color="gold"
                          height="medium"
                          animated={true}
                          glow={true}
                          className="mb-2"
                        />
                      </div>
                    )}

                    <div
                      className="text-sm opacity-80"
                      style={{
                        color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)',
                        fontStyle: 'italic'
                      }}
                    >
                      {stat.subtext}
                    </div>
                  </MedievalCard>
                </StaggerItem>
              );
            })}
          </div>
        </StaggerContainer>

        {/* Quest Progress - Medieval Style */}
        <section className="mb-12">
          <motion.h2
            className="text-3xl font-bold mb-8 text-center"
            style={{
              color: `rgb(var(--accent-color))`,
              fontFamily: 'serif',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            🗺️ Quest Chronicles
          </motion.h2>

          <StaggerContainer className="space-y-6">
            {quests.map((quest, index) => {
              const progressPercent = (quest.completed_checkpoints / quest.total_checkpoints) * 100;
              return (
                <StaggerItem key={quest.id} variant="slideUp">
                  <MedievalCard
                    variant="parchment"
                    elevation="medium"
                    className="p-6"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <motion.div
                            animate={{
                              rotate: quest.is_completed ? [0, 360] : 0
                            }}
                            transition={{
                              duration: 2,
                              repeat: quest.is_completed ? Infinity : 0,
                              ease: 'linear'
                            }}
                          >
                            {quest.is_completed ? (
                              <Trophy className="w-6 h-6" style={{ color: `rgb(var(--accent-color))` }} />
                            ) : quest.completed_checkpoints > 0 ? (
                              <Sword className="w-6 h-6" style={{ color: `rgb(var(--accent-color))` }} />
                            ) : (
                              <Scroll className="w-6 h-6" style={{ color: `rgb(var(--accent-color))` }} />
                            )}
                          </motion.div>
                          <h4
                            className="text-xl font-bold"
                            style={{
                              color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)',
                              fontFamily: 'serif'
                            }}
                          >
                            {quest.name}
                          </h4>
                        </div>
                        <p
                          className="text-sm mb-4 opacity-80"
                          style={{
                            color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)',
                            fontStyle: 'italic'
                          }}
                        >
                          {quest.description}
                        </p>

                        <div className="flex flex-wrap gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" style={{ color: `rgb(var(--accent-color))` }} />
                            <span style={{ color: isDarkMode ? 'rgb(220, 205, 180)' : 'rgb(60, 50, 30)' }}>
                              {quest.completed_checkpoints}/{quest.total_checkpoints} locations
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Coins className="w-4 h-4" style={{ color: `rgb(var(--accent-color))` }} />
                            <span style={{ color: isDarkMode ? 'rgb(220, 205, 180)' : 'rgb(60, 50, 30)' }}>
                              {quest.completed_checkpoints * quest.points_per_checkpoint} gold earned
                            </span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <ProgressBar
                            value={quest.completed_checkpoints}
                            max={quest.total_checkpoints}
                            color={quest.is_completed ? 'emerald' : quest.completed_checkpoints > 0 ? 'gold' : 'bronze'}
                            height="medium"
                            animated={true}
                            striped={quest.completed_checkpoints > 0 && !quest.is_completed}
                            glow={quest.completed_checkpoints > 0}
                          />
                        </div>
                      </div>

                      <div className="lg:w-48 flex justify-center">
                        {quest.is_completed ? (
                          <motion.div
                            className="text-center"
                            animate={{
                              scale: [1, 1.05, 1]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut'
                            }}
                          >
                            <Trophy className="w-12 h-12 mx-auto mb-2 text-yellow-600" />
                            <span
                              className="font-bold text-lg"
                              style={{ color: `rgb(var(--accent-color))` }}
                            >
                              Completed!
                            </span>
                          </motion.div>
                        ) : (
                          <Link to={`/quests/${quest.id}`}>
                            <motion.button
                              className="px-6 py-3 rounded-lg font-semibold border-2"
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
                              {quest.completed_checkpoints > 0 ? 'Continue Quest' : 'Start Quest'}
                            </motion.button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </MedievalCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </section>

        {/* Achievements - Medieval Style */}
        <section className="mb-12">
          <motion.h2
            className="text-3xl font-bold mb-8 text-center"
            style={{
              color: `rgb(var(--accent-color))`,
              fontFamily: 'serif',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            🎖️ Honor & Achievements
          </motion.h2>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'First Quest', description: 'Complete your first quest', icon: '🎯', unlocked: stats.completedQuests >= 1 },
              { title: 'Explorer', description: 'Visit 5 different locations', icon: '🗺️', unlocked: stats.completedCheckpoints >= 5 },
              { title: 'Century Club', description: 'Earn 100 gold', icon: '💯', unlocked: stats.totalPoints >= 100 },
              { title: 'Quest Master', description: 'Complete 3 quests', icon: '🏆', unlocked: stats.completedQuests >= 3 },
              { title: 'Columbus Champion', description: 'Complete all available quests', icon: '👑', unlocked: completionRate >= 100 },
              { title: 'Local Legend', description: 'Visit 10 different locations', icon: '🌟', unlocked: stats.completedCheckpoints >= 10 }
            ].map((achievement, index) => (
              <StaggerItem key={index} variant="scale">
                <MedievalCard
                  variant={achievement.unlocked ? "scroll" : "parchment"}
                  elevation="medium"
                  className={`p-6 text-center h-full transition-all duration-300 ${achievement.unlocked ? 'opacity-100' : 'opacity-60'}`}
                >
                  <motion.div
                    className="mb-4"
                    animate={achievement.unlocked ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    } : {}}
                    transition={{
                      duration: 3,
                      repeat: achievement.unlocked ? Infinity : 0,
                      ease: 'easeInOut',
                      delay: index * 0.2
                    }}
                  >
                    <span className="text-4xl">{achievement.icon}</span>
                  </motion.div>

                  <h5
                    className="text-lg font-bold mb-2"
                    style={{
                      color: achievement.unlocked
                        ? `rgb(var(--accent-color))`
                        : isDarkMode ? 'rgb(180, 165, 140)' : 'rgb(100, 85, 65)',
                      fontFamily: 'serif'
                    }}
                  >
                    {achievement.title}
                  </h5>

                  <p
                    className="text-sm opacity-80"
                    style={{
                      color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)',
                      fontStyle: 'italic'
                    }}
                  >
                    {achievement.description}
                  </p>

                  {achievement.unlocked && (
                    <motion.div
                      className="mt-3 px-3 py-1 rounded-full text-xs font-bold"
                      style={{
                        background: `rgba(var(--accent-color), 0.2)`,
                        color: `rgb(var(--accent-color))`
                      }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                    >
                      UNLOCKED
                    </motion.div>
                  )}
                </MedievalCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* Quick Actions - Medieval Style */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
        >
          <MedievalCard
            variant="parchment"
            elevation="medium"
            className="p-6"
          >
            <h3
              className="text-xl font-bold mb-6"
              style={{
                color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)',
                fontFamily: 'serif'
              }}
            >
              Continue Your Adventure
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { to: '/quests', icon: Scroll, label: 'Continue Exploring' },
                { to: '/leaderboard', icon: Trophy, label: 'View Leaderboard' },
                { to: '/map', icon: MapPin, label: 'Explore Map' }
              ].map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link key={index} to={action.to}>
                    <motion.button
                      className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold border-2"
                      style={{
                        background: isDarkMode
                          ? `linear-gradient(135deg, rgba(var(--accent-color), 0.2), rgba(var(--accent-color), 0.1))`
                          : `linear-gradient(135deg, rgba(var(--accent-color), 0.3), rgba(var(--accent-color), 0.2))`,
                        borderColor: `rgba(var(--accent-color), 0.6)`,
                        color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)'
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.8 + index * 0.1 }}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{action.label}</span>
                    </motion.button>
                  </Link>
                );
              })}
            </div>
          </MedievalCard>
        </motion.div>
      </div>
    </PageTransition>
  );
}

export default Progress;