import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { questService } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import MedievalCard from '../components/MedievalCard';
import LoadingSpinner from '../components/LoadingSpinner';
import PageTransition, { StaggerContainer, StaggerItem } from '../components/PageTransition';
import { MapPin, Scroll, Trophy, X } from 'lucide-react';

function MapView() {
  const { isDarkMode } = useTheme();
  const [quests, setQuests] = useState([]);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      const questsData = await questService.getQuests();
      setQuests(questsData);
    } catch (error) {
      console.error('Error loading map data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Columbus downtown area coordinates (simplified grid)
  const getCheckpointPosition = (checkpoint) => {
    // Convert lat/lng to percentage positions on our "map"
    // Columbus downtown rough bounds: 39.95-39.97 lat, -83.01 to -82.99 lng
    const latRange = [39.95, 39.97];
    const lngRange = [-83.01, -82.99];

    const x = ((checkpoint.longitude - lngRange[0]) / (lngRange[1] - lngRange[0])) * 100;
    const y = ((latRange[1] - checkpoint.latitude) / (latRange[1] - latRange[0])) * 100;

    // Clamp to 10-90% to keep markers visible
    return {
      left: Math.max(10, Math.min(90, x)) + '%',
      top: Math.max(10, Math.min(90, y)) + '%'
    };
  };

  const getQuestColor = (questId) => {
    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
    return colors[questId % colors.length];
  };

  if (loading) {
    return (
      <PageTransition variant="fade">
        <LoadingSpinner
          size="large"
          variant="quest"
          message="Loading Ancient Maps..."
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition variant="slideUp" duration={0.6}>
      <div className="map-view container mx-auto px-6 py-4">
        {/* Medieval Map Header */}
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
              <span className="text-4xl md:text-5xl">🗺️</span>
            </motion.div>

            <h1
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{
                color: `rgb(var(--accent-color))`,
                fontFamily: 'serif',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
              }}
            >
              Ancient Map
            </h1>

            <motion.p
              className="text-lg font-semibold tracking-wide mb-6"
              style={{ color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)' }}
              animate={{
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              ~ Navigate the Realm of Columbus ~
            </motion.p>
          </MedievalCard>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Display */}
          <div className="lg:col-span-3">
            <MedievalCard
              variant="parchment"
              elevation="high"
              className="p-6 relative"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-lg" style={{
                background: isDarkMode
                  ? 'linear-gradient(135deg, rgba(45, 35, 25, 0.9) 0%, rgba(35, 25, 15, 0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(240, 230, 210, 0.9) 0%, rgba(230, 215, 190, 0.95) 100%)'
              }}>
                {/* Ancient-style grid */}
                <div className="absolute inset-0">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={`h-${i}`} className="absolute w-full h-px opacity-20" style={{
                      top: `${i * 10}%`,
                      background: `rgb(var(--accent-color))`
                    }}></div>
                  ))}
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={`v-${i}`} className="absolute h-full w-px opacity-20" style={{
                      left: `${i * 10}%`,
                      background: `rgb(var(--accent-color))`
                    }}></div>
                  ))}
                </div>

                {/* Medieval-style map labels */}
                <div className="absolute top-[10%] left-[20%] text-xs font-bold opacity-60" style={{
                  color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)',
                  fontFamily: 'serif'
                }}>Downtown</div>
                <div className="absolute top-[30%] left-[60%] text-xs font-bold opacity-60" style={{
                  color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)',
                  fontFamily: 'serif'
                }}>Short North</div>
                <div className="absolute top-[70%] left-[30%] text-xs font-bold opacity-60" style={{
                  color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)',
                  fontFamily: 'serif'
                }}>German Village</div>
                <div className="absolute top-[50%] left-[80%] text-xs font-bold opacity-60" style={{
                  color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)',
                  fontFamily: 'serif'
                }}>Arena District</div>

                {/* Quest checkpoints - Medieval style */}
                {quests.map(quest =>
                  quest.checkpoints.map(checkpoint => (
                    <motion.div
                      key={`${quest.id}-${checkpoint.id}`}
                      className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-10"
                      style={getCheckpointPosition(checkpoint)}
                      onClick={() => setSelectedQuest({ quest, checkpoint })}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      animate={{
                        scale: checkpoint.visited ? [1, 1.1, 1] : [1, 1.05, 1]
                      }}
                      transition={{
                        duration: checkpoint.visited ? 2 : 3,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold shadow-lg"
                        style={{
                          backgroundColor: checkpoint.visited ? 'rgba(34, 197, 94, 0.9)' : getQuestColor(quest.id),
                          borderColor: checkpoint.visited ? 'rgba(34, 197, 94, 1)' : 'rgba(255, 255, 255, 0.8)',
                          boxShadow: `0 0 10px ${checkpoint.visited ? 'rgba(34, 197, 94, 0.5)' : getQuestColor(quest.id)}`
                        }}
                        title={`${checkpoint.name} (${quest.name})`}
                      >
                        {checkpoint.visited ? '✓' : '📍'}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </MedievalCard>
          </div>

          {/* Quest Legend - Medieval Style */}
          <div className="lg:col-span-1">
            <MedievalCard
              variant="scroll"
              elevation="medium"
              className="p-6 h-full"
            >
              <h3
                className="text-xl font-bold mb-6 text-center"
                style={{
                  color: `rgb(var(--accent-color))`,
                  fontFamily: 'serif'
                }}
              >
                🎯 Active Quests
              </h3>

              <StaggerContainer className="space-y-4">
                {quests.map((quest, index) => {
                  const completedCount = quest.checkpoints.filter(c => c.visited).length;
                  return (
                    <StaggerItem key={quest.id} variant="slideUp">
                      <motion.div
                        className="flex items-center gap-3 p-3 rounded-lg border"
                        style={{
                          background: isDarkMode
                            ? 'rgba(60, 50, 35, 0.3)'
                            : 'rgba(40, 30, 20, 0.05)',
                          borderColor: isDarkMode
                            ? 'rgba(120, 100, 70, 0.3)'
                            : 'rgba(100, 80, 60, 0.2)'
                        }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div
                          className="w-4 h-4 rounded-full border-2"
                          style={{
                            backgroundColor: getQuestColor(quest.id),
                            borderColor: 'rgba(255, 255, 255, 0.5)'
                          }}
                        ></div>
                        <div className="flex-1">
                          <div
                            className="font-semibold text-sm"
                            style={{
                              color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)',
                              fontFamily: 'serif'
                            }}
                          >
                            {quest.name}
                          </div>
                          <div
                            className="text-xs opacity-80"
                            style={{
                              color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)',
                              fontStyle: 'italic'
                            }}
                          >
                            {completedCount}/{quest.checkpoints.length} completed
                          </div>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            </MedievalCard>
          </div>
        </div>

        {/* Selected checkpoint details - Medieval Modal */}
        {selectedQuest && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedQuest(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="max-w-md w-full"
            >
              <MedievalCard
                variant="scroll"
                elevation="high"
                className="p-6 relative"
              >
                <motion.button
                  className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center border-2"
                  style={{
                    background: isDarkMode
                      ? 'rgba(60, 50, 35, 0.9)'
                      : 'rgba(40, 30, 20, 0.9)',
                    borderColor: `rgba(var(--accent-color), 0.6)`,
                    color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(240, 230, 210)'
                  }}
                  onClick={() => setSelectedQuest(null)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4" />
                </motion.button>

                <div className="text-center mb-6">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  >
                    <MapPin
                      className="w-12 h-12 mx-auto mb-3"
                      style={{ color: `rgb(var(--accent-color))` }}
                    />
                  </motion.div>
                  <h3
                    className="text-2xl font-bold mb-2"
                    style={{
                      color: `rgb(var(--accent-color))`,
                      fontFamily: 'serif'
                    }}
                  >
                    {selectedQuest.checkpoint.name}
                  </h3>
                  <p
                    className="text-sm font-semibold opacity-80"
                    style={{
                      color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)',
                      fontStyle: 'italic'
                    }}
                  >
                    Part of: {selectedQuest.quest.name}
                  </p>
                </div>

                <p
                  className="text-sm mb-6 leading-relaxed"
                  style={{
                    color: isDarkMode ? 'rgb(220, 205, 180)' : 'rgb(60, 50, 30)',
                    fontStyle: 'italic'
                  }}
                >
                  {selectedQuest.checkpoint.description}
                </p>

                <div className="mb-6 text-center">
                  {selectedQuest.checkpoint.visited ? (
                    <motion.div
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2"
                      style={{
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))',
                        borderColor: 'rgba(34, 197, 94, 0.6)',
                        color: 'rgb(34, 197, 94)'
                      }}
                      animate={{
                        scale: [1, 1.05, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    >
                      <Trophy className="w-4 h-4" />
                      <span className="font-bold">Visited</span>
                    </motion.div>
                  ) : (
                    <div
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2"
                      style={{
                        background: isDarkMode
                          ? 'rgba(120, 100, 70, 0.2)'
                          : 'rgba(100, 80, 60, 0.2)',
                        borderColor: isDarkMode
                          ? 'rgba(120, 100, 70, 0.6)'
                          : 'rgba(100, 80, 60, 0.6)',
                        color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)'
                      }}
                    >
                      <Scroll className="w-4 h-4" />
                      <span className="font-bold">Not visited yet</span>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <Link to={`/quests/${selectedQuest.quest.id}`}>
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
                      View Quest Details
                    </motion.button>
                  </Link>
                </div>
              </MedievalCard>
            </motion.div>
          </motion.div>
        )}

        {/* Map instructions - Medieval Style */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <MedievalCard
            variant="parchment"
            elevation="medium"
            className="p-6"
          >
            <h3
              className="text-xl font-bold mb-4 text-center"
              style={{
                color: `rgb(var(--accent-color))`,
                fontFamily: 'serif'
              }}
            >
              🧭 Map Legend & Instructions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {[
                { icon: '📍', text: 'Unvisited checkpoints', color: 'default' },
                { icon: '✓', text: 'Completed checkpoints', color: 'green' },
                { icon: '🎯', text: 'Click markers for details', color: 'accent' },
                { icon: '🗺️', text: 'Colors represent different quests', color: 'accent' }
              ].map((instruction, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                  style={{
                    background: isDarkMode
                      ? 'rgba(60, 50, 35, 0.3)'
                      : 'rgba(40, 30, 20, 0.05)',
                    borderColor: isDarkMode
                      ? 'rgba(120, 100, 70, 0.3)'
                      : 'rgba(100, 80, 60, 0.2)'
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 + index * 0.1 }}
                >
                  <span className="text-lg">{instruction.icon}</span>
                  <span
                    className="font-medium"
                    style={{
                      color: instruction.color === 'green'
                        ? 'rgb(34, 197, 94)'
                        : instruction.color === 'accent'
                          ? `rgb(var(--accent-color))`
                          : isDarkMode ? 'rgb(220, 205, 180)' : 'rgb(60, 50, 30)'
                    }}
                  >
                    {instruction.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </MedievalCard>
        </motion.div>
      </div>
    </PageTransition>
  );
}

export default MapView;