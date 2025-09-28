import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Home, Map, Trophy, BarChart3, Gamepad2, Moon, Sun, Palette } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const FuturisticNavbar = () => {
  const { isDarkMode, toggleDarkMode, accentColor, changeAccentColor } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showThemePanel, setShowThemePanel] = useState(false);
  const location = useLocation();
  const { scrollY } = useScroll();

  const navOpacity = useTransform(scrollY, [0, 100], [0.95, 0.8]);
  const navBlur = useTransform(scrollY, [0, 100], [10, 20]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/quests', label: 'Quests', icon: Gamepad2 },
    { path: '/map', label: 'Map', icon: Map },
    { path: '/progress', label: 'Progress', icon: BarChart3 },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy }
  ];

  const accentColors = [
    { name: 'cyan', color: 'rgb(0, 255, 255)' },
    { name: 'purple', color: 'rgb(147, 51, 234)' },
    { name: 'blue', color: 'rgb(59, 130, 246)' },
    { name: 'green', color: 'rgb(16, 185, 129)' },
    { name: 'pink', color: 'rgb(236, 72, 153)' },
    { name: 'orange', color: 'rgb(249, 115, 22)' }
  ];

  const logoVariants = {
    rest: { scale: 1, rotateY: 0 },
    hover: {
      scale: 1.1,
      rotateY: 180,
      transition: {
        duration: 0.6,
        ease: 'easeInOut'
      }
    }
  };

  const hologramVariants = {
    animate: {
      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  };

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          opacity: navOpacity,
          backdropFilter: `blur(${navBlur}px)`,
        }}
        animate={{
          y: isScrolled ? 0 : 0,
          background: isDarkMode
            ? isScrolled
              ? 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(10, 10, 15, 0.9) 100%)'
              : 'linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(10, 10, 15, 0.8) 100%)'
            : isScrolled
              ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.9) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(248, 250, 252, 0.8) 100%)'
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Holographic border */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: isDarkMode
              ? 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.5), rgba(147, 51, 234, 0.5), rgba(0, 255, 255, 0.5), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5), rgba(59, 130, 246, 0.5), transparent)',
            backgroundSize: '200% 100%'
          }}
          variants={hologramVariants}
          animate="animate"
        />

        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-3"
              variants={logoVariants}
              whileHover="hover"
            >
              <Link to="/" className="flex items-center space-x-3">
                <motion.div
                  className="relative"
                  animate={{
                    rotateY: [0, 360],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl font-bold"
                    style={{
                      background: isDarkMode
                        ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(147, 51, 234, 0.2))'
                        : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))',
                      border: `1px solid ${isDarkMode ? 'rgba(0, 255, 255, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                    }}
                  >
                    🏛️
                  </div>

                  {/* Orbital rings */}
                  <motion.div
                    className="absolute inset-0 rounded-lg border opacity-20"
                    style={{
                      borderColor: isDarkMode ? 'rgba(0, 255, 255, 0.5)' : 'rgba(59, 130, 246, 0.5)'
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  />
                </motion.div>

                <div>
                  <motion.h1
                    className="text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent"
                    style={{
                      backgroundImage: isDarkMode
                        ? 'linear-gradient(45deg, rgb(0, 255, 255), rgb(147, 51, 234))'
                        : 'linear-gradient(45deg, rgb(59, 130, 246), rgb(147, 51, 234))'
                    }}
                  >
                    Columbus Quest
                  </motion.h1>
                  <motion.p
                    className="text-xs opacity-60"
                    style={{
                      color: isDarkMode ? 'rgb(180, 180, 200)' : 'rgb(100, 100, 120)'
                    }}
                  >
                    Future City Explorer
                  </motion.p>
                </div>
              </Link>
            </motion.div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <motion.div
                    key={item.path}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to={item.path}
                      className={`relative px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                        isActive
                          ? 'text-white'
                          : isDarkMode
                            ? 'text-gray-300 hover:text-white'
                            : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {/* Active background */}
                      {isActive && (
                        <motion.div
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background: isDarkMode
                              ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(147, 51, 234, 0.2))'
                              : 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))',
                            border: `1px solid ${isDarkMode ? 'rgba(0, 255, 255, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                          }}
                          layoutId="activeTab"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}

                      {/* Hover glow */}
                      <motion.div
                        className="absolute inset-0 rounded-xl opacity-0"
                        style={{
                          background: isDarkMode
                            ? 'radial-gradient(circle, rgba(0, 255, 255, 0.1), transparent 70%)'
                            : 'radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent 70%)'
                        }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />

                      <Icon className="w-5 h-5 relative z-10" />
                      <span className="text-sm font-medium relative z-10">{item.label}</span>

                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          className="absolute -bottom-1 left-1/2 w-1 h-1 rounded-full"
                          style={{
                            backgroundColor: isDarkMode ? 'rgb(0, 255, 255)' : 'rgb(59, 130, 246)',
                            transform: 'translateX(-50%)'
                          }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Theme Controls */}
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <motion.button
                className="p-2 rounded-xl backdrop-blur-sm border transition-all duration-300"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
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
                    <Moon className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-orange-500" />
                  )}
                </motion.div>
              </motion.button>

              {/* Accent Color Picker */}
              <motion.button
                className="p-2 rounded-xl backdrop-blur-sm border transition-all duration-300"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
                }}
                onClick={() => setShowThemePanel(!showThemePanel)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Palette className="w-5 h-5" style={{ color: `rgb(var(--accent-color))` }} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full opacity-30"
            style={{
              backgroundColor: isDarkMode ? 'rgb(0, 255, 255)' : 'rgb(59, 130, 246)',
              left: `${10 + (i * 15)}%`,
              top: '20px'
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeInOut'
            }}
          />
        ))}
      </motion.nav>

      {/* Theme Panel */}
      {showThemePanel && (
        <motion.div
          className="fixed top-20 right-6 z-50 p-4 rounded-2xl backdrop-blur-md border"
          style={{
            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
          }}
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
        >
          <h3 className="text-sm font-semibold mb-3" style={{ color: isDarkMode ? 'white' : 'black' }}>
            Accent Color
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {accentColors.map((color) => (
              <motion.button
                key={color.name}
                className="w-8 h-8 rounded-lg border-2 transition-all duration-200"
                style={{
                  backgroundColor: color.color,
                  borderColor: accentColor === color.name
                    ? isDarkMode ? 'white' : 'black'
                    : 'transparent'
                }}
                onClick={() => changeAccentColor(color.name)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </>
  );
};

export default FuturisticNavbar;