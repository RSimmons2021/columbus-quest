import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Components
import Home from './pages/Home';
import Quests from './pages/Quests';
import QuestDetail from './pages/QuestDetail';
import MapView from './pages/MapView';
import Progress from './pages/Progress';
import Leaderboard from './pages/Leaderboard';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-brand">
            <Link to="/">🏛️ Columbus Quest</Link>
          </div>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/quests">Quests</Link>
            <Link to="/map">Map</Link>
            <Link to="/progress">Progress</Link>
            <Link to="/leaderboard">Leaderboard</Link>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quests" element={<Quests />} />
            <Route path="/quests/:id" element={<QuestDetail />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;