import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Home, Map, Trophy, BarChart3, Scroll, Moon, Sun, Shield } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const MedievalNavbar = () => {
  const { isDarkMode, toggleDarkMode, accentColor, changeAccentColor } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showThemePanel, setShowThemePanel] = useState(false);
  const location = useLocation();
  const { scrollY } = useScroll();

  const navOpacity = useTransform(scrollY, [0, 100], [0.95, 0.98]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'Guild Hall', icon: Home },
    { path: '/quests', label: 'Quest Board', icon: Scroll },
    { path: '/map', label: 'Map', icon: Map },
    { path: '/progress', label: 'Chronicle', icon: BarChart3 },
    { path: '/leaderboard', label: 'Hall of Fame', icon: Trophy }
  ];

  const accentColors = [
    { name: 'gold', color: 'rgb(218, 165, 32)', label: 'Gold' },
    { name: 'bronze', color: 'rgb(205, 127, 50)', label: 'Bronze' },
    { name: 'silver', color: 'rgb(192, 192, 192)', label: 'Silver' },
    { name: 'emerald', color: 'rgb(80, 130, 80)', label: 'Emerald' },
    { name: 'ruby', color: 'rgb(139, 69, 69)', label: 'Ruby' },
    { name: 'sapphire', color: 'rgb(65, 105, 125)', label: 'Sapphire' }
  ];

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          opacity: navOpacity,
          background: isDarkMode
            ? isScrolled
              ? 'linear-gradient(135deg, rgba(35, 25, 15, 0.95) 0%, rgba(45, 35, 25, 0.98) 100%)'
              : 'linear-gradient(135deg, rgba(35, 25, 15, 0.9) 0%, rgba(45, 35, 25, 0.95) 100%)'
            : isScrolled
              ? 'linear-gradient(135deg, rgba(240, 230, 210, 0.95) 0%, rgba(230, 215, 190, 0.98) 100%)'
              : 'linear-gradient(135deg, rgba(240, 230, 210, 0.9) 0%, rgba(230, 215, 190, 0.95) 100%)',
          backdropFilter: 'blur(8px)',
          borderBottom: `2px solid ${isDarkMode ? 'rgba(120, 100, 70, 0.3)' : 'rgba(100, 80, 60, 0.3)'}`,
          boxShadow: isDarkMode
            ? '0 2px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(218, 165, 32, 0.1)'
            : '0 2px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(218, 165, 32, 0.2)'
        }}
        animate={{
          y: isScrolled ? 0 : 0
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Decorative border pattern */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(218, 165, 32, 0.6), transparent)`,
            backgroundSize: '100% 100%'
          }}
        />

        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Guild Logo */}
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
            >
              <Link to="/" className="flex items-center space-x-3">
                <motion.div
                  className="relative"
                  animate={{
                    rotateY: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold border-2"
                    style={{
                      background: isDarkMode
                        ? 'linear-gradient(135deg, rgba(60, 50, 35, 0.8), rgba(45, 35, 25, 0.9))'
                        : 'linear-gradient(135deg, rgba(250, 245, 235, 0.9), rgba(240, 230, 210, 0.8))',
                      borderColor: `rgba(var(--accent-color), 0.6)`,
                      boxShadow: `0 0 15px rgba(var(--accent-color), 0.2)`
                    }}
                  >
                    🏛️
                  </div>

                  {/* Guild crest overlay */}
                  <div
                    className="absolute inset-0 rounded-lg border opacity-40"
                    style={{
                      borderColor: `rgba(var(--accent-color), 0.3)`
                    }}
                  />
                </motion.div>

                <div>
                  <motion.h1
                    className="text-xl font-bold"
                    style={{
                      color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)',
                      textShadow: `0 1px 3px rgba(var(--accent-color), 0.3)`
                    }}
                  >
                    Columbus Quest
                  </motion.h1>
                  <motion.p
                    className="text-xs font-medium opacity-70"
                    style={{
                      color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)'
                    }}
                  >
                    Explorer's Guild
                  </motion.p>
                </div>
              </Link>
            </motion.div>

            {/* Navigation Links - Medieval style */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Link
                      to={item.path}
                      className={`relative px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 font-medium ${
                        isActive
                          ? isDarkMode ? 'text-yellow-200' : 'text-amber-800'
                          : isDarkMode
                            ? 'text-yellow-100 hover:text-yellow-200'
                            : 'text-amber-700 hover:text-amber-800'
                      }`}
                    >
                      {/* Active background - looks like illuminated manuscript */}
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-lg border-2"
                          style={{
                            background: isDarkMode
                              ? 'linear-gradient(135deg, rgba(218, 165, 32, 0.15), rgba(139, 69, 69, 0.1))'
                              : 'linear-gradient(135deg, rgba(218, 165, 32, 0.2), rgba(139, 69, 69, 0.15))',
                            borderColor: `rgba(var(--accent-color), 0.4)`,
                            boxShadow: `inset 0 1px 0 rgba(var(--accent-color), 0.3)`
                          }}
                          layoutId="activeTab"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}

                      {/* Hover effect */}
                      <motion.div
                        className="absolute inset-0 rounded-lg opacity-0"
                        style={{
                          background: isDarkMode
                            ? 'radial-gradient(circle, rgba(218, 165, 32, 0.1), transparent 70%)'
                            : 'radial-gradient(circle, rgba(218, 165, 32, 0.15), transparent 70%)'
                        }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />

                      <Icon className="w-4 h-4 relative z-10" />
                      <span className="text-sm relative z-10">{item.label}</span>

                      {/* Active indicator - medieval style */}
                      {isActive && (
                        <motion.div
                          className="absolute -bottom-1 left-1/2 w-2 h-1 rounded-full"
                          style={{
                            backgroundColor: `rgb(var(--accent-color))`,
                            transform: 'translateX(-50%)'
                          }}
                          initial={{ scale: 0, width: 0 }}
                          animate={{ scale: 1, width: 8 }}
                          exit={{ scale: 0, width: 0 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Theme Controls */}
            <div className="flex items-center space-x-3">
              {/* Day/Night Toggle */}
              <motion.button
                className="p-2 rounded-lg border-2 transition-all duration-300"
                style={{
                  background: isDarkMode
                    ? 'linear-gradient(135deg, rgba(60, 50, 35, 0.8), rgba(45, 35, 25, 0.9))'
                    : 'linear-gradient(135deg, rgba(250, 245, 235, 0.9), rgba(240, 230, 210, 0.8))',
                  borderColor: `rgba(var(--accent-color), 0.4)`
                }}
                onClick={toggleDarkMode}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: isDarkMode ? 0 : 180 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  {isDarkMode ? (
                    <Moon className="w-4 h-4" style={{ color: `rgb(var(--accent-color))` }} />
                  ) : (
                    <Sun className="w-4 h-4" style={{ color: `rgb(var(--accent-color))` }} />
                  )}
                </motion.div>
              </motion.button>

              {/* Heraldry Color Picker */}
              <motion.button
                className="p-2 rounded-lg border-2 transition-all duration-300"
                style={{
                  background: isDarkMode
                    ? 'linear-gradient(135deg, rgba(60, 50, 35, 0.8), rgba(45, 35, 25, 0.9))'
                    : 'linear-gradient(135deg, rgba(250, 245, 235, 0.9), rgba(240, 230, 210, 0.8))',
                  borderColor: `rgba(var(--accent-color), 0.4)`
                }}
                onClick={() => setShowThemePanel(!showThemePanel)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Shield className="w-4 h-4" style={{ color: `rgb(var(--accent-color))` }} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Heraldry Panel */}
      {showThemePanel && (
        <motion.div
          className="fixed top-20 right-6 z-50 p-4 rounded-lg border-2"
          style={{
            background: isDarkMode
              ? 'linear-gradient(135deg, rgba(35, 25, 15, 0.95), rgba(45, 35, 25, 0.98))'
              : 'linear-gradient(135deg, rgba(240, 230, 210, 0.95), rgba(230, 215, 190, 0.98))',
            borderColor: `rgba(var(--accent-color), 0.4)`,
            backdropFilter: 'blur(10px)',
            boxShadow: isDarkMode
              ? '0 8px 32px rgba(0, 0, 0, 0.4)'
              : '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
        >
          <h3
            className="text-sm font-bold mb-3"
            style={{ color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)' }}
          >
            Choose Your Heraldry
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {accentColors.map((color) => (
              <motion.button
                key={color.name}
                className="w-8 h-8 rounded border-2 transition-all duration-200"
                style={{
                  backgroundColor: color.color,
                  borderColor: accentColor === color.name
                    ? isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)'
                    : 'transparent',
                  boxShadow: accentColor === color.name
                    ? `0 0 8px ${color.color}`
                    : 'none'
                }}
                onClick={() => changeAccentColor(color.name)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title={color.label}
              />
            ))}
          </div>
        </motion.div>
      )}
    </>
  );
};

export default MedievalNavbar;