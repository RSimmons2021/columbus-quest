import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { questService } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import MedievalCard from '../components/MedievalCard';
import MedievalQuestCard from '../components/MedievalQuestCard';
import LoadingSpinner from '../components/LoadingSpinner';
import PageTransition, { StaggerContainer, StaggerItem } from '../components/PageTransition';
import { MapPin, Star, Trophy, BarChart3, Coins, Scroll } from 'lucide-react';
import { motion } from 'framer-motion';

function Home() {
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState({
    totalQuests: 0,
    userPoints: 0,
    userRank: null
  });
  const [featuredQuests, setFeaturedQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      // Load user stats and featured quests
      const [questsResponse, leaderboardResponse] = await Promise.all([
        questService.getQuests(),
        questService.getLeaderboard()
      ]);

      setFeaturedQuests(questsResponse.slice(0, 3)); // Show top 3 quests

      // Find current user in leaderboard
      const currentUser = leaderboardResponse.leaderboard.find(user => user.is_current_user);
      const userPosition = currentUser || leaderboardResponse.current_user_position;

      setStats({
        totalQuests: questsResponse.length,
        userPoints: userPosition?.total_points || 0,
        userRank: userPosition?.rank || 'Unranked'
      });
    } catch (error) {
      console.error('Error loading home data:', error);
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
          message="Loading Columbus Quest..."
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition variant="slideUp" duration={0.6}>
      <div className="home container mx-auto px-6 py-4">
        {/* Medieval Guild Hall Hero Section */}
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <MedievalCard
            variant="scroll"
            elevation="high"
            className="p-8 md:p-12 text-center relative overflow-visible"
          >
            {/* Guild Hall Title */}
            <motion.div
              className="relative mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-center mb-4">
                <motion.div
                  animate={{
                    rotateY: [0, 10, -10, 0]
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <span className="text-4xl md:text-5xl">🏛️</span>
                </motion.div>
              </div>

              <h1
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{
                  color: `rgb(var(--accent-color))`,
                  fontFamily: 'serif',
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
                }}
              >
                Columbus Quest
              </h1>

              <motion.div
                className="text-lg font-semibold tracking-wide mb-6"
                style={{ color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)' }}
                animate={{
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                ~ Explorer's Guild Hall ~
              </motion.div>
            </motion.div>

            <motion.p
              className="text-lg mb-10 max-w-2xl mx-auto leading-relaxed italic"
              style={{ color: isDarkMode ? 'rgb(180, 165, 140)' : 'rgb(100, 85, 65)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              "Welcome, brave explorer! Embark on epic quests through the great city of Columbus.
              Discover ancient secrets, earn gold, and etch your name in the annals of legend."
            </motion.p>

            {/* Medieval Stats Display */}
            <StaggerContainer className="flex justify-center gap-8 md:gap-12 flex-wrap">
              {[
                { value: stats.userPoints, label: 'Gold Earned', icon: Coins },
                { value: `#${stats.userRank}`, label: 'Guild Rank', icon: Trophy },
                { value: stats.totalQuests, label: 'Active Quests', icon: Scroll }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <StaggerItem key={index} variant="scale" className="stat-medieval">
                    <motion.div
                      className="relative p-4 md:p-6 rounded-lg border-2"
                      style={{
                        background: isDarkMode
                          ? 'linear-gradient(135deg, rgba(60, 50, 35, 0.8), rgba(45, 35, 25, 0.9))'
                          : 'linear-gradient(135deg, rgba(250, 245, 235, 0.9), rgba(240, 230, 210, 0.8))',
                        borderColor: `rgba(var(--accent-color), 0.6)`,
                        boxShadow: `0 4px 15px rgba(var(--accent-color), 0.2)`
                      }}
                      whileHover={{
                        scale: 1.02,
                        boxShadow: `0 6px 20px rgba(var(--accent-color), 0.2)`
                      }}
                    >
                      <motion.div
                        className="mb-3"
                        animate={{
                          scale: [1, 1.05, 1]
                        }}
                        transition={{
                          duration: 6,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: index * 0.8
                        }}
                      >
                        <Icon
                          className="w-8 h-8 mx-auto"
                          style={{ color: `rgb(var(--accent-color))` }}
                        />
                      </motion.div>
                      <div
                        className="text-2xl md:text-3xl font-bold mb-2"
                        style={{
                          color: `rgb(var(--accent-color))`,
                          fontFamily: 'serif'
                        }}
                      >
                        {stat.value}
                      </div>
                      <div
                        className="text-sm font-semibold opacity-80"
                        style={{ color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)' }}
                      >
                        {stat.label}
                      </div>
                    </motion.div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </MedievalCard>
        </motion.div>

        {/* Featured Quests - Medieval Quest Board */}
        <section className="featured-quests mb-12">
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
            ⚔️ Featured Quests
          </motion.h2>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredQuests.map((quest, index) => (
              <StaggerItem key={quest.id} variant="slideUp">
                <MedievalQuestCard
                  quest={quest}
                  onStartQuest={(quest) => console.log('Starting quest:', quest.id)}
                  onContinueQuest={(quest) => console.log('Continuing quest:', quest.id)}
                  showFullDetails={true}
                  delay={index * 0.15}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* Guild Services - Medieval Interface */}
        <section className="guild-services">
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
            🛡️ Guild Services
          </motion.h2>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                to: '/quests',
                icon: Scroll,
                title: 'Quest Board',
                description: 'Browse all available adventures and expeditions'
              },
              {
                to: '/leaderboard',
                icon: Trophy,
                title: 'Hall of Fame',
                description: 'View the greatest explorers and their achievements'
              },
              {
                to: '/progress',
                icon: BarChart3,
                title: 'Personal Chronicle',
                description: 'Track your journey and conquered territories'
              }
            ].map((service, index) => {
              const Icon = service.icon;
              return (
                <StaggerItem key={index} variant="slideUp">
                  <Link to={service.to}>
                    <MedievalCard
                      variant="parchment"
                      elevation="medium"
                      className="p-6 text-center h-full transition-all duration-300 hover:scale-102"
                    >
                      <motion.div
                        className="mb-6"
                        animate={{
                          scale: [1, 1.05, 1],
                          rotate: [0, 3, -3, 0]
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: index * 0.7
                        }}
                      >
                        <Icon
                          className="w-12 h-12 mx-auto"
                          style={{ color: `rgb(var(--accent-color))` }}
                        />
                      </motion.div>

                      <h3
                        className="text-xl font-bold mb-3"
                        style={{
                          color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)',
                          fontFamily: 'serif'
                        }}
                      >
                        {service.title}
                      </h3>

                      <p
                        className="opacity-80 leading-relaxed text-sm"
                        style={{
                          color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)',
                          fontStyle: 'italic'
                        }}
                      >
                        {service.description}
                      </p>

                      {/* Decorative medieval border */}
                      <motion.div
                        className="mt-6 h-px rounded-full mx-auto w-20"
                        style={{ background: `rgba(var(--accent-color), 0.4)` }}
                        animate={{
                          scaleX: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: index * 0.5
                        }}
                      />
                    </MedievalCard>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </section>
      </div>
    </PageTransition>
  );
}

export default Home;