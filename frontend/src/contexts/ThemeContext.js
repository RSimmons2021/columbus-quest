import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : true; // Default to dark mode for medieval atmosphere
  });

  const [accentColor, setAccentColor] = useState(() => {
    const saved = localStorage.getItem('accentColor');
    return saved || 'gold';
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    document.documentElement.classList.toggle('dark', isDarkMode);

    // Apply CSS variables for medieval theme
    const root = document.documentElement;
    if (isDarkMode) {
      root.style.setProperty('--bg-primary', '20, 15, 10'); // Dark brown
      root.style.setProperty('--bg-secondary', '35, 25, 15'); // Warm dark brown
      root.style.setProperty('--bg-tertiary', '45, 35, 25'); // Lighter brown
      root.style.setProperty('--text-primary', '245, 240, 220'); // Warm cream
      root.style.setProperty('--text-secondary', '200, 185, 160'); // Muted cream
      root.style.setProperty('--parchment-bg', '60, 50, 35, 0.8'); // Parchment overlay
      root.style.setProperty('--parchment-border', '120, 100, 70, 0.6'); // Aged border
    } else {
      root.style.setProperty('--bg-primary', '250, 245, 235'); // Warm cream
      root.style.setProperty('--bg-secondary', '240, 230, 210'); // Aged paper
      root.style.setProperty('--bg-tertiary', '230, 215, 190'); // Darker parchment
      root.style.setProperty('--text-primary', '40, 30, 20'); // Dark brown
      root.style.setProperty('--text-secondary', '80, 65, 45'); // Medium brown
      root.style.setProperty('--parchment-bg', '40, 30, 20, 0.05'); // Light overlay
      root.style.setProperty('--parchment-border', '100, 80, 60, 0.3'); // Light border
    }

    // Set medieval accent colors
    const accentColors = {
      gold: '218, 165, 32', // Medieval gold
      bronze: '205, 127, 50', // Bronze/copper
      silver: '192, 192, 192', // Silver
      emerald: '80, 130, 80', // Forest green
      ruby: '139, 69, 69', // Deep red
      sapphire: '65, 105, 125' // Steel blue
    };

    root.style.setProperty('--accent-color', accentColors[accentColor] || accentColors.cyan);
  }, [isDarkMode, accentColor]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const changeAccentColor = (color) => {
    setAccentColor(color);
    localStorage.setItem('accentColor', color);
  };

  const value = {
    isDarkMode,
    toggleDarkMode,
    accentColor,
    changeAccentColor,
    theme: {
      colors: {
        primary: isDarkMode ? 'rgb(20, 15, 10)' : 'rgb(250, 245, 235)',
        secondary: isDarkMode ? 'rgb(35, 25, 15)' : 'rgb(240, 230, 210)',
        tertiary: isDarkMode ? 'rgb(45, 35, 25)' : 'rgb(230, 215, 190)',
        text: {
          primary: isDarkMode ? 'rgb(245, 240, 220)' : 'rgb(40, 30, 20)',
          secondary: isDarkMode ? 'rgb(200, 185, 160)' : 'rgb(80, 65, 45)'
        },
        parchment: {
          bg: isDarkMode ? 'rgba(60, 50, 35, 0.8)' : 'rgba(40, 30, 20, 0.05)',
          border: isDarkMode ? 'rgba(120, 100, 70, 0.6)' : 'rgba(100, 80, 60, 0.3)'
        }
      }
    }
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};