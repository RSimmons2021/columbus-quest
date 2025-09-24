import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { questService } from '../services/api';

function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const data = await questService.getLeaderboard();
      setLeaderboardData(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankClass = (rank) => {
    switch (rank) {
      case 1: return 'rank-gold';
      case 2: return 'rank-silver';
      case 3: return 'rank-bronze';
      default: return 'rank-default';
    }
  };

  const getProgressLevel = (points) => {
    if (points >= 200) return { level: 'Master Explorer', color: '#8B5CF6', icon: '👑' };
    if (points >= 150) return { level: 'Expert Navigator', color: '#F59E0B', icon: '⭐' };
    if (points >= 100) return { level: 'Seasoned Adventurer', color: '#10B981', icon: '🎯' };
    if (points >= 50) return { level: 'Rising Explorer', color: '#3B82F6', icon: '🗺️' };
    if (points >= 20) return { level: 'Quest Beginner', color: '#6B7280', icon: '🌟' };
    return { level: 'New Explorer', color: '#9CA3AF', icon: '🚀' };
  };

  if (loading) {
    return <div className="loading">Loading leaderboard...</div>;
  }

  if (!leaderboardData) {
    return (
      <div className="error-state">
        <h2>Unable to load leaderboard</h2>
        <button onClick={loadLeaderboard} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <div className="page-header">
        <h1>🏆 Columbus Quest Leaderboard</h1>
        <p>See how you rank against fellow Columbus explorers!</p>
      </div>

      {/* Time Filter */}
      <div className="time-filters">
        <button
          className={`filter-btn ${timeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setTimeFilter('all')}
        >
          All Time
        </button>
        <button
          className={`filter-btn ${timeFilter === 'month' ? 'active' : ''}`}
          onClick={() => setTimeFilter('month')}
        >
          This Month
        </button>
        <button
          className={`filter-btn ${timeFilter === 'week' ? 'active' : ''}`}
          onClick={() => setTimeFilter('week')}
        >
          This Week
        </button>
      </div>

      {/* Top 3 Podium */}
      {leaderboardData.leaderboard.length >= 3 && (
        <div className="podium-section">
          <h3>🎖️ Top Champions</h3>
          <div className="podium">
            {/* 2nd Place */}
            <div className="podium-position second">
              <div className="podium-user">
                <div className="rank-badge rank-silver">🥈</div>
                <div className="user-avatar">
                  {leaderboardData.leaderboard[1].first_name?.[0] || leaderboardData.leaderboard[1].username[0]}
                </div>
                <h4>{leaderboardData.leaderboard[1].first_name || leaderboardData.leaderboard[1].username}</h4>
                <p className="points">{leaderboardData.leaderboard[1].total_points} pts</p>
                {getProgressLevel(leaderboardData.leaderboard[1].total_points) && (
                  <span className="level-badge" style={{
                    background: getProgressLevel(leaderboardData.leaderboard[1].total_points).color
                  }}>
                    {getProgressLevel(leaderboardData.leaderboard[1].total_points).icon}
                    {getProgressLevel(leaderboardData.leaderboard[1].total_points).level}
                  </span>
                )}
              </div>
              <div className="podium-base second-base">2nd</div>
            </div>

            {/* 1st Place */}
            <div className="podium-position first">
              <div className="podium-user">
                <div className="rank-badge rank-gold">🥇</div>
                <div className="user-avatar champion">
                  {leaderboardData.leaderboard[0].first_name?.[0] || leaderboardData.leaderboard[0].username[0]}
                </div>
                <h4>{leaderboardData.leaderboard[0].first_name || leaderboardData.leaderboard[0].username}</h4>
                <p className="points">{leaderboardData.leaderboard[0].total_points} pts</p>
                {getProgressLevel(leaderboardData.leaderboard[0].total_points) && (
                  <span className="level-badge champion-badge" style={{
                    background: getProgressLevel(leaderboardData.leaderboard[0].total_points).color
                  }}>
                    {getProgressLevel(leaderboardData.leaderboard[0].total_points).icon}
                    {getProgressLevel(leaderboardData.leaderboard[0].total_points).level}
                  </span>
                )}
              </div>
              <div className="podium-base first-base">1st</div>
            </div>

            {/* 3rd Place */}
            <div className="podium-position third">
              <div className="podium-user">
                <div className="rank-badge rank-bronze">🥉</div>
                <div className="user-avatar">
                  {leaderboardData.leaderboard[2].first_name?.[0] || leaderboardData.leaderboard[2].username[0]}
                </div>
                <h4>{leaderboardData.leaderboard[2].first_name || leaderboardData.leaderboard[2].username}</h4>
                <p className="points">{leaderboardData.leaderboard[2].total_points} pts</p>
                {getProgressLevel(leaderboardData.leaderboard[2].total_points) && (
                  <span className="level-badge" style={{
                    background: getProgressLevel(leaderboardData.leaderboard[2].total_points).color
                  }}>
                    {getProgressLevel(leaderboardData.leaderboard[2].total_points).icon}
                    {getProgressLevel(leaderboardData.leaderboard[2].total_points).level}
                  </span>
                )}
              </div>
              <div className="podium-base third-base">3rd</div>
            </div>
          </div>
        </div>
      )}

      {/* Full Rankings */}
      <div className="rankings-section">
        <h3>📊 Full Rankings</h3>
        <div className="rankings-list">
          {leaderboardData.leaderboard.map((user, index) => {
            const level = getProgressLevel(user.total_points);
            return (
              <div
                key={user.id}
                className={`ranking-item ${user.is_current_user ? 'current-user' : ''} ${getRankClass(user.rank)}`}
              >
                <div className="rank-number">
                  <span className="rank-display">{getRankIcon(user.rank)}</span>
                </div>

                <div className="user-info">
                  <div className="user-avatar-small">
                    {user.first_name?.[0] || user.username[0]}
                  </div>
                  <div className="user-details">
                    <h4 className="username">
                      {user.first_name || user.username}
                      {user.is_current_user && <span className="you-badge">You</span>}
                    </h4>
                    <p className="user-level">
                      <span className="level-icon">{level.icon}</span>
                      {level.level}
                    </p>
                  </div>
                </div>

                <div className="user-stats">
                  <div className="stat">
                    <span className="stat-value">{user.total_points}</span>
                    <span className="stat-label">Points</span>
                  </div>
                </div>

                <div className="rank-change">
                  {index < 3 && <span className="trending">🔥</span>}
                  {user.is_current_user && (
                    <Link to="/quests" className="btn btn-sm btn-primary">
                      Explore More
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current User Position (if not in top rankings) */}
      {leaderboardData.current_user_position && (
        <div className="current-user-section">
          <h3>🎯 Your Position</h3>
          <div className="current-user-card">
            <div className="rank-info">
              <span className="current-rank">#{leaderboardData.current_user_position.rank}</span>
              <span className="rank-label">Your Rank</span>
            </div>
            <div className="user-progress">
              <h4>{leaderboardData.current_user_position.first_name || leaderboardData.current_user_position.username}</h4>
              <p>{leaderboardData.current_user_position.total_points} points</p>
              {getProgressLevel(leaderboardData.current_user_position.total_points) && (
                <span className="level-badge" style={{
                  background: getProgressLevel(leaderboardData.current_user_position.total_points).color
                }}>
                  {getProgressLevel(leaderboardData.current_user_position.total_points).icon}
                  {getProgressLevel(leaderboardData.current_user_position.total_points).level}
                </span>
              )}
            </div>
            <div className="motivation">
              <Link to="/quests" className="btn btn-primary">
                Climb Higher! 🚀
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Level System Info */}
      <div className="level-system">
        <h3>🎖️ Explorer Levels</h3>
        <div className="level-grid">
          {[
            { level: 'Master Explorer', points: '200+', icon: '👑', color: '#8B5CF6' },
            { level: 'Expert Navigator', points: '150+', icon: '⭐', color: '#F59E0B' },
            { level: 'Seasoned Adventurer', points: '100+', icon: '🎯', color: '#10B981' },
            { level: 'Rising Explorer', points: '50+', icon: '🗺️', color: '#3B82F6' },
            { level: 'Quest Beginner', points: '20+', icon: '🌟', color: '#6B7280' },
            { level: 'New Explorer', points: '0+', icon: '🚀', color: '#9CA3AF' }
          ].map((levelInfo, index) => (
            <div key={index} className="level-card">
              <span className="level-icon-large" style={{ color: levelInfo.color }}>
                {levelInfo.icon}
              </span>
              <h5>{levelInfo.level}</h5>
              <p>{levelInfo.points} points</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="leaderboard-actions">
        <Link to="/quests" className="action-btn">
          🗺️ Start New Quest
        </Link>
        <Link to="/map" className="action-btn">
          📍 Explore Map
        </Link>
        <Link to="/progress" className="action-btn">
          📊 View Progress
        </Link>
      </div>
    </div>
  );
}

export default Leaderboard;