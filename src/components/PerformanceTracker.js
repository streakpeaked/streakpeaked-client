import React, { useState, useEffect } from 'react';
import './PerformanceTracker.css';

const PerformanceTracker = ({ user, scores, onBackHome, onBackProfile }) => {
  const [filter, setFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [filteredScores, setFilteredScores] = useState([]);
  const [stats, setStats] = useState({
    maxStreak: 0,
    maxStreakDate: null,
    maxStreakTime: 0,
    averageStreak: 0,
    averageTime: 0,
    totalAttempts: 0,
    improvementTrend: 0
  });

  const examTypes = [
    { id: 'all', name: 'All Exams' },
    { id: 'ssc-cgl', name: 'SSC CGL' },
    { id: 'neet', name: 'NEET' },
    { id: 'rbi-grade-b', name: 'RBI Grade B' }
  ];

  const timeFilters = [
    { id: 'all', name: 'All Time' },
    { id: 'week', name: 'Last Week' },
    { id: 'month', name: 'Last Month' },
    { id: '3months', name: 'Last 3 Months' }
  ];

  useEffect(() => {
    filterScores();
  }, [scores, filter, timeFilter]);

  useEffect(() => {
    calculateStats();
  }, [filteredScores]);

  const filterScores = () => {
    let filtered = [...scores];

    // Filter by exam type
    if (filter !== 'all') {
      filtered = filtered.filter(score => score.examType === filter);
    }

    // Filter by time period
    if (timeFilter !== 'all') {
      const now = new Date();
      let cutoffDate;
      
      switch (timeFilter) {
        case 'week':
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '3months':
          cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(0);
      }
      
      filtered = filtered.filter(score => new Date(score.timestamp) >= cutoffDate);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    setFilteredScores(filtered);
  };

  const calculateStats = () => {
    if (filteredScores.length === 0) {
      setStats({
        maxStreak: 0,
        maxStreakDate: null,
        maxStreakTime: 0,
        averageStreak: 0,
        averageTime: 0,
        totalAttempts: 0,
        improvementTrend: 0
      });
      return;
    }

    const streaks = filteredScores.map(s => s.streakScore || 0);
    const times = filteredScores.map(s => s.totalTime || 0);
    
    const maxStreak = Math.max(...streaks);
    const maxStreakIndex = streaks.indexOf(maxStreak);
    const maxStreakScore = filteredScores[maxStreakIndex];
    
    const averageStreak = Math.round(streaks.reduce((sum, s) => sum + s, 0) / streaks.length);
    const averageTime = Math.round(times.reduce((sum, t) => sum + t, 0) / times.length);
    
    // Calculate improvement trend (last 5 vs previous 5)
    let improvementTrend = 0;
    if (filteredScores.length >= 10) {
      const recent5 = streaks.slice(0, 5);
      const previous5 = streaks.slice(5, 10);
      const recentAvg = recent5.reduce((sum, s) => sum + s, 0) / 5;
      const previousAvg = previous5.reduce((sum, s) => sum + s, 0) / 5;
      improvementTrend = ((recentAvg - previousAvg) / previousAvg) * 100;
    }

    setStats({
      maxStreak,
      maxStreakDate: maxStreakScore ? maxStreakScore.timestamp : null,
      maxStreakTime: maxStreakScore ? maxStreakScore.totalTime : 0,
      averageStreak,
      averageTime,
      totalAttempts: filteredScores.length,
      improvementTrend
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 15) return '#4CAF50';
    if (score >= 10) return '#FF9800';
    if (score >= 5) return '#FFC107';
    return '#f44336';
  };

  const generateChartData = () => {
    if (filteredScores.length === 0) return [];
    
    const sortedScores = [...filteredScores].reverse(); // Oldest first for chart
    return sortedScores.map((score, index) => ({
      x: index,
      streak: score.streakScore || 0,
      time: Math.round((score.totalTime || 0) / 60), // Convert to minutes
      date: formatDate(score.timestamp)
    }));
  };

  const chartData = generateChartData();

  return (
    <div className="performance-tracker">
      <div className="tracker-header">
        <div className="header-nav">
          <button className="back-btn" onClick={onBackHome}>
            ← Home
          </button>
          <button className="back-btn" onClick={onBackProfile}>
            ← Profile
          </button>
        </div>
        <h1>Performance Tracker</h1>
      </div>

      <div className="tracker-container">
        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Exam Type:</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              {examTypes.map(exam => (
                <option key={exam.id} value={exam.id}>{exam.name}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Time Period:</label>
            <select 
              value={timeFilter} 
              onChange={(e) => setTimeFilter(e.target.value)}
              className="filter-select"
            >
              {timeFilters.map(time => (
                <option key={time.id} value={time.id}>{time.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card highlight">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <div className="stat-number">{stats.maxStreak}</div>
              <div className="stat-label">Maximum Streak</div>
              {stats.maxStreakDate && (
                <div className="stat-detail">
                  {formatDate(stats.maxStreakDate)}
                  <br />
                  Time: {formatTime(stats.maxStreakTime)}
                </div>
              )}
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-number">{stats.averageStreak}</div>
              <div className="stat-label">Average Streak</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-number">{formatTime(stats.averageTime)}</div>
              <div className="stat-label">Average Time</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-number">{stats.totalAttempts}</div>
              <div className="stat-label">Total Attempts</div>
            </div>
          </div>
          
          {stats.improvementTrend !== 0 && (
            <div className="stat-card">
              <div className="stat-icon">
                {stats.improvementTrend > 0 ? '📈' : '📉'}
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {stats.improvementTrend > 0 ? '+' : ''}
                  {stats.improvementTrend.toFixed(1)}%
                </div>
                <div className="stat-label">Improvement Trend</div>
              </div>
            </div>
          )}
        </div>

        {/* Chart Section */}
        {chartData.length > 0 && (
          <div className="chart-section">
            <h3>Performance Over Time</h3>
            <div className="chart-container">
              <svg className="performance-chart" viewBox="0 0 800 400">
                <defs>
                  <linearGradient id="streakGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#4CAF50', stopOpacity: 0.8}} />
                    <stop offset="100%" style={{stopColor: '#4CAF50', stopOpacity: 0.1}} />
                  </linearGradient>
                  <linearGradient id="timeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#FF9800', stopOpacity: 0.8}} />
                    <stop offset="100%" style={{stopColor: '#FF9800', stopOpacity: 0.1}} />
                  </linearGradient>
                </defs>
                
                {/* Grid lines */}
                <g className="grid">
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <line
                      key={i}
                      x1="50"
                      y1={50 + i * 60}
                      x2="750"
                      y2={50 + i * 60}
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="1"
                    />
                  ))}
                </g>
                
                {/* Streak line */}
                <polyline
                  points={chartData.map((point, index) => 
                    `${50 + (index * (700 / Math.max(chartData.length - 1, 1)))},${350 - (point.streak * 15)}`
                  ).join(' ')}
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="3"
                />
                
                {/* Data points */}
                {chartData.map((point, index) => (
                  <circle
                    key={index}
                    cx={50 + (index * (700 / Math.max(chartData.length - 1, 1)))}
                    cy={350 - (point.streak * 15)}
                    r="4"
                    fill="#4CAF50"
                    className="data-point"
                  >
                    <title>{`Date: ${point.date}, Streak: ${point.streak}, Time: ${point.time}min`}</title>
                  </circle>
                ))}
                
                {/* Y-axis labels */}
                <text x="25" y="30" fill="white" fontSize="12" textAnchor="middle">20</text>
                <text x="25" y="90" fill="white" fontSize="12" textAnchor="middle">15</text>
                <text x="25" y="150" fill="white" fontSize="12" textAnchor="middle">10</text>
                <text x="25" y="210" fill="white" fontSize="12" textAnchor="middle">5</text>
                <text x="25" y="270" fill="white" fontSize="12" textAnchor="middle">0</text>
                
                {/* Chart title */}
                <text x="400" y="30" fill="white" fontSize="16" textAnchor="middle" fontWeight="bold">
                  Streak Performance Timeline
                </text>
              </svg>
            </div>
          </div>
        )}

        {/* Detailed History */}
        <div className="history-section">
          <h3>Detailed History</h3>
          <div className="history-list">
            {filteredScores.length === 0 ? (
              <div className="no-data">
                <p>No test attempts found for the selected filters.</p>
              </div>
            ) : (
              filteredScores.map((score, index) => (
                <div key={index} className="history-item">
                  <div className="history-date">
                    {formatDate(score.timestamp)}
                  </div>
                  <div className="history-details">
                    <div className="history-exam">
                      {examTypes.find(exam => exam.id === score.examType)?.name || 'Unknown Exam'}
                    </div>
                    <div className="history-stats">
                      <span 
                        className="history-streak"
                        style={{ color: getScoreColor(score.streakScore) }}
                      >
                        Streak: {score.streakScore || 0}
                      </span>
                      <span className="history-time">
                        Time: {formatTime(score.totalTime || 0)}
                      </span>
                      <span className="history-accuracy">
                        Accuracy: {score.accuracy || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTracker;