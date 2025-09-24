import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { questService } from '../services/api';

function Quests() {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed

  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    try {
      const questsData = await questService.getQuests();
      setQuests(questsData);
    } catch (error) {
      console.error('Error loading quests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuests = quests.filter(quest => {
    if (filter === 'completed') return quest.is_completed;
    if (filter === 'active') return quest.completed_checkpoints > 0 && !quest.is_completed;
    return true; // all
  });

  const getQuestStatus = (quest) => {
    if (quest.is_completed) return { text: 'Completed', class: 'status-completed' };
    if (quest.completed_checkpoints > 0) return { text: 'In Progress', class: 'status-active' };
    return { text: 'Not Started', class: 'status-pending' };
  };

  const getButtonText = (quest) => {
    if (quest.is_completed) return 'View Quest';
    if (quest.completed_checkpoints > 0) return 'Continue Quest';
    return 'Start Quest';
  };

  if (loading) {
    return <div className="loading">Loading quests...</div>;
  }

  return (
    <div className="quests-page">
      <div className="page-header">
        <h1>🗺️ All Quests</h1>
        <p>Discover amazing adventures throughout Columbus</p>
      </div>

      <div className="quest-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Quests ({quests.length})
        </button>
        <button
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          In Progress ({quests.filter(q => q.completed_checkpoints > 0 && !q.is_completed).length})
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({quests.filter(q => q.is_completed).length})
        </button>
      </div>

      {filteredQuests.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🎯</span>
          <h3>No quests found</h3>
          <p>
            {filter === 'completed' && 'Complete some quests to see them here!'}
            {filter === 'active' && 'Start a quest to see your progress here!'}
            {filter === 'all' && 'Check back later for new adventures!'}
          </p>
        </div>
      ) : (
        <div className="quests-grid">
          {filteredQuests.map(quest => {
            const status = getQuestStatus(quest);
            const progressPercent = (quest.completed_checkpoints / quest.total_checkpoints) * 100;

            return (
              <div key={quest.id} className="quest-card">
                <div className="quest-header">
                  <h3>{quest.name}</h3>
                  <span className={`quest-status ${status.class}`}>
                    {status.text}
                  </span>
                </div>

                <p className="quest-description">{quest.description}</p>

                <div className="quest-stats">
                  <div className="stat">
                    <span className="stat-icon">📍</span>
                    <span>{quest.total_checkpoints} checkpoints</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">⭐</span>
                    <span>{quest.points_per_checkpoint} pts each</span>
                  </div>
                  <div className="stat">
                    <span className="stat-icon">🏆</span>
                    <span>{quest.total_checkpoints * quest.points_per_checkpoint} total pts</span>
                  </div>
                </div>

                <div className="quest-progress">
                  <div className="progress-header">
                    <span>Progress</span>
                    <span>{quest.completed_checkpoints}/{quest.total_checkpoints}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <div className="progress-percent">{Math.round(progressPercent)}% complete</div>
                </div>

                <div className="quest-actions">
                  <Link
                    to={`/quests/${quest.id}`}
                    className="btn btn-primary"
                  >
                    {getButtonText(quest)}
                  </Link>
                  {quest.completed_checkpoints > 0 && (
                    <div className="checkpoint-list">
                      <summary>View checkpoints</summary>
                      <details>
                        {quest.checkpoints.map(checkpoint => (
                          <div key={checkpoint.id} className="checkpoint-item">
                            <span className={checkpoint.visited ? 'completed' : 'pending'}>
                              {checkpoint.visited ? '✅' : '⏳'} {checkpoint.name}
                            </span>
                          </div>
                        ))}
                      </details>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Quests;