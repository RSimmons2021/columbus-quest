import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { questService } from '../services/api';

function Home() {
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
    return <div className="loading">Loading Columbus Quest...</div>;
  }

  return (
    <div className="home">
      <section className="hero">
        <h1>🏛️ Welcome to Columbus Quest</h1>
        <p className="hero-subtitle">
          Discover Columbus one adventure at a time! Check in at local spots,
          earn points, and compete with fellow explorers.
        </p>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">{stats.userPoints}</span>
            <span className="stat-label">Your Points</span>
          </div>
          <div className="stat">
            <span className="stat-number">#{stats.userRank}</span>
            <span className="stat-label">Your Rank</span>
          </div>
          <div className="stat">
            <span className="stat-number">{stats.totalQuests}</span>
            <span className="stat-label">Available Quests</span>
          </div>
        </div>
      </section>

      <section className="featured-quests">
        <h2>🎯 Featured Quests</h2>
        <div className="quest-grid">
          {featuredQuests.map(quest => (
            <div key={quest.id} className="quest-card">
              <h3>{quest.name}</h3>
              <p>{quest.description}</p>
              <div className="quest-info">
                <span className="checkpoints">
                  📍 {quest.total_checkpoints} stops
                </span>
                <span className="points">
                  ⭐ {quest.points_per_checkpoint} pts each
                </span>
              </div>
              <div className="quest-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(quest.completed_checkpoints / quest.total_checkpoints) * 100}%`
                    }}
                  ></div>
                </div>
                <span className="progress-text">
                  {quest.completed_checkpoints}/{quest.total_checkpoints} completed
                </span>
              </div>
              <Link to={`/quests/${quest.id}`} className="btn btn-primary">
                {quest.completed_checkpoints > 0 ? 'Continue Quest' : 'Start Quest'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="quick-actions">
        <h2>🚀 Quick Actions</h2>
        <div className="action-grid">
          <Link to="/quests" className="action-card">
            <span className="action-icon">🗺️</span>
            <h3>Browse All Quests</h3>
            <p>Explore all available adventures in Columbus</p>
          </Link>
          <Link to="/leaderboard" className="action-card">
            <span className="action-icon">🏆</span>
            <h3>View Leaderboard</h3>
            <p>See how you rank against other explorers</p>
          </Link>
          <Link to="/progress" className="action-card">
            <span className="action-icon">📊</span>
            <h3>Track Progress</h3>
            <p>Review your completed quests and achievements</p>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;