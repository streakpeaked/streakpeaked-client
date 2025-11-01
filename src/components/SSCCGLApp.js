import React, { useState, useEffect, useRef } from 'react';
import './SSCCGLApp.css';
import ChatSidebar from './ChatSidebar';
import { saveUserScore } from '../firebaseConfig';

const SSCCGLApp = ({ user, onBackHome, questions = [], mode = 'streak', timeLimit = null })  => { //Nov2
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
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const timerRef = useRef(null);
  const totalTimerRef = useRef(null);
  const streakAudioRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(timeLimit);//Nov2

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
    console.log('Is Processing Answer:', isProcessingAnswer);
    console.log('Selected Answer:', selectedAnswer);
    console.log('==================');
  };

  useEffect(() => {
    if (questions && questions.length > 0) {
      filterQuestions();
    }
  }, [difficulty, section, questions]);

  //Nov2
  useEffect(() => {
  if (mode === 'compete' && timeLeft !== null) {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          endTest(); // auto-end when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }
}, [mode, timeLimit]);

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

  // Monitor currentQuestion changes
  useEffect(() => {
    console.log('🔍 useEffect: currentQuestion changed to:', currentQuestion);
    console.log('🔍 useEffect: filteredQuestions.length:', filteredQuestions.length);
    console.log('🔍 useEffect: isAnswering:', isAnswering);
    console.log('🔍 useEffect: selectedAnswer:', selectedAnswer);
    if (filteredQuestions[currentQuestion]) {
      console.log('🔍 useEffect: New question loaded:', filteredQuestions[currentQuestion].question);
    }
  }, [currentQuestion, filteredQuestions, isAnswering, selectedAnswer]);

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
    setIsAnswering(false);
    setIsProcessingAnswer(false);
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

  const moveToNextQuestion = () => {
    console.log('📝 moveToNextQuestion called');

    if (currentQuestion < filteredQuestions.length - 1) {
      console.log("Next question preview:", filteredQuestions[currentQuestion + 1]);
      setFilteredQuestions((prevQs) => {
        const updated = [...prevQs]; // force re-reference
        setCurrentQuestion(currentQuestion + 1);
        return updated;
      });

      resetQuestionTimer();

      // 🟢 Reset interaction flags AFTER advancing
      setTimeout(() => {
        setSelectedAnswer('');
        setIsAnswering(false);
        setIsProcessingAnswer(false);
        console.log('✅ Moved to next question');
      }, 100); // Give time for render
    } else {
      console.log('🎉 No more questions, ending test');
      endTest();
    }
  };


  const endTest = () => {
    console.log('🏁 Ending test');
    stopAllTimers();
    setShowResult(true);
    playStreakMusic();
    saveScoreToFirebase();
  };

  const checkAnswer = (selectedAnswer, question) => {
    console.log('🔍 checkAnswer called with:', { selectedAnswer, question });
    
    // Try multiple possible answer fields
    const correctAnswer = question?.answer || question?.correct_answer || question?.correctAnswer;
    console.log('Determined correct answer:', correctAnswer);
    
    if (!correctAnswer) {
      console.log('❌ No correct answer found in question data');
      return false;
    }
    
    // Multiple ways to check if answer is correct
    let isCorrect = false;
    
    // Method 1: Direct comparison
    isCorrect = selectedAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
    console.log('Method 1 (direct comparison):', isCorrect);
    
    // Method 2: Check if the answer matches any option position
    if (!isCorrect && question?.options) {
      const answerIndex = question.options.findIndex(opt => 
        opt.trim().toLowerCase() === selectedAnswer.trim().toLowerCase()
      );
      console.log('Selected answer index:', answerIndex);
      
      // Check if correctAnswer is a letter (A, B, C, D)
      if (correctAnswer.length === 1 && correctAnswer.match(/[A-D]/i)) {
        const correctIndex = correctAnswer.toUpperCase().charCodeAt(0) - 65; // A=0, B=1, etc.
        isCorrect = answerIndex === correctIndex;
        console.log('Method 2 (letter index):', isCorrect, 'correctIndex:', correctIndex);
      }
      
      // Check if correctAnswer is a number (1, 2, 3, 4)
      if (!isCorrect && correctAnswer.match(/^[1-4]$/)) {
        const correctIndex = parseInt(correctAnswer) - 1; // 1=0, 2=1, etc.
        isCorrect = answerIndex === correctIndex;
        console.log('Method 3 (number index):', isCorrect, 'correctIndex:', correctIndex);
      }
    }
    
    console.log('🎯 Final answer check result:', isCorrect);
    return isCorrect;
  };

  const handleAnswer = (answer) => {
    // Prevent multiple clicks
    if (isAnswering || isProcessingAnswer) {
      console.log('Already processing answer, ignoring click');
      return;
    }
    
    console.log('=== HANDLE ANSWER CALLED ===');
    console.log('Answer clicked:', answer);
    console.log('Current question index:', currentQuestion);
    console.log('Total questions:', filteredQuestions.length);
    
    // Set processing states
    setIsAnswering(true);
    setSelectedAnswer(answer);

    const question = filteredQuestions[currentQuestion];
    console.log('Current question object:', question);
    
    // Small delay to show the selected answer
    setTimeout(() => {
      const timeForQuestion = questionTimer;
      
      // Store the time taken for this question
      setQuestionTimes(prev => [...prev, timeForQuestion]);
      
      // Check if answer is correct
      const isCorrect = checkAnswer(answer, question);
      
      console.log('=== FINAL ANSWER RESULT ===');
      console.log('Selected answer:', answer);
      console.log('Is correct:', isCorrect);
      console.log('========================');
      
      // Always increment questions attempted
      setQuestionsAttempted(prev => {
        const newAttempted = prev + 1;
        console.log('Questions attempted updated to:', newAttempted);
        return newAttempted;
      });

      if (isCorrect) {
        console.log('✅ CORRECT ANSWER!');
        
        // Update streak
        setStreak(prev => {
          const newStreak = prev + 1;
          console.log('Streak updated to:', newStreak);
          return newStreak;
        });
        
        // Update correct answers
        setCorrectAnswers(prev => {
          const newCorrect = prev + 1;
          console.log('Correct answers updated to:', newCorrect);
          return newCorrect;
        });
        
        // Update section scores
      if (question?.difficulty && question?.section) {
        const difficultyLower = question?.difficulty?.toLowerCase() || 'easy'; // fallback to 'easy'
        setSectionScores(prev => ({
          ...prev,
          [question.section]: {
            ...prev[question.section],
            [difficultyLower]: prev[question.section][difficultyLower] + 1
          }
        }));
      }
        
        // Move to next question after a short delay
        setTimeout(() => {
          moveToNextQuestion();
        }, 1000);
        
      } else {
        console.log('❌ WRONG ANSWER! Ending test...');
        setTimeout(() => {
          endTest();
        }, 1000);
      }
    }, 500);
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
    setIsProcessingAnswer(false);
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

  // Add safety check for current question
  if (currentQuestion >= filteredQuestions.length) {
    console.error('Current question index out of bounds:', currentQuestion, 'vs', filteredQuestions.length);
    return (
      <div className="ssc-cgl-app">
        <div className="loading-container">
          <p>Loading next question...</p>
        </div>
      </div>
    );
  }

  const currentQuestionData = filteredQuestions[currentQuestion];

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
            disabled={isAnswering || isProcessingAnswer}
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
            disabled={isAnswering || isProcessingAnswer}
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
            <span className="difficulty-tag">{currentQuestionData?.difficulty}</span>
            <span className="section-tag">{currentQuestionData?.section}</span>
          </div>
        </div>

        <div className="question-content">
          <h2 className="question-text">
            {currentQuestionData?.question}
          </h2>
          
          <div className="answers-grid">
            {currentQuestionData?.options?.map((option, index) => (
              <button
                key={index}
                className={`answer-btn ${selectedAnswer === option ? 'selected' : ''} ${isProcessingAnswer ? 'processing' : ''}`}
                onClick={() => handleAnswer(option)}
                disabled={isAnswering || isProcessingAnswer}
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
{/* Nov2 */}
      {mode === 'compete' && (
        <div className="compete-timer">
          Time Left: {timeLeft}s
        </div>
      )}      
    </div>
  );
};

export default SSCCGLApp;