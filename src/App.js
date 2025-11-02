import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import SSCCGLApp from './components/SSCCGLApp';
import ChatSidebar from './components/ChatSidebar';
import UserProfile from './components/UserProfile';
import PerformanceTracker from './components/PerformanceTracker';
import questionsData from './ssc_cgl_questions_with_filters.json';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [userScores, setUserScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadUserScores(currentUser.uid);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loadUserScores = async (userId) => {
    try {
      const savedScores = localStorage.getItem(`scores_${userId}`);
      if (savedScores) {
        setUserScores(JSON.parse(savedScores));
      }
    } catch (error) {
      console.error('Error loading user scores:', error);
      setError('Failed to load user scores');
    }
  };

  const saveUserScore = (scoreData) => {
    if (user) {
      const newScore = {
        ...scoreData,
        timestamp: new Date().toISOString(),
        userId: user.uid
      };
      const updatedScores = [...userScores, newScore];
      setUserScores(updatedScores);
      try {
        localStorage.setItem(`scores_${user.uid}`, JSON.stringify(updatedScores));
      } catch (error) {
        console.error('Error saving user score:', error);
        setError('Failed to save user score');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setChatOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => setError(null)}>Try Again</button>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <LandingPage
                user={user}
                onProfileClick={() => {}}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            path="/ssc-cgl"
            element={
              <SSCCGLApp
                user={user}
                onBackHome={() => window.location.href = '/'}
                onScoreSubmit={saveUserScore}
                questions={questionsData}
              />
            }
          />
          <Route
            path="/profile"
            element={
              <UserProfile
                user={user}
                onBackHome={() => window.location.href = '/'}
                onViewPerformance={() => window.location.href = '/performance'}
              />
            }
          />
          <Route
            path="/performance"
            element={
              <PerformanceTracker
                user={user}
                scores={userScores}
                onBackHome={() => window.location.href = '/'}
                onBackProfile={() => window.location.href = '/profile'}
              />
            }
          />
        </Routes>

        {user && (
          <ChatSidebar
            isOpen={chatOpen}
            onToggle={() => setChatOpen(!chatOpen)}
            user={user}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
