import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { questService } from '../services/api';

function MapView() {
  const [quests, setQuests] = useState([]);
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      const questsData = await questService.getQuests();
      setQuests(questsData);
    } catch (error) {
      console.error('Error loading map data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Columbus downtown area coordinates (simplified grid)
  const getCheckpointPosition = (checkpoint) => {
    // Convert lat/lng to percentage positions on our "map"
    // Columbus downtown rough bounds: 39.95-39.97 lat, -83.01 to -82.99 lng
    const latRange = [39.95, 39.97];
    const lngRange = [-83.01, -82.99];

    const x = ((checkpoint.longitude - lngRange[0]) / (lngRange[1] - lngRange[0])) * 100;
    const y = ((latRange[1] - checkpoint.latitude) / (latRange[1] - latRange[0])) * 100;

    // Clamp to 10-90% to keep markers visible
    return {
      left: Math.max(10, Math.min(90, x)) + '%',
      top: Math.max(10, Math.min(90, y)) + '%'
    };
  };

  const getQuestColor = (questId) => {
    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];
    return colors[questId % colors.length];
  };

  if (loading) {
    return <div className="loading">Loading map...</div>;
  }

  return (
    <div className="map-view">
      <div className="page-header">
        <h1>🗺️ Columbus Quest Map</h1>
        <p>Explore quest locations throughout downtown Columbus</p>
      </div>

      <div className="map-container">
        <div className="map-background">
          {/* Simple Columbus "map" background */}
          <div className="map-grid">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="grid-line horizontal" style={{ top: `${i * 10}%` }}></div>
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="grid-line vertical" style={{ left: `${i * 10}%` }}></div>
            ))}
          </div>

          {/* Map labels */}
          <div className="map-label" style={{ top: '10%', left: '20%' }}>Downtown</div>
          <div className="map-label" style={{ top: '30%', left: '60%' }}>Short North</div>
          <div className="map-label" style={{ top: '70%', left: '30%' }}>German Village</div>
          <div className="map-label" style={{ top: '50%', left: '80%' }}>Arena District</div>

          {/* Quest checkpoints */}
          {quests.map(quest =>
            quest.checkpoints.map(checkpoint => (
              <div
                key={`${quest.id}-${checkpoint.id}`}
                className={`map-marker ${checkpoint.visited ? 'visited' : 'unvisited'}`}
                style={{
                  ...getCheckpointPosition(checkpoint),
                  backgroundColor: getQuestColor(quest.id)
                }}
                onClick={() => setSelectedQuest({ quest, checkpoint })}
                title={`${checkpoint.name} (${quest.name})`}
              >
                <span className="marker-icon">
                  {checkpoint.visited ? '✅' : '📍'}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Quest legend */}
        <div className="map-legend">
          <h3>🎯 Active Quests</h3>
          {quests.map(quest => {
            const completedCount = quest.checkpoints.filter(c => c.visited).length;
            return (
              <div key={quest.id} className="legend-item">
                <div
                  className="legend-color"
                  style={{ backgroundColor: getQuestColor(quest.id) }}
                ></div>
                <div className="legend-info">
                  <span className="legend-name">{quest.name}</span>
                  <span className="legend-progress">
                    {completedCount}/{quest.checkpoints.length} completed
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected checkpoint details */}
      {selectedQuest && (
        <div className="checkpoint-details">
          <div className="details-card">
            <button
              className="close-btn"
              onClick={() => setSelectedQuest(null)}
            >
              ×
            </button>

            <h3>📍 {selectedQuest.checkpoint.name}</h3>
            <p className="quest-name">Part of: {selectedQuest.quest.name}</p>
            <p className="checkpoint-description">
              {selectedQuest.checkpoint.description}
            </p>

            <div className="checkpoint-status">
              {selectedQuest.checkpoint.visited ? (
                <span className="status-badge completed">✅ Visited</span>
              ) : (
                <span className="status-badge pending">⏳ Not visited yet</span>
              )}
            </div>

            <div className="checkpoint-actions">
              <Link
                to={`/quests/${selectedQuest.quest.id}`}
                className="btn btn-primary"
              >
                View Quest Details
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Map instructions */}
      <div className="map-instructions">
        <h3>🧭 How to use the map</h3>
        <ul>
          <li>📍 <strong>Red markers</strong> = Unvisited checkpoints</li>
          <li>✅ <strong>Green markers</strong> = Completed checkpoints</li>
          <li>🎯 <strong>Click markers</strong> to see checkpoint details</li>
          <li>🗺️ <strong>Colors</strong> represent different quests</li>
        </ul>
      </div>
    </div>
  );
}

export default MapView;