import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { questService } from '../services/api';

function QuestDetail() {
  const { id } = useParams();
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadQuest();
  }, [id]);

  const loadQuest = async () => {
    try {
      const questData = await questService.getQuest(id);
      setQuest(questData);
    } catch (error) {
      console.error('Error loading quest:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (checkpoint) => {
    if (checkpoint.visited) {
      alert('You have already checked in here!');
      return;
    }

    setCheckingIn(true);
    setSelectedCheckpoint(checkpoint);

    try {
      const result = await questService.checkIn(quest.id, checkpoint.id);

      // Update the quest data to reflect the check-in
      setQuest(prevQuest => ({
        ...prevQuest,
        completed_checkpoints: prevQuest.completed_checkpoints + 1,
        is_completed: result.quest_completed,
        checkpoints: prevQuest.checkpoints.map(cp =>
          cp.id === checkpoint.id ? { ...cp, visited: true } : cp
        )
      }));

      setShowSuccess({
        message: result.message,
        points: result.points_earned,
        questCompleted: result.quest_completed,
        totalPoints: result.total_points
      });

    } catch (error) {
      console.error('Check-in failed:', error);
      alert('Check-in failed. Please try again.');
    } finally {
      setCheckingIn(false);
      setSelectedCheckpoint(null);
    }
  };

  const getProgressPercent = () => {
    return (quest.completed_checkpoints / quest.total_checkpoints) * 100;
  };

  const getNextCheckpoint = () => {
    return quest.checkpoints.find(cp => !cp.visited);
  };

  if (loading) {
    return <div className="loading">Loading quest details...</div>;
  }

  if (!quest) {
    return (
      <div className="error-state">
        <h2>Quest not found</h2>
        <Link to="/quests" className="btn btn-primary">Back to Quests</Link>
      </div>
    );
  }

  const progressPercent = getProgressPercent();
  const nextCheckpoint = getNextCheckpoint();

  return (
    <div className="quest-detail">
      {/* Success Modal */}
      {showSuccess && (
        <div className="success-modal">
          <div className="success-card">
            <div className="success-header">
              <span className="success-icon">🎉</span>
              <h3>Check-in Successful!</h3>
            </div>

            <div className="success-content">
              <p>{showSuccess.message}</p>
              <div className="points-earned">
                <span className="points">+{showSuccess.points} points</span>
                <span className="total">Total: {showSuccess.totalPoints} points</span>
              </div>

              {showSuccess.questCompleted && (
                <div className="quest-completed">
                  <span className="completion-icon">🏆</span>
                  <strong>Quest Completed!</strong>
                  <p>Congratulations on finishing "{quest.name}"</p>
                </div>
              )}
            </div>

            <button
              className="btn btn-primary"
              onClick={() => setShowSuccess(false)}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Quest Header */}
      <div className="quest-header-detail">
        <div className="breadcrumb">
          <Link to="/quests">← Back to Quests</Link>
        </div>

        <div className="quest-title-section">
          <h1>{quest.name}</h1>
          <div className="quest-status-badges">
            {quest.is_completed ? (
              <span className="status-badge completed">✅ Completed</span>
            ) : quest.completed_checkpoints > 0 ? (
              <span className="status-badge in-progress">🔄 In Progress</span>
            ) : (
              <span className="status-badge not-started">⭐ Ready to Start</span>
            )}
          </div>
        </div>

        <p className="quest-description-detail">{quest.description}</p>

        <div className="quest-stats-detail">
          <div className="stat-item">
            <span className="stat-number">{quest.completed_checkpoints}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{quest.total_checkpoints}</span>
            <span className="stat-label">Total Stops</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{quest.points_per_checkpoint}</span>
            <span className="stat-label">Points Each</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{quest.total_checkpoints * quest.points_per_checkpoint}</span>
            <span className="stat-label">Max Points</span>
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-header">
            <span>Overall Progress</span>
            <span>{Math.round(progressPercent)}% Complete</span>
          </div>
          <div className="progress-bar-large">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Next Checkpoint Highlight */}
      {nextCheckpoint && !quest.is_completed && (
        <div className="next-checkpoint">
          <h3>🎯 Next Stop</h3>
          <div className="next-checkpoint-card">
            <div className="checkpoint-info">
              <h4>{nextCheckpoint.name}</h4>
              <p>{nextCheckpoint.description}</p>
              <span className="checkpoint-order">Stop #{nextCheckpoint.order_number}</span>
            </div>
            <button
              className="btn btn-primary btn-large"
              onClick={() => handleCheckIn(nextCheckpoint)}
              disabled={checkingIn}
            >
              {checkingIn && selectedCheckpoint?.id === nextCheckpoint.id
                ? 'Checking In...'
                : 'Check In Here'
              }
            </button>
          </div>
        </div>
      )}

      {/* All Checkpoints */}
      <div className="checkpoints-section">
        <h3>📍 All Quest Locations</h3>
        <div className="checkpoints-list">
          {quest.checkpoints
            .sort((a, b) => a.order_number - b.order_number)
            .map((checkpoint, index) => (
            <div
              key={checkpoint.id}
              className={`checkpoint-card ${checkpoint.visited ? 'visited' : 'unvisited'}`}
            >
              <div className="checkpoint-number">
                {checkpoint.visited ? '✅' : index + 1}
              </div>

              <div className="checkpoint-content">
                <h4>{checkpoint.name}</h4>
                <p>{checkpoint.description}</p>

                <div className="checkpoint-meta">
                  <span className="order">Stop #{checkpoint.order_number}</span>
                  <span className="points">+{quest.points_per_checkpoint} points</span>
                </div>
              </div>

              <div className="checkpoint-action">
                {checkpoint.visited ? (
                  <div className="visited-badge">
                    <span className="visited-icon">✅</span>
                    <span>Visited</span>
                  </div>
                ) : (
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleCheckIn(checkpoint)}
                    disabled={checkingIn}
                  >
                    {checkingIn && selectedCheckpoint?.id === checkpoint.id
                      ? 'Checking In...'
                      : 'Check In'
                    }
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completion Section */}
      {quest.is_completed && (
        <div className="completion-section">
          <div className="completion-card">
            <span className="completion-icon">🏆</span>
            <h3>Quest Completed!</h3>
            <p>Congratulations! You've successfully completed "{quest.name}"</p>
            <div className="completion-stats">
              <span>Total Points Earned: {quest.total_checkpoints * quest.points_per_checkpoint}</span>
            </div>
            <div className="completion-actions">
              <Link to="/quests" className="btn btn-primary">
                Find Another Quest
              </Link>
              <Link to="/leaderboard" className="btn btn-secondary">
                View Leaderboard
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <Link to="/map" className="action-link">
          🗺️ View on Map
        </Link>
        <Link to="/quests" className="action-link">
          📋 All Quests
        </Link>
        <Link to="/leaderboard" className="action-link">
          🏆 Leaderboard
        </Link>
      </div>
    </div>
  );
}

export default QuestDetail;