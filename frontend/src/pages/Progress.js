import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { questService } from '../services/api';

function Progress() {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuests: 0,
    completedQuests: 0,
    totalPoints: 0,
    totalCheckpoints: 0,
    completedCheckpoints: 0
  });

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const questsData = await questService.getQuests();
      setQuests(questsData);

      // Calculate stats
      const totalQuests = questsData.length;
      const completedQuests = questsData.filter(q => q.is_completed).length;
      const totalCheckpoints = questsData.reduce((sum, q) => sum + q.total_checkpoints, 0);
      const completedCheckpoints = questsData.reduce((sum, q) => sum + q.completed_checkpoints, 0);
      const totalPoints = questsData.reduce((sum, q) => sum + (q.completed_checkpoints * q.points_per_checkpoint), 0);

      setStats({
        totalQuests,
        completedQuests,
        totalPoints,
        totalCheckpoints,
        completedCheckpoints
      });
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading your progress...</div>;
  }

  const completionRate = stats.totalQuests > 0 ? (stats.completedQuests / stats.totalQuests) * 100 : 0;
  const checkpointRate = stats.totalCheckpoints > 0 ? (stats.completedCheckpoints / stats.totalCheckpoints) * 100 : 0;

  return (
    <div className="progress-page">
      <div className="page-header">
        <h1>📊 Your Columbus Quest Progress</h1>
        <p>Track your exploration journey through Columbus</p>
      </div>

      {/* Overall Stats */}
      <div className="progress-overview">
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <span className="stat-number">{stats.completedQuests}</span>
            <span className="stat-label">Quests Completed</span>
            <div className="stat-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${completionRate}%` }}></div>
              </div>
              <span className="progress-text">{Math.round(completionRate)}% of all quests</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <span className="stat-number">{stats.totalPoints}</span>
            <span className="stat-label">Total Points</span>
            <div className="stat-subtext">Keep exploring to earn more!</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📍</div>
          <div className="stat-content">
            <span className="stat-number">{stats.completedCheckpoints}</span>
            <span className="stat-label">Locations Visited</span>
            <div className="stat-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${checkpointRate}%` }}></div>
              </div>
              <span className="progress-text">{Math.round(checkpointRate)}% of all locations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quest Progress */}
      <div className="quest-progress-section">
        <h3>🗺️ Quest by Quest Progress</h3>
        <div className="quest-progress-list">
          {quests.map(quest => {
            const progressPercent = (quest.completed_checkpoints / quest.total_checkpoints) * 100;
            return (
              <div key={quest.id} className="quest-progress-item">
                <div className="quest-info">
                  <h4>{quest.name}</h4>
                  <p>{quest.description}</p>
                </div>

                <div className="progress-details">
                  <div className="progress-stats">
                    <span className="checkpoints">{quest.completed_checkpoints}/{quest.total_checkpoints} stops</span>
                    <span className="points">{quest.completed_checkpoints * quest.points_per_checkpoint} pts earned</span>
                  </div>

                  <div className="progress-bar-large">
                    <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
                  </div>

                  <div className="progress-actions">
                    {quest.is_completed ? (
                      <span className="completion-badge">✅ Completed!</span>
                    ) : quest.completed_checkpoints > 0 ? (
                      <Link to={`/quests/${quest.id}`} className="btn btn-primary btn-sm">
                        Continue Quest
                      </Link>
                    ) : (
                      <Link to={`/quests/${quest.id}`} className="btn btn-secondary btn-sm">
                        Start Quest
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievement-style Progress */}
      <div className="achievements-section">
        <h3>🎖️ Achievements</h3>
        <div className="achievements-grid">
          <div className={`achievement ${stats.completedQuests >= 1 ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">🎯</div>
            <h5>First Quest</h5>
            <p>Complete your first quest</p>
          </div>

          <div className={`achievement ${stats.completedCheckpoints >= 5 ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">🗺️</div>
            <h5>Explorer</h5>
            <p>Visit 5 different locations</p>
          </div>

          <div className={`achievement ${stats.totalPoints >= 100 ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">💯</div>
            <h5>Century Club</h5>
            <p>Earn 100 points</p>
          </div>

          <div className={`achievement ${stats.completedQuests >= 3 ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">🏆</div>
            <h5>Quest Master</h5>
            <p>Complete 3 quests</p>
          </div>

          <div className={`achievement ${completionRate >= 100 ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">👑</div>
            <h5>Columbus Champion</h5>
            <p>Complete all available quests</p>
          </div>

          <div className={`achievement ${stats.completedCheckpoints >= 10 ? 'unlocked' : 'locked'}`}>
            <div className="achievement-icon">🌟</div>
            <h5>Local Legend</h5>
            <p>Visit 10 different locations</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="progress-actions">
        <Link to="/quests" className="action-btn">
          🗺️ Continue Exploring
        </Link>
        <Link to="/leaderboard" className="action-btn">
          🏆 View Leaderboard
        </Link>
        <Link to="/map" className="action-btn">
          📍 Explore Map
        </Link>
      </div>
    </div>
  );
}

export default Progress;