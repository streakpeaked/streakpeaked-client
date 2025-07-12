// SSCCGLApp.js (Updated - Full Version)
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
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const timerRef = useRef(null);
  const totalTimerRef = useRef(null);
  const streakAudioRef = useRef(null);

  const backgroundColors = ['#e8f5e8', '#fff3e0', '#f3e5f5', '#e1f5fe', '#fff8e1'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
  const sections = ['All', 'General Knowledge', 'Mathematics', 'Reasoning', 'English'];

  useEffect(() => {
    if (questions && questions.length > 0) {
      filterQuestions();
    }
  }, [difficulty, section, questions]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setQuestionTimer(prev => prev + 1);
    }, 1000);
    totalTimerRef.current = setInterval(() => {
      setTotalTime(prev => prev + 1);
    }, 1000);
    return () => {
      clearInterval(timerRef.current);
      clearInterval(totalTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const colorInterval = setInterval(() => {
      setBackgroundColorIndex(prev => (prev + 1) % backgroundColors.length);
    }, 10000);
    return () => clearInterval(colorInterval);
  }, []);

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const filterQuestions = () => {
    let filtered = [...questions];
    if (difficulty !== 'All') filtered = filtered.filter(q => q.difficulty === difficulty);
    if (section !== 'All') filtered = filtered.filter(q => q.section === section);
    setFilteredQuestions(shuffleArray(filtered));
    setCurrentQuestion(0);
    setSelectedAnswer('');
    resetQuestionTimer();
  };

  const resetQuestionTimer = () => {
    setQuestionTimer(0);
    setQuestionStartTime(Date.now());
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setQuestionTimer(prev => prev + 1);
    }, 1000);
  };

  const stopAllTimers = () => {
    clearInterval(timerRef.current);
    clearInterval(totalTimerRef.current);
  };

  const moveToNextQuestion = () => {
    setIsAnswering(false);
    setIsProcessingAnswer(false);
    if (currentQuestion < filteredQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer('');
      resetQuestionTimer();
    } else {
      endTest();
    }
  };

  const endTest = () => {
    stopAllTimers();
    setShowResult(true);
    playStreakMusic();
    saveScoreToFirebase();
  };

  const checkAnswer = (selectedAnswer, question) => {
    const correctAnswer = (question?.correctAnswer || question?.correct_answer || question?.answer || '').toString().trim().toLowerCase();
    const normalizedSelected = selectedAnswer.toString().trim().toLowerCase();
    let isCorrect = normalizedSelected === correctAnswer;

    if (!isCorrect && question?.options) {
      const answerIndex = question.options.findIndex(opt => opt.toLowerCase() === normalizedSelected);
      if (correctAnswer.match(/^[a-d]$/i)) {
        const correctIndex = correctAnswer.charCodeAt(0) - 97;
        isCorrect = answerIndex === correctIndex;
      } else if (correctAnswer.match(/^[1-4]$/)) {
        const correctIndex = parseInt(correctAnswer) - 1;
        isCorrect = answerIndex === correctIndex;
      }
    }
    return isCorrect;
  };

  const handleAnswer = (answer) => {
    if (isAnswering || isProcessingAnswer) return;
    setIsAnswering(true);
    setIsProcessingAnswer(true);
    setSelectedAnswer(answer);
    const question = filteredQuestions[currentQuestion];

    setTimeout(() => {
      const timeForQuestion = questionTimer;
      setQuestionTimes(prev => [...prev, timeForQuestion]);
      const isCorrect = checkAnswer(answer, question);
      setQuestionsAttempted(prev => prev + 1);

      if (isCorrect) {
        setStreak(prev => prev + 1);
        setCorrectAnswers(prev => prev + 1);
        const difficultyKey = question.difficulty.toLowerCase();
        setSectionScores(prev => ({
          ...prev,
          [question.section]: {
            ...prev[question.section],
            [difficultyKey]: prev[question.section][difficultyKey] + 1
          }
        }));
        setTimeout(() => moveToNextQuestion(), 500);
      } else {
        setTimeout(() => endTest(), 500);
      }
    }, 300);
  };

  const playStreakMusic = () => {
    try {
      if (!streakAudioRef.current) {
        streakAudioRef.current = new Audio('/music.mp3');
        streakAudioRef.current.loop = true;
        streakAudioRef.current.volume = 0.5;
      }
      if (streakAudioRef.current.ended) {
        streakAudioRef.current.currentTime = 0;
      }
      streakAudioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
        const playOnClick = () => {
          streakAudioRef.current.play().then(() => {
            setIsPlaying(true);
            document.removeEventListener('click', playOnClick);
          });
        };
        document.addEventListener('click', playOnClick);
      });
    } catch (error) {
      console.error("Error initializing audio:", error);
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
      totalTime,
      questionsAttempted,
      correctAnswers,
      accuracy: questionsAttempted > 0 ? Math.round((correctAnswers / questionsAttempted) * 100) : 0,
      timestamp: new Date().toISOString(),
      difficulty,
      section,
      sectionScores,
      averageTimePerQuestion: questionsAttempted > 0 ? Math.round(totalTime / questionsAttempted) : 0,
      questionTimes
    };
    try {
      await saveUserScore(scoreData);
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  const restartTest = () => {
    setCurrentQuestion(0);
    setSelectedAnswer('');
    setShowResult(false);
    setStreak(0);
    setQuestionTimer(0);
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
    stopStreakMusic();
    filterQuestions();
    timerRef.current = setInterval(() => setQuestionTimer(prev => prev + 1), 1000);
    totalTimerRef.current = setInterval(() => setTotalTime(prev => prev + 1), 1000);
  };

  const toggleChat = () => setShowChat(prev => !prev);

  return null; // UI JSX is omitted for clarity
};

export default SSCCGLApp;
