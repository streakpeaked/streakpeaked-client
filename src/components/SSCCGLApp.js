import React, { useState, useEffect, useRef } from 'react';
import './SSCCGLApp.css';
import ChatSidebar from './ChatSidebar';
import { saveUserScore } from './firebaseConfig';

const SSCCGLApp = ({ user, onBackToHome, questions }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [totalTime, setTotalTime] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [questionsAttempted, setQuestionsAttempted] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [difficulty, setDifficulty] = useState('All');
  const [section, setSection] = useState('All');
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [sectionScores, setSectionScores] = useState({
    'General Knowledge': { easy: 0, medium: 0, hard: 0 },
    'Mathematics': { easy: 0, medium: 0, hard: 0 },
    'Reasoning': { easy: 0, medium: 0, hard: 0 },
    'English': { easy: 0, medium: 0, hard: 0 }
  });
  const [backgroundColorIndex, setBackgroundColorIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const backgroundColors = [
    '#e8f5e8', '#fff3e0', '#f3e5f5', '#e1f5fe', '#fff8e1'
  ];

  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
  const sections = ['All', 'General Knowledge', 'Mathematics', 'Reasoning', 'English'];

  useEffect(() => {
    filterQuestions();
  }, [difficulty, section, questions]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
      setTotalTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Change background color every 10 seconds
    const colorInterval = setInterval(() => {
      setBackgroundColorIndex(prev => (prev + 1) % backgroundColors.length);
    }, 10000);

    return () => clearInterval(colorInterval);
  }, []);

  const filterQuestions = () => {
    let filtered = [...questions];

    if (difficulty !== 'All') {
      filtered = filtered.filter(q => q.difficulty === difficulty);
    }

    if (section !== 'All') {
      filtered = filtered.filter(q => q.section === section);
    }

    setFilteredQuestions(filtered);
    setCurrentQuestion(0);
  };

  const handleAnswer = (answer) => {
    const timeForQuestion = Math.floor((Date.now() - questionStartTime) / 1000);
    const question = filteredQuestions[currentQuestion];
    const isCorrect = answer === question.correct_answer;

    if (isCorrect) {
      setStreak(prev => prev + 1);
      setCorrectAnswers(prev => prev + 1);
      
      // Update section scores
      const difficultyLower = question.difficulty.toLowerCase();
      setSectionScores(prev => ({
        ...prev,
        [question.section]: {
          ...prev[question.section],
          [difficultyLower]: prev[question.section][difficultyLower] + 1
        }
      }));
    } else {
      // Wrong answer - show results
      setShowResult(true);
      playResultMusic();
      saveScoreToFirebase();
      return;
    }

    setQuestionsAttempted(prev => prev + 1);
    setSelectedAnswer('');
    setQuestionStartTime(Date.now());
    setTimeSpent(0);

    // Move to next question
    if (currentQuestion < filteredQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // All questions completed
      setShowResult(true);
      playResultMusic();
      saveScoreToFirebase();
    }
  };

  const playResultMusic = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      setIsPlaying(true);
    }
  };

  const saveScoreToFirebase = async () => {
    if (!user) return;

    const scoreData = {
      userId: user.uid,
      examType: 'ssc-cgl',
      streakScore: streak,
      totalTime: totalTime,
      questionsAttempted: questionsAttempted + 1,
      correctAnswers: correctAnswers,
      accuracy: Math.round(((correctAnswers / (questionsAttempted + 1)) * 100)),
      timestamp: new Date().toISOString(),
      difficulty: difficulty,
      section: section,
      sectionScores: sectionScores,
      averageTimePerQuestion: Math.round(totalTime / (questionsAttempted + 1))
    };

    try {
      await saveUserScore(scoreData);
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStreakFeedback = () => {
    if (streak >= 20) return "🔥 Incredible! You're on fire!";
    if (streak >= 15) return "🌟 Outstanding performance!";
    if (streak >= 10) return "💪 Great job! Keep it up!";
    if (streak >= 5) return "👍 Good progress!";
    return "🎯 Keep practicing!";
  };

  const restartTest = () => {
    setCurrentQuestion(0);
    setSelectedAnswer('');
    setShowResult(false);
    setStreak(0);
    setTimeSpent(0);
    setQuestionStartTime(Date.now());
    setTotalTime(0);
    setQuestionsAttempted(0);
    setCorrectAnswers(0);
    setSectionScores({
      'General Knowledge': { easy: 0, medium: 0, hard: 0 },
      'Mathematics': { easy: 0, medium: 0, hard: 0 },
      'Reasoning': { easy: 0, medium: 0, hard: 0 },
      'English': { easy: 0, medium: 0, hard: 0 }
    });
    setBackgroundColorIndex(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  if (filteredQuestions.length === 0) {
    return (
      <div className="ssc-cgl-app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="ssc-cgl-app result-screen">
        <audio ref={audioRef} loop>
          <source src="/music.mp3" type="audio/mpeg" />
        </audio>
        
        <div className="result-header">
          <button className="back-home-btn" onClick={onBackToHome}>
            🏠 Back to Home
          </button>
          <h1 className="result-title">Test Results</h1>
        </div>

        <div className="result-content">
          <div className="streak-display">
            <div className="streak-number">{streak}</div>
            <div className="streak-label">Streak Score</div>
            <div className="streak-feedback">{getStreakFeedback()}</div>
          </div>

          <div className="score-matrix">
            <div className="score-row">
              <div className="score-item">
                <div className="score-value">{questionsAttempted + 1}</div>
                <div className="score-label">Questions Attempted</div>
              </div>
              <div className="score-item">
                <div className="score-value">{correctAnswers}</div>
                <div className="score-label">Correct Answers</div>
              </div>
              <div className="score-item">
                <div className="score-value">{Math.round(((correctAnswers / (questionsAttempted + 1)) * 100))}%</div>
                <div className="score-label">Accuracy</div>
              </div>
              <div className="score-item">
                <div className="score-value">{formatTime(totalTime)}</div>
                <div className="score-label">Total Time</div>
              </div>
            </div>
          </div>

          <div className="section-breakdown">
            <h3>Section-wise Performance</h3>
            <div className="section-grid">
              {Object.entries(sectionScores).map(([section, scores]) => (
                <div key={section} className="section-card">
                  <h4>{section}</h4>
                  <div className="difficulty-scores">
                    <div className="difficulty-item">
                      <span className="difficulty-label easy">Easy:</span>
                      <span className="difficulty-score">{scores.easy}</span>
                    </div>
                    <div className="difficulty-item">
                      <span className="difficulty-label medium">Medium:</span>
                      <span className="difficulty-score">{scores.medium}</span>
                    </div>
                    <div className="difficulty-item">
                      <span className="difficulty-label hard">Hard:</span>
                      <span className="difficulty-score">{scores.hard}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="result-actions">
            <button className="restart-btn" onClick={restartTest}>
              🔄 Take Test Again
            </button>
            <button className="home-btn" onClick={onBackToHome}>
              🏠 Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="ssc-cgl-app"
      style={{ backgroundColor: backgroundColors[backgroundColorIndex] }}
    >
      <div className="app-header">
        <button className="back-home-btn" onClick={onBackToHome}>
          🏠 Back to Home
        </button>
        <h1 className="app-title">SSC CGL Streak Test</h1>
        <button className="chat-toggle-btn" onClick={toggleChat}>
          💬 Chat
        </button>
      </div>

      <div className="test-info">
        <div className="timer-display">
          <div className="timer-label">Time Spent</div>
          <div className="timer-value">{formatTime(timeSpent)}</div>
        </div>
        <div className="streak-display-small">
          <div className="streak-label">Current Streak</div>
          <div className="streak-value">{streak}</div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Difficulty:</label>
          <select 
            value={difficulty} 
            onChange={(e) => setDifficulty(e.target.value)}
          >
            {difficulties.map(diff => (
              <option key={diff} value={diff}>{diff}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Section:</label>
          <select 
            value={section} 
            onChange={(e) => setSection(e.target.value)}
          >
            {sections.map(sec => (
              <option key={sec} value={sec}>{sec}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="question-container">
        <div className="question-header">
          <div className="question-number">
            Question {currentQuestion + 1} of {filteredQuestions.length}
          </div>
          <div className="question-meta">
            <span className="difficulty-tag">{filteredQuestions[currentQuestion]?.difficulty}</span>
            <span className="section-tag">{filteredQuestions[currentQuestion]?.section}</span>
          </div>
        </div>

        <div className="question-content">
          <h2 className="question-text">
            {filteredQuestions[currentQuestion]?.question}
          </h2>
          
          <div className="answers-grid">
            {filteredQuestions[currentQuestion]?.options?.map((option, index) => (
              <button
                key={index}
                className={`answer-btn ${selectedAnswer === option ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedAnswer(option);
                  handleAnswer(option);
                }}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span className="option-text">{option}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ 
            width: `${((currentQuestion + 1) / filteredQuestions.length) * 100}%` 
          }}
        ></div>
      </div>

      {showChat && (
        <ChatSidebar 
          user={user} 
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};

export default SSCCGLApp;