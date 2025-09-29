import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Home, Map, Trophy, BarChart3, Scroll, Moon, Sun, Shield, BookOpen } from 'lucide-react';
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
    { path: '/', label: 'Home', icon: Home },
    { path: '/quests', label: 'Quest Board', icon: Scroll },
    { path: '/news', label: 'Chronicles', icon: BookOpen },
    { path: '/map', label: 'Map', icon: Map },
    { path: '/progress', label: 'Progress', icon: BarChart3 },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy }
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
        {/* Decorative border patterns */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(218, 165, 32, 0.8), transparent)`,
            backgroundSize: '100% 100%'
          }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(218, 165, 32, 0.4), transparent)`,
          }}
        />

        {/* Decorative corner flourishes */}
        <div className="absolute top-2 left-4 w-3 h-3 opacity-40">
          <div
            className="w-full h-px rounded"
            style={{ background: `rgb(var(--accent-color))` }}
          />
          <div
            className="w-px h-full rounded absolute top-0 left-0"
            style={{ background: `rgb(var(--accent-color))` }}
          />
        </div>
        <div className="absolute top-2 right-4 w-3 h-3 opacity-40">
          <div
            className="w-full h-px rounded"
            style={{ background: `rgb(var(--accent-color))` }}
          />
          <div
            className="w-px h-full rounded absolute top-0 right-0"
            style={{ background: `rgb(var(--accent-color))` }}
          />
        </div>

        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between w-full max-w-6xl mx-auto">

            {/* Left - Guild Logo */}
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.02 }}
            >
              <Link to="/" className="flex items-center space-x-3">
                <motion.div
                  className="relative"
                  animate={{
                    rotateY: [0, 3, -3, 0]
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-bold border-2"
                    style={{
                      background: isDarkMode
                        ? 'linear-gradient(135deg, rgba(60, 50, 35, 0.9), rgba(45, 35, 25, 0.95))'
                        : 'linear-gradient(135deg, rgba(250, 245, 235, 0.95), rgba(240, 230, 210, 0.9))',
                      borderColor: `rgba(var(--accent-color), 0.7)`,
                      boxShadow: `0 0 20px rgba(var(--accent-color), 0.3)`
                    }}
                  >
                    🏛️
                  </div>
                </motion.div>

                <div>
                  <motion.h1
                    className="text-xl font-bold"
                    style={{
                      color: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)',
                      textShadow: `0 1px 3px rgba(var(--accent-color), 0.3)`,
                      fontFamily: 'serif'
                    }}
                  >
                    Columbus Quest
                  </motion.h1>
                  <motion.p
                    className="text-xs font-medium opacity-70"
                    style={{
                      color: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)',
                      fontStyle: 'italic'
                    }}
                  >
                    Guild Hall
                  </motion.p>
                </div>
              </Link>
            </motion.div>

            {/* Center - Navigation Links */}
            <div className="hidden md:flex items-center justify-center flex-1 mx-8">
              <div className="flex items-center space-x-1 bg-black/10 dark:bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-black/10 dark:border-white/10">
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
                        className={`relative px-4 py-2 rounded-full transition-all duration-300 flex items-center space-x-2 font-medium text-sm ${
                          isActive
                            ? isDarkMode ? 'text-yellow-200' : 'text-amber-800'
                            : isDarkMode
                              ? 'text-yellow-100 hover:text-yellow-200'
                              : 'text-amber-700 hover:text-amber-800'
                        }`}
                      >
                        {/* Active background */}
                        {isActive && (
                          <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{
                              background: isDarkMode
                                ? 'linear-gradient(135deg, rgba(218, 165, 32, 0.25), rgba(139, 69, 69, 0.15))'
                                : 'linear-gradient(135deg, rgba(218, 165, 32, 0.3), rgba(139, 69, 69, 0.2))',
                              boxShadow: `inset 0 1px 0 rgba(var(--accent-color), 0.4), 0 0 15px rgba(var(--accent-color), 0.2)`
                            }}
                            layoutId="activeNavTab"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}

                        {/* Hover effect */}
                        <motion.div
                          className="absolute inset-0 rounded-full opacity-0"
                          style={{
                            background: isDarkMode
                              ? 'radial-gradient(circle, rgba(218, 165, 32, 0.1), transparent 70%)'
                              : 'radial-gradient(circle, rgba(218, 165, 32, 0.15), transparent 70%)'
                          }}
                          whileHover={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />

                        <Icon className="w-4 h-4 relative z-10" />
                        <span className="relative z-10 hidden lg:inline">{item.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right - Theme Controls */}
            <div className="flex items-center space-x-3">
              {/* Day/Night Toggle */}
              <motion.button
                className="p-3 rounded-full border-2 transition-all duration-300"
                style={{
                  background: isDarkMode
                    ? 'linear-gradient(135deg, rgba(60, 50, 35, 0.9), rgba(45, 35, 25, 0.95))'
                    : 'linear-gradient(135deg, rgba(250, 245, 235, 0.95), rgba(240, 230, 210, 0.9))',
                  borderColor: `rgba(var(--accent-color), 0.5)`,
                  boxShadow: `0 0 15px rgba(var(--accent-color), 0.1)`
                }}
                onClick={toggleDarkMode}
                whileHover={{ scale: 1.05, boxShadow: `0 0 20px rgba(var(--accent-color), 0.2)` }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{ rotate: isDarkMode ? 0 : 180 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  {isDarkMode ? (
                    <Moon className="w-5 h-5" style={{ color: `rgb(var(--accent-color))` }} />
                  ) : (
                    <Sun className="w-5 h-5" style={{ color: `rgb(var(--accent-color))` }} />
                  )}
                </motion.div>
              </motion.button>

              {/* Heraldry Color Picker */}
              <motion.button
                className="p-3 rounded-full border-2 transition-all duration-300"
                style={{
                  background: isDarkMode
                    ? 'linear-gradient(135deg, rgba(60, 50, 35, 0.9), rgba(45, 35, 25, 0.95))'
                    : 'linear-gradient(135deg, rgba(250, 245, 235, 0.95), rgba(240, 230, 210, 0.9))',
                  borderColor: `rgba(var(--accent-color), 0.5)`,
                  boxShadow: `0 0 15px rgba(var(--accent-color), 0.1)`
                }}
                onClick={() => setShowThemePanel(!showThemePanel)}
                whileHover={{ scale: 1.05, boxShadow: `0 0 20px rgba(var(--accent-color), 0.2)` }}
                whileTap={{ scale: 0.95 }}
              >
                <Shield className="w-5 h-5" style={{ color: `rgb(var(--accent-color))` }} />
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