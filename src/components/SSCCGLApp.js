import React, { useState, useEffect, useRef } from 'react';
import './SSCCGLApp.css';
import ChatSidebar from './ChatSidebar';
import { saveUserScore } from '../firebaseConfig';

const SSCCGLApp = ({ user, onBackHome, questions = [] }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [streak, setStreak] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(0);
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
  const [questionTimes, setQuestionTimes] = useState([]);
  const [isAnswering, setIsAnswering] = useState(false);
  const timerRef = useRef(null);
  const totalTimerRef = useRef(null);
  const streakAudioRef = useRef(null);

  const backgroundColors = [
    '#e8f5e8', '#fff3e0', '#f3e5f5', '#e1f5fe', '#fff8e1'
  ];

  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
  const sections = ['All', 'General Knowledge', 'Mathematics', 'Reasoning', 'English'];

  // Shuffle questions randomly
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Debug function to help troubleshoot
  const debugCurrentQuestion = () => {
    console.log('=== DEBUG INFO ===');
    console.log('Current Question Index:', currentQuestion);
    console.log('Total Filtered Questions:', filteredQuestions.length);
    console.log('Current Question Object:', filteredQuestions[currentQuestion]);
    console.log('Is Answering:', isAnswering);
    console.log('Selected Answer:', selectedAnswer);
    console.log('==================');
  };

  useEffect(() => {
    if (questions && questions.length > 0) {
      filterQuestions();
    }
  }, [difficulty, section, questions]);

  useEffect(() => {
    // Question timer - resets for each question
    timerRef.current = setInterval(() => {
      setQuestionTimer(prev => prev + 1);
    }, 1000);

    // Total timer - continuous
    totalTimerRef.current = setInterval(() => {
      setTotalTime(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
    };
  }, []);

  useEffect(() => {
    // Change background color every 10 seconds
    const colorInterval = setInterval(() => {
      setBackgroundColorIndex(prev => (prev + 1) % backgroundColors.length);
    }, 10000);

    return () => clearInterval(colorInterval);
  }, []);

  const filterQuestions = () => {
    if (!questions || questions.length === 0) {
      setFilteredQuestions([]);
      return;
    }

    let filtered = [...questions];

    if (difficulty !== 'All') {
      filtered = filtered.filter(q => q.difficulty === difficulty);
    }

    if (section !== 'All') {
      filtered = filtered.filter(q => q.section === section);
    }

    // Shuffle the filtered questions randomly
    const shuffledQuestions = shuffleArray(filtered);
    setFilteredQuestions(shuffledQuestions);
    setCurrentQuestion(0);
    setSelectedAnswer('');
    resetQuestionTimer();
  };

  const resetQuestionTimer = () => {
    setQuestionTimer(0);
    setQuestionStartTime(Date.now());
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setQuestionTimer(prev => prev + 1);
      }, 1000);
    }
  };

  const stopAllTimers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (totalTimerRef.current) {
      clearInterval(totalTimerRef.current);
      totalTimerRef.current = null;
    }
  };

  const handleAnswer = (answer) => {
    if (isAnswering) return; // Prevent multiple clicks
    setIsAnswering(true);
    setSelectedAnswer(answer);

    // Debug logging
    console.log('=== ANSWER SELECTED ===');
    console.log('Selected answer:', answer);
    console.log('Current question:', filteredQuestions[currentQuestion]);
    console.log('Correct answer:', filteredQuestions[currentQuestion]?.answer);

    // Small delay to show the selected answer
    setTimeout(() => {
      const timeForQuestion = questionTimer;
      const question = filteredQuestions[currentQuestion];
      
      // Store the time taken for this question
      setQuestionTimes(prev => [...prev, timeForQuestion]);
      
      // Check if answer is correct - using 'answer' key from JSON
      // More robust comparison to handle case sensitivity and whitespace
      const isCorrect = answer.trim().toLowerCase() === question.answer.trim().toLowerCase();
      
      console.log('Is correct:', isCorrect);
      console.log('Answer comparison:', {
        selected: answer.trim().toLowerCase(),
        correct: question.answer.trim().toLowerCase()
      });
      
      // Always increment questions attempted
      setQuestionsAttempted(prev => prev + 1);

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
        
        console.log('Moving to next question...');
        console.log('Current question index:', currentQuestion);
        console.log('Total questions:', filteredQuestions.length);
        
        // Check if there are more questions
        if (currentQuestion < filteredQuestions.length - 1) {
          // Move to next question
          console.log('Moving to question:', currentQuestion + 1);
          setCurrentQuestion(prev => {
            console.log('Setting current question from', prev, 'to', prev + 1);
            return prev + 1;
          });
          setSelectedAnswer(''); // Clear selected answer
          resetQuestionTimer();
          setIsAnswering(false);
        } else {
          // All questions completed successfully
          console.log('All questions completed!');
          stopAllTimers();
          setShowResult(true);
          playStreakMusic();
          saveScoreToFirebase();
        }
      } else {
        // Wrong answer - end test immediately
        console.log('Wrong answer - ending test');
        stopAllTimers();
        setShowResult(true);
        playStreakMusic();
        saveScoreToFirebase();
      }
    }, 500); // 500ms delay to show selection
  };

  const playStreakMusic = () => {
    try {
      if (!streakAudioRef.current) {
        streakAudioRef.current = new Audio('/music.mp3');
        streakAudioRef.current.loop = true;
        streakAudioRef.current.volume = 0.5; // Set volume to 50%
      }
      
      // Reset audio if it ended
      if (streakAudioRef.current.ended) {
        streakAudioRef.current.currentTime = 0;
      }
      
      const playPromise = streakAudioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Music started playing");
            setIsPlaying(true);
          })
          .catch((e) => {
            console.log("Audio play failed:", e);
            // Try to play again after user interaction
            const playOnClick = () => {
              streakAudioRef.current.play()
                .then(() => {
                  setIsPlaying(true);
                  document.removeEventListener('click', playOnClick);
                })
                .catch(console.log);
            };
            document.addEventListener('click', playOnClick);
          });
      }
    } catch (error) {
      console.log("Error initializing audio:", error);
    }
  };

  const stopStreakMusic = () => {
    if (streakAudioRef.current) {
      streakAudioRef.current.pause();
      streakAudioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const saveScoreToFirebase = async () => {
    if (!user) return;

    const scoreData = {
      userId: user.uid,
      examType: 'ssc-cgl',
      streakScore: streak,
      totalTime: totalTime,
      questionsAttempted: questionsAttempted,
      correctAnswers: correctAnswers,
      accuracy: questionsAttempted > 0 ? Math.round((correctAnswers / questionsAttempted) * 100) : 0,
      timestamp: new Date().toISOString(),
      difficulty: difficulty,
      section: section,
      sectionScores: sectionScores,
      averageTimePerQuestion: questionsAttempted > 0 ? Math.round(totalTime / questionsAttempted) : 0,
      questionTimes: questionTimes
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
    const score = streak;
    let baseFeedback = "";
    
    if (score < 10) {
      baseFeedback = "Your streak score is very low, not even crossing 10. Hope you got a reality check. Now buckle up and grind till you make this streak above 20.";
    } else if (score < 20) {
      baseFeedback = "Your streak score is decent but not crossing 20. Hope you don't want to take things lightly. Check where you went wrong and improve the streak over 30.";
    } else if (score < 40) {
      baseFeedback = "You are doing well! Keep the game tight, take streak beyond 40 now. Don't be lazy like CAT.";
    } else {
      baseFeedback = "You are right there, dark horse! Nail it, then ace it and rock it. Hit consistent 100+ streak now. madMODEon!";
    }
    
    return baseFeedback;
  };

  const restartTest = () => {
    setCurrentQuestion(0);
    setSelectedAnswer('');
    setShowResult(false);
    setStreak(0);
    setQuestionTimer(0);
    setQuestionStartTime(Date.now());
    setTotalTime(0);
    setQuestionsAttempted(0);
    setCorrectAnswers(0);
    setQuestionTimes([]);
    setIsAnswering(false);
    setSectionScores({
      'General Knowledge': { easy: 0, medium: 0, hard: 0 },
      'Mathematics': { easy: 0, medium: 0, hard: 0 },
      'Reasoning': { easy: 0, medium: 0, hard: 0 },
      'English': { easy: 0, medium: 0, hard: 0 }
    });
    setBackgroundColorIndex(0);
    stopStreakMusic();
    filterQuestions(); // This will shuffle questions again
    
    // Restart timers
    timerRef.current = setInterval(() => {
      setQuestionTimer(prev => prev + 1);
    }, 1000);
    totalTimerRef.current = setInterval(() => {
      setTotalTime(prev => prev + 1);
    }, 1000);
  };

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  // Show loading if no questions or still loading
  if (!questions || questions.length === 0) {
    return (
      <div className="ssc-cgl-app">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  // Show message if no filtered questions
  if (filteredQuestions.length === 0) {
    return (
      <div className="ssc-cgl-app">
        <div className="app-header">
          <button className="back-home-btn" onClick={onBackHome}>
            🏠 Back to Home
          </button>
          <h1 className="app-title">SSC CGL Streak Test</h1>
        </div>
        <div className="no-questions-container">
          <h2>No questions found for the selected filters</h2>
          <p>Try changing the difficulty or section filters</p>
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
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="ssc-cgl-app result-screen">
        <div className="result-header">
          <button className="back-home-btn" onClick={onBackHome}>
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
            <div className="matrix-header">
              <h3>Performance Matrix</h3>
            </div>
            <div className="matrix-grid">
              <div className="matrix-cell">
                <div className="matrix-value">{questionsAttempted}</div>
                <div className="matrix-label">Questions Attempted</div>
              </div>
              <div className="matrix-cell">
                <div className="matrix-value">{correctAnswers}</div>
                <div className="matrix-label">Correct Answers</div>
              </div>
              <div className="matrix-cell">
                <div className="matrix-value">{questionsAttempted > 0 ? Math.round((correctAnswers / questionsAttempted) * 100) : 0}%</div>
                <div className="matrix-label">Accuracy</div>
              </div>
              <div className="matrix-cell">
                <div className="matrix-value">{formatTime(totalTime)}</div>
                <div className="matrix-label">Total Time</div>
              </div>
              <div className="matrix-cell">
                <div className="matrix-value">{questionsAttempted > 0 ? formatTime(Math.round(totalTime / questionsAttempted)) : '0:00'}</div>
                <div className="matrix-label">Avg Time/Question</div>
              </div>
              <div className="matrix-cell">
                <div className="matrix-value">{filteredQuestions.length}</div>
                <div className="matrix-label">Total Questions</div>
              </div>
            </div>
            
            <div className="section-performance-matrix">
              <h4>Section-wise Performance Matrix</h4>
              <div className="section-matrix-grid">
                {Object.entries(sectionScores).map(([section, scores]) => {
                  const total = scores.easy + scores.medium + scores.hard;
                  if (total === 0) return null;
                  return (
                    <div key={section} className="section-matrix-row">
                      <div className="section-name">{section}</div>
                      <div className="section-scores">
                        <span className="easy-score">Easy: {scores.easy}</span>
                        <span className="medium-score">Medium: {scores.medium}</span>
                        <span className="hard-score">Hard: {scores.hard}</span>
                        <span className="total-score">Total: {total}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="result-actions">
            <button className="restart-btn" onClick={restartTest}>
              🔄 Take Test Again
            </button>
            <button className="home-btn" onClick={onBackHome}>
              🏠 Back to Home
            </button>
            <button className="music-btn" onClick={isPlaying ? stopStreakMusic : playStreakMusic}>
              {isPlaying ? '🔇 Stop Music' : '🎵 Play Music'}
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
        <button className="back-home-btn" onClick={onBackHome}>
          🏠 Back to Home
        </button>
        <h1 className="app-title">SSC CGL Streak Test</h1>
        <button className="chat-toggle-btn" onClick={toggleChat}>
          💬 {showChat ? 'Hide Chat' : 'Live Chat'}
        </button>
      </div>

      <div className="test-info">
        <div className="timer-display">
          <div className="timer-label">Question Timer</div>
          <div className="timer-value">{formatTime(questionTimer)}</div>
        </div>
        <div className="total-timer-display">
          <div className="timer-label">Total Time</div>
          <div className="timer-value">{formatTime(totalTime)}</div>
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
            disabled={isAnswering}
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
            disabled={isAnswering}
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
                onClick={() => handleAnswer(option)}
                disabled={isAnswering}
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

      {/* Debug button - remove in production */}
      <button 
        onClick={debugCurrentQuestion}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          padding: '5px 10px',
          backgroundColor: '#ff6b6b',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        Debug
      </button>

      {showChat && (
        <div className="chat-overlay">
          <div className="chat-container">
            <div className="chat-header">
              <h3>Live Chat - SSC CGL Test</h3>
              <button className="close-chat-btn" onClick={() => setShowChat(false)}>
                ✕
              </button>
            </div>
            <ChatSidebar user={user} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SSCCGLApp;