import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { questService } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import MedievalCard from '../components/MedievalCard';
import MedievalQuestCard from '../components/MedievalQuestCard';
import LoadingSpinner from '../components/LoadingSpinner';
import PageTransition, { StaggerContainer, StaggerItem } from '../components/PageTransition';
import { Scroll, Sword, Shield, Trophy } from 'lucide-react';

function Quests() {
  const { isDarkMode } = useTheme();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed

  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    try {
      const questsData = await questService.getQuests();
      setQuests(questsData);
    } catch (error) {
      console.error('Error loading quests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuests = quests.filter(quest => {
    if (filter === 'completed') return quest.is_completed;
    if (filter === 'active') return quest.completed_checkpoints > 0 && !quest.is_completed;
    return true; // all
  });

  const getQuestStatus = (quest) => {
    if (quest.is_completed) return { text: 'Completed', class: 'status-completed' };
    if (quest.completed_checkpoints > 0) return { text: 'In Progress', class: 'status-active' };
    return { text: 'Not Started', class: 'status-pending' };
  };

  const getButtonText = (quest) => {
    if (quest.is_completed) return 'View Quest';
    if (quest.completed_checkpoints > 0) return 'Continue Quest';
    return 'Start Quest';
  };

  if (loading) {
    return (
      <PageTransition variant="fade">
        <LoadingSpinner
          size="large"
          variant="quest"
          message="Loading Quest Board..."
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition variant="slideUp" duration={0.6}>
      <div className="quests-page container mx-auto px-6 py-4">
        {/* Medieval Quest Board Header */}
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
              Quest Board
            </h1>

            <motion.p
              className="text-lg font-semibold tracking-wide mb-6"
              style={{ color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)' }}
              animate={{
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              ~ Discover Epic Adventures Throughout Columbus ~
            </motion.p>
          </MedievalCard>
        </motion.div>

        {/* Medieval Filter Buttons */}
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
                { key: 'all', label: 'All Quests', icon: Scroll, count: quests.length },
                { key: 'active', label: 'In Progress', icon: Sword, count: quests.filter(q => q.completed_checkpoints > 0 && !q.is_completed).length },
                { key: 'completed', label: 'Completed', icon: Trophy, count: quests.filter(q => q.is_completed).length }
              ].map((filterOption, index) => {
                const Icon = filterOption.icon;
                const isActive = filter === filterOption.key;
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
                    onClick={() => setFilter(filterOption.key)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{filterOption.label}</span>
                    <span
                      className="px-2 py-1 rounded-full text-xs font-bold"
                      style={{
                        background: `rgba(var(--accent-color), 0.2)`,
                        color: `rgb(var(--accent-color))`
                      }}
                    >
                      {filterOption.count}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </MedievalCard>
        </motion.div>

        {filteredQuests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            <MedievalCard
              variant="parchment"
              elevation="medium"
              className="p-12 text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <span className="text-6xl mb-6 block">🎯</span>
              </motion.div>
              <h3
                className="text-2xl font-bold mb-4"
                style={{
                  color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)',
                  fontFamily: 'serif'
                }}
              >
                No Quests Found
              </h3>
              <p
                className="text-lg opacity-80"
                style={{
                  color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)',
                  fontStyle: 'italic'
                }}
              >
                {filter === 'completed' && 'Complete some quests to see them here!'}
                {filter === 'active' && 'Start a quest to see your progress here!'}
                {filter === 'all' && 'Check back later for new adventures!'}
              </p>
            </MedievalCard>
          </motion.div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuests.map((quest, index) => (
              <StaggerItem key={quest.id} variant="slideUp">
                <MedievalQuestCard
                  quest={quest}
                  onStartQuest={(quest) => window.location.href = `/quests/${quest.id}`}
                  onContinueQuest={(quest) => window.location.href = `/quests/${quest.id}`}
                  showFullDetails={true}
                  delay={index * 0.1}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </PageTransition>
  );
}

export default Quests;