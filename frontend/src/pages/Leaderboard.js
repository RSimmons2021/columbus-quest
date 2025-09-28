import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { questService } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import MedievalCard from '../components/MedievalCard';
import LoadingSpinner from '../components/LoadingSpinner';
import PageTransition, { StaggerContainer, StaggerItem } from '../components/PageTransition';
import { Trophy, Crown, Shield, Sword, Star, MapPin, Scroll } from 'lucide-react';

function Leaderboard() {
  const { isDarkMode } = useTheme();
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const data = await questService.getLeaderboard();
      setLeaderboardData(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankClass = (rank) => {
    switch (rank) {
      case 1: return 'rank-gold';
      case 2: return 'rank-silver';
      case 3: return 'rank-bronze';
      default: return 'rank-default';
    }
  };

  const getProgressLevel = (points) => {
    if (points >= 200) return { level: 'Master Explorer', color: '#8B5CF6', icon: '👑' };
    if (points >= 150) return { level: 'Expert Navigator', color: '#F59E0B', icon: '⭐' };
    if (points >= 100) return { level: 'Seasoned Adventurer', color: '#10B981', icon: '🎯' };
    if (points >= 50) return { level: 'Rising Explorer', color: '#3B82F6', icon: '🗺️' };
    if (points >= 20) return { level: 'Quest Beginner', color: '#6B7280', icon: '🌟' };
    return { level: 'New Explorer', color: '#9CA3AF', icon: '🚀' };
  };

  if (loading) {
    return (
      <PageTransition variant="fade">
        <LoadingSpinner
          size="large"
          variant="quest"
          message="Loading Hall of Champions..."
        />
      </PageTransition>
    );
  }

  if (!leaderboardData) {
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
              Unable to Load Leaderboard
            </h2>
            <motion.button
              onClick={loadLeaderboard}
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
              Try Again
            </motion.button>
          </MedievalCard>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition variant="slideUp" duration={0.6}>
      <div className="leaderboard container mx-auto px-6 py-4">
        {/* Medieval Leaderboard Header */}
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
              <span className="text-4xl md:text-5xl">🏆</span>
            </motion.div>

            <h1
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{
                color: `rgb(var(--accent-color))`,
                fontFamily: 'serif',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
              }}
            >
              Leaderboard
            </h1>

            <motion.p
              className="text-lg font-semibold tracking-wide mb-6"
              style={{ color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)' }}
              animate={{
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              ~ Hall of Champions ~
            </motion.p>
          </MedievalCard>
        </motion.div>

        {/* Time Filter - Medieval Style */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <MedievalCard
            variant="parchment"
            elevation="medium"
            className="p-6"
          >
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { key: 'all', label: 'All Time', icon: Crown },
                { key: 'month', label: 'This Month', icon: Shield },
                { key: 'week', label: 'This Week', icon: Sword }
              ].map((filterOption, index) => {
                const Icon = filterOption.icon;
                const isActive = timeFilter === filterOption.key;
                return (
                  <motion.button
                    key={filterOption.key}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold border-2 transition-all duration-300`}
                    style={{
                      background: isActive
                        ? isDarkMode
                          ? `linear-gradient(135deg, rgba(var(--accent-color), 0.3), rgba(var(--accent-color), 0.2))`
                          : `linear-gradient(135deg, rgba(var(--accent-color), 0.4), rgba(var(--accent-color), 0.3))`
                        : isDarkMode
                          ? 'rgba(60, 50, 35, 0.3)'
                          : 'rgba(40, 30, 20, 0.05)',
                      borderColor: isActive
                        ? `rgba(var(--accent-color), 0.8)`
                        : isDarkMode
                          ? 'rgba(120, 100, 70, 0.3)'
                          : 'rgba(100, 80, 60, 0.2)',
                      color: isActive
                        ? `rgb(var(--accent-color))`
                        : isDarkMode ? 'rgb(220, 205, 180)' : 'rgb(60, 50, 30)',
                      boxShadow: isActive ? `0 0 15px rgba(var(--accent-color), 0.3)` : 'none'
                    }}
                    onClick={() => setTimeFilter(filterOption.key)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{filterOption.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </MedievalCard>
        </motion.div>

        {/* Top 3 Podium - Medieval Style */}
        {leaderboardData.leaderboard.length >= 3 && (
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
              transition={{ delay: 0.6 }}
            >
              🎖️ Champions of the Realm
            </motion.h2>

            <StaggerContainer>
              <div className="flex justify-center items-end gap-8 mb-8">
                {/* 2nd Place */}
                <StaggerItem variant="scale" className="order-1">
                  <MedievalCard
                    variant="scroll"
                    elevation="high"
                    className="p-6 text-center relative"
                  >
                    <motion.div
                      className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                      animate={{
                        rotate: [0, 360]
                      }}
                      transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center border-2"
                        style={{
                          background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.9), rgba(169, 169, 169, 0.7))',
                          borderColor: 'rgba(192, 192, 192, 0.8)',
                          boxShadow: '0 0 20px rgba(192, 192, 192, 0.5)'
                        }}
                      >
                        <span className="text-2xl">🥈</span>
                      </div>
                    </motion.div>

                    <div className="mt-4">
                      <div
                        className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold border-2"
                        style={{
                          background: isDarkMode
                            ? 'linear-gradient(135deg, rgba(60, 50, 35, 0.9), rgba(45, 35, 25, 0.95))'
                            : 'linear-gradient(135deg, rgba(250, 245, 235, 0.95), rgba(240, 230, 210, 0.9))',
                          borderColor: `rgba(var(--accent-color), 0.7)`,
                          color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)'
                        }}
                      >
                        {leaderboardData.leaderboard[1].first_name?.[0] || leaderboardData.leaderboard[1].username[0]}
                      </div>
                      <h4
                        className="text-lg font-bold mb-2"
                        style={{
                          color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)',
                          fontFamily: 'serif'
                        }}
                      >
                        {leaderboardData.leaderboard[1].first_name || leaderboardData.leaderboard[1].username}
                      </h4>
                      <p
                        className="text-xl font-bold"
                        style={{ color: `rgb(var(--accent-color))` }}
                      >
                        {leaderboardData.leaderboard[1].total_points} gold
                      </p>
                      {getProgressLevel(leaderboardData.leaderboard[1].total_points) && (
                        <span
                          className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold"
                          style={{
                            background: getProgressLevel(leaderboardData.leaderboard[1].total_points).color,
                            color: 'white'
                          }}
                        >
                          {getProgressLevel(leaderboardData.leaderboard[1].total_points).icon}
                          {getProgressLevel(leaderboardData.leaderboard[1].total_points).level}
                        </span>
                      )}
                    </div>
                  </MedievalCard>
                </StaggerItem>

                {/* 1st Place */}
                <StaggerItem variant="scale" className="order-2">
                  <MedievalCard
                    variant="scroll"
                    elevation="high"
                    className="p-8 text-center relative transform scale-110"
                  >
                    <motion.div
                      className="absolute -top-6 left-1/2 transform -translate-x-1/2"
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        rotate: { duration: 6, repeat: Infinity, ease: 'linear' },
                        scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
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
                        <Crown className="w-8 h-8 text-amber-900" />
                      </div>
                    </motion.div>

                    <div className="mt-6">
                      <div
                        className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold border-2"
                        style={{
                          background: isDarkMode
                            ? 'linear-gradient(135deg, rgba(60, 50, 35, 0.9), rgba(45, 35, 25, 0.95))'
                            : 'linear-gradient(135deg, rgba(250, 245, 235, 0.95), rgba(240, 230, 210, 0.9))',
                          borderColor: `rgba(var(--accent-color), 0.7)`,
                          color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)',
                          boxShadow: `0 0 20px rgba(var(--accent-color), 0.3)`
                        }}
                      >
                        {leaderboardData.leaderboard[0].first_name?.[0] || leaderboardData.leaderboard[0].username[0]}
                      </div>
                      <h4
                        className="text-2xl font-bold mb-3"
                        style={{
                          color: `rgb(var(--accent-color))`,
                          fontFamily: 'serif'
                        }}
                      >
                        {leaderboardData.leaderboard[0].first_name || leaderboardData.leaderboard[0].username}
                      </h4>
                      <p
                        className="text-2xl font-bold"
                        style={{ color: `rgb(var(--accent-color))` }}
                      >
                        {leaderboardData.leaderboard[0].total_points} gold
                      </p>
                      {getProgressLevel(leaderboardData.leaderboard[0].total_points) && (
                        <span
                          className="inline-block mt-3 px-4 py-2 rounded-full text-sm font-bold"
                          style={{
                            background: getProgressLevel(leaderboardData.leaderboard[0].total_points).color,
                            color: 'white',
                            boxShadow: `0 0 15px ${getProgressLevel(leaderboardData.leaderboard[0].total_points).color}`
                          }}
                        >
                          {getProgressLevel(leaderboardData.leaderboard[0].total_points).icon}
                          {getProgressLevel(leaderboardData.leaderboard[0].total_points).level}
                        </span>
                      )}
                    </div>
                  </MedievalCard>
                </StaggerItem>

                {/* 3rd Place */}
                <StaggerItem variant="scale" className="order-3">
                  <MedievalCard
                    variant="scroll"
                    elevation="high"
                    className="p-6 text-center relative"
                  >
                    <motion.div
                      className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                      animate={{
                        rotate: [0, 360]
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center border-2"
                        style={{
                          background: 'linear-gradient(135deg, rgba(205, 127, 50, 0.9), rgba(160, 82, 45, 0.7))',
                          borderColor: 'rgba(205, 127, 50, 0.8)',
                          boxShadow: '0 0 20px rgba(205, 127, 50, 0.5)'
                        }}
                      >
                        <span className="text-2xl">🥉</span>
                      </div>
                    </motion.div>

                    <div className="mt-4">
                      <div
                        className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold border-2"
                        style={{
                          background: isDarkMode
                            ? 'linear-gradient(135deg, rgba(60, 50, 35, 0.9), rgba(45, 35, 25, 0.95))'
                            : 'linear-gradient(135deg, rgba(250, 245, 235, 0.95), rgba(240, 230, 210, 0.9))',
                          borderColor: `rgba(var(--accent-color), 0.7)`,
                          color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)'
                        }}
                      >
                        {leaderboardData.leaderboard[2].first_name?.[0] || leaderboardData.leaderboard[2].username[0]}
                      </div>
                      <h4
                        className="text-lg font-bold mb-2"
                        style={{
                          color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)',
                          fontFamily: 'serif'
                        }}
                      >
                        {leaderboardData.leaderboard[2].first_name || leaderboardData.leaderboard[2].username}
                      </h4>
                      <p
                        className="text-xl font-bold"
                        style={{ color: `rgb(var(--accent-color))` }}
                      >
                        {leaderboardData.leaderboard[2].total_points} gold
                      </p>
                      {getProgressLevel(leaderboardData.leaderboard[2].total_points) && (
                        <span
                          className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold"
                          style={{
                            background: getProgressLevel(leaderboardData.leaderboard[2].total_points).color,
                            color: 'white'
                          }}
                        >
                          {getProgressLevel(leaderboardData.leaderboard[2].total_points).icon}
                          {getProgressLevel(leaderboardData.leaderboard[2].total_points).level}
                        </span>
                      )}
                    </div>
                  </MedievalCard>
                </StaggerItem>
              </div>
            </StaggerContainer>
          </section>
        )}

        {/* Full Rankings - Medieval Style */}
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
            transition={{ delay: 1.0 }}
          >
            📊 Full Rankings
          </motion.h2>

          <StaggerContainer className="space-y-4">
            {leaderboardData.leaderboard.map((user, index) => {
              const level = getProgressLevel(user.total_points);
              return (
                <StaggerItem key={user.id} variant="slideUp">
                  <MedievalCard
                    variant={user.is_current_user ? "scroll" : "parchment"}
                    elevation="medium"
                    className={`p-4 transition-all duration-300 ${user.is_current_user ? 'ring-2' : ''}`}
                    style={{
                      ringColor: user.is_current_user ? `rgba(var(--accent-color), 0.5)` : 'transparent'
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="flex-shrink-0">
                        <motion.div
                          className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-2"
                          style={{
                            background: index < 3
                              ? index === 0
                                ? 'linear-gradient(135deg, rgba(218, 165, 32, 0.3), rgba(255, 215, 0, 0.2))'
                                : index === 1
                                  ? 'linear-gradient(135deg, rgba(192, 192, 192, 0.3), rgba(169, 169, 169, 0.2))'
                                  : 'linear-gradient(135deg, rgba(205, 127, 50, 0.3), rgba(160, 82, 45, 0.2))'
                              : isDarkMode
                                ? 'rgba(60, 50, 35, 0.5)'
                                : 'rgba(40, 30, 20, 0.1)',
                            borderColor: `rgba(var(--accent-color), 0.4)`,
                            color: index < 3 ? `rgb(var(--accent-color))` : isDarkMode ? 'rgb(220, 205, 180)' : 'rgb(60, 50, 30)'
                          }}
                          animate={index < 3 ? {
                            scale: [1, 1.05, 1]
                          } : {}}
                          transition={{
                            duration: 2,
                            repeat: index < 3 ? Infinity : 0,
                            ease: 'easeInOut',
                            delay: index * 0.2
                          }}
                        >
                          {getRankIcon(user.rank)}
                        </motion.div>
                      </div>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold border-2"
                            style={{
                              background: isDarkMode
                                ? 'linear-gradient(135deg, rgba(60, 50, 35, 0.9), rgba(45, 35, 25, 0.95))'
                                : 'linear-gradient(135deg, rgba(250, 245, 235, 0.95), rgba(240, 230, 210, 0.9))',
                              borderColor: `rgba(var(--accent-color), 0.5)`,
                              color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)'
                            }}
                          >
                            {user.first_name?.[0] || user.username[0]}
                          </div>
                          <div>
                            <h4
                              className="font-bold flex items-center gap-2"
                              style={{
                                color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)',
                                fontFamily: 'serif'
                              }}
                            >
                              {user.first_name || user.username}
                              {user.is_current_user && (
                                <span
                                  className="px-2 py-1 rounded-full text-xs font-bold"
                                  style={{
                                    background: `rgba(var(--accent-color), 0.2)`,
                                    color: `rgb(var(--accent-color))`
                                  }}
                                >
                                  You
                                </span>
                              )}
                            </h4>
                            <p
                              className="text-sm flex items-center gap-1"
                              style={{
                                color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)',
                                fontStyle: 'italic'
                              }}
                            >
                              <span>{level.icon}</span>
                              {level.level}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Points */}
                      <div className="text-right">
                        <div
                          className="text-2xl font-bold"
                          style={{
                            color: `rgb(var(--accent-color))`,
                            fontFamily: 'serif'
                          }}
                        >
                          {user.total_points}
                        </div>
                        <div
                          className="text-sm opacity-70"
                          style={{ color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)' }}
                        >
                          gold
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0">
                        {index < 3 && (
                          <motion.span
                            className="text-2xl"
                            animate={{
                              scale: [1, 1.2, 1]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut',
                              delay: index * 0.3
                            }}
                          >
                            🔥
                          </motion.span>
                        )}
                        {user.is_current_user && (
                          <Link to="/quests">
                            <motion.button
                              className="ml-2 px-4 py-2 rounded-lg font-semibold border-2 text-sm"
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
                              Explore More
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

      {/* Current User Position (if not in top rankings) */}
      {leaderboardData.current_user_position && (
        <div className="current-user-section">
          <h3>🎯 Your Position</h3>
          <div className="current-user-card">
            <div className="rank-info">
              <span className="current-rank">#{leaderboardData.current_user_position.rank}</span>
              <span className="rank-label">Your Rank</span>
            </div>
            <div className="user-progress">
              <h4>{leaderboardData.current_user_position.first_name || leaderboardData.current_user_position.username}</h4>
              <p>{leaderboardData.current_user_position.total_points} points</p>
              {getProgressLevel(leaderboardData.current_user_position.total_points) && (
                <span className="level-badge" style={{
                  background: getProgressLevel(leaderboardData.current_user_position.total_points).color
                }}>
                  {getProgressLevel(leaderboardData.current_user_position.total_points).icon}
                  {getProgressLevel(leaderboardData.current_user_position.total_points).level}
                </span>
              )}
            </div>
            <div className="motivation">
              <Link to="/quests" className="btn btn-primary">
                Climb Higher! 🚀
              </Link>
            </div>
          </div>
        </div>
      )}

        {/* Level System Info - Medieval Style */}
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
            transition={{ delay: 1.4 }}
          >
            🎖️ Explorer Ranks
          </motion.h2>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { level: 'Master Explorer', points: '200+', icon: '👑', color: '#8B5CF6' },
              { level: 'Expert Navigator', points: '150+', icon: '⭐', color: '#F59E0B' },
              { level: 'Seasoned Adventurer', points: '100+', icon: '🎯', color: '#10B981' },
              { level: 'Rising Explorer', points: '50+', icon: '🗺️', color: '#3B82F6' },
              { level: 'Quest Beginner', points: '20+', icon: '🌟', color: '#6B7280' },
              { level: 'New Explorer', points: '0+', icon: '🚀', color: '#9CA3AF' }
            ].map((levelInfo, index) => (
              <StaggerItem key={index} variant="scale">
                <MedievalCard
                  variant="parchment"
                  elevation="medium"
                  className="p-6 text-center h-full"
                >
                  <motion.div
                    className="mb-4"
                    animate={{
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: index * 0.2
                    }}
                  >
                    <span className="text-4xl" style={{ color: levelInfo.color }}>
                      {levelInfo.icon}
                    </span>
                  </motion.div>
                  <h5
                    className="text-lg font-bold mb-2"
                    style={{
                      color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)',
                      fontFamily: 'serif'
                    }}
                  >
                    {levelInfo.level}
                  </h5>
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: levelInfo.color,
                      fontStyle: 'italic'
                    }}
                  >
                    {levelInfo.points} gold
                  </p>
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
          transition={{ delay: 1.8 }}
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
              Join the Adventure
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { to: '/quests', icon: Scroll, label: 'Start New Quest' },
                { to: '/map', icon: MapPin, label: 'Explore Map' },
                { to: '/progress', icon: Star, label: 'View Progress' }
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
                      transition={{ delay: 2.0 + index * 0.1 }}
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

export default Leaderboard;