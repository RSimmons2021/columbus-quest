import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './App.css';
import './styles/futuristic.css';
import { ThemeProvider } from './contexts/ThemeContext';
import MedievalNavbar from './components/MedievalNavbar';
import { DustParticles, FireflyParticles } from './components/MedievalParticles';
import { FloatingActionButton } from './components';
import { MapPin, Trophy, BarChart3, Users } from 'lucide-react';

// Components
import Home from './pages/Home';
import Quests from './pages/Quests';
import QuestDetail from './pages/QuestDetail';
import MapView from './pages/MapView';
import Progress from './pages/Progress';
import Leaderboard from './pages/Leaderboard';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/quests" element={<Quests />} />
        <Route path="/quests/:id" element={<QuestDetail />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const fabActions = [
    {
      icon: <MapPin className="w-5 h-5" />,
      label: 'Map View',
      color: 'green',
      onClick: () => window.location.href = '/map'
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      label: 'Leaderboard',
      color: 'yellow',
      onClick: () => window.location.href = '/leaderboard'
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'Progress',
      color: 'purple',
      onClick: () => window.location.href = '/progress'
    }
  ];

  return (
    <ThemeProvider>
      <Router>
        <div
          className="App min-h-screen relative"
          style={{
            background: 'linear-gradient(135deg, rgb(var(--bg-primary)) 0%, rgb(var(--bg-secondary)) 100%)'
          }}
        >
          {/* Medieval Particle Systems */}
          <DustParticles />
          <FireflyParticles />

          {/* Medieval Navigation */}
          <MedievalNavbar />

          {/* Main Content - Minimal top padding */}
          <main className="pt-16 relative z-10">
            <AnimatedRoutes />
          </main>

          {/* Medieval Floating Action Button */}
          <FloatingActionButton
            actions={fabActions}
            position="bottom-right"
            icon={<Users className="w-6 h-6" />}
            tooltip="Guild Actions"
          />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;