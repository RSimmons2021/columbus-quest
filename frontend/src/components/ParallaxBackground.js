import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const ParallaxBackground = ({ children, intensity = 'medium' }) => {
  const { isDarkMode } = useTheme();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Different parallax speeds for layered effect
  const y1 = useTransform(scrollYProgress, [0, 1], ['-50%', '50%']);
  const y2 = useTransform(scrollYProgress, [0, 1], ['-30%', '30%']);
  const y3 = useTransform(scrollYProgress, [0, 1], ['-20%', '20%']);
  const y4 = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);

  // Smooth spring physics
  const springY1 = useSpring(y1, { stiffness: 50, damping: 30 });
  const springY2 = useSpring(y2, { stiffness: 60, damping: 25 });
  const springY3 = useSpring(y3, { stiffness: 70, damping: 20 });
  const springY4 = useSpring(y4, { stiffness: 80, damping: 15 });

  const intensityMultiplier = {
    light: 0.5,
    medium: 1,
    heavy: 1.5,
    extreme: 2
  }[intensity];

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden">
      {/* Base gradient background */}
      <motion.div
        className="fixed inset-0 -z-50"
        style={{
          background: isDarkMode
            ? 'radial-gradient(ellipse at top, rgba(0, 0, 0, 1) 0%, rgba(10, 10, 15, 1) 50%, rgba(0, 0, 0, 1) 100%)'
            : 'radial-gradient(ellipse at top, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 1) 50%, rgba(255, 255, 255, 1) 100%)'
        }}
        animate={{
          background: isDarkMode
            ? [
                'radial-gradient(ellipse at 20% 30%, rgba(0, 0, 0, 1) 0%, rgba(20, 5, 30, 0.8) 30%, rgba(0, 0, 0, 1) 100%)',
                'radial-gradient(ellipse at 80% 70%, rgba(0, 0, 0, 1) 0%, rgba(5, 20, 30, 0.8) 30%, rgba(0, 0, 0, 1) 100%)',
                'radial-gradient(ellipse at 20% 30%, rgba(0, 0, 0, 1) 0%, rgba(20, 5, 30, 0.8) 30%, rgba(0, 0, 0, 1) 100%)'
              ]
            : [
                'radial-gradient(ellipse at 20% 30%, rgba(255, 255, 255, 1) 0%, rgba(240, 245, 255, 0.8) 30%, rgba(255, 255, 255, 1) 100%)',
                'radial-gradient(ellipse at 80% 70%, rgba(255, 255, 255, 1) 0%, rgba(245, 240, 255, 0.8) 30%, rgba(255, 255, 255, 1) 100%)',
                'radial-gradient(ellipse at 20% 30%, rgba(255, 255, 255, 1) 0%, rgba(240, 245, 255, 0.8) 30%, rgba(255, 255, 255, 1) 100%)'
              ]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Layer 1 - Far background shapes */}
      <motion.div
        className="absolute inset-0 -z-40"
        style={{ y: springY1 }}
      >
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full opacity-10"
            style={{
              width: `${200 + (i * 50)}px`,
              height: `${200 + (i * 50)}px`,
              left: `${(i * 15) % 100}%`,
              top: `${(i * 25) % 100}%`,
              background: isDarkMode
                ? `radial-gradient(circle, rgba(0, 255, 255, 0.1), transparent 70%)`
                : `radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent 70%)`
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.05, 0.15, 0.05],
              rotate: [0, 360]
            }}
            transition={{
              duration: 30 + (i * 5),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 2
            }}
          />
        ))}
      </motion.div>

      {/* Layer 2 - Mid background geometric patterns */}
      <motion.div
        className="absolute inset-0 -z-30"
        style={{ y: springY2 }}
      >
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-20"
            style={{
              left: `${(i * 20) % 90}%`,
              top: `${(i * 30) % 80}%`,
              width: '100px',
              height: '100px'
            }}
            animate={{
              rotateX: [0, 360],
              rotateY: [0, -360],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 20 + (i * 3),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 1.5
            }}
          >
            <div
              className="w-full h-full border-2"
              style={{
                borderColor: isDarkMode ? 'rgba(0, 255, 255, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                borderRadius: i % 2 === 0 ? '50%' : '20%',
                transform: `rotate(${i * 45}deg)`
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Layer 3 - Near background particles */}
      <motion.div
        className="absolute inset-0 -z-20"
        style={{ y: springY3 }}
      >
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: isDarkMode
                ? i % 3 === 0 ? 'rgba(0, 255, 255, 0.6)' : i % 3 === 1 ? 'rgba(147, 51, 234, 0.6)' : 'rgba(255, 255, 255, 0.3)'
                : i % 3 === 0 ? 'rgba(59, 130, 246, 0.6)' : i % 3 === 1 ? 'rgba(147, 51, 234, 0.6)' : 'rgba(0, 0, 0, 0.3)'
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 5 + (i % 10),
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.1
            }}
          />
        ))}
      </motion.div>

      {/* Layer 4 - Foreground accent elements */}
      <motion.div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{ y: springY4 }}
      >
        {/* Floating orbs */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${(i * 16) % 90}%`,
              top: `${(i * 25) % 70}%`
            }}
            animate={{
              x: [0, 50, 0],
              y: [0, -30, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 15 + i,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.8
            }}
          >
            <div
              className="w-8 h-8 rounded-full opacity-40"
              style={{
                background: isDarkMode
                  ? `radial-gradient(circle, rgba(0, 255, 255, 0.4) 0%, rgba(147, 51, 234, 0.2) 70%, transparent 100%)`
                  : `radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(147, 51, 234, 0.2) 70%, transparent 100%)`,
                filter: 'blur(1px)'
              }}
            />
          </motion.div>
        ))}

        {/* Animated lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          {[...Array(4)].map((_, i) => (
            <motion.line
              key={i}
              x1={`${i * 25}%`}
              y1="0%"
              x2={`${i * 25 + 20}%`}
              y2="100%"
              stroke={isDarkMode ? 'rgba(0, 255, 255, 0.3)' : 'rgba(59, 130, 246, 0.3)'}
              strokeWidth="1"
              strokeDasharray="5,5"
              animate={{
                strokeDashoffset: [0, -10],
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 0.5
              }}
            />
          ))}
        </svg>
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Overlay gradient for depth */}
      <motion.div
        className="fixed inset-0 pointer-events-none -z-5"
        style={{
          background: isDarkMode
            ? 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0) 100%)'
            : 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0) 100%)'
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </div>
  );
};

export default ParallaxBackground;