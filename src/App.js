import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import LandingPage from './components/LandingPage';
import SSCCGLApp from './components/SSCCGLApp';
import ChatSidebar from './components/ChatSidebar';
import UserProfile from './components/UserProfile';
import PerformanceTracker from './components/PerformanceTracker';
import questionsData from './ssc_cgl_questions_with_filters.json';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState({ page: 'home' }); // now an object
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
      setCurrentPage({ page: 'home' });
      setChatOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out');
    }
  };

  const renderCurrentPage = () => {
    try {
      switch (currentPage.page) {
        case 'ssc-cgl':
          return (
            <SSCCGLApp
              user={user}
              onBackHome={() => setCurrentPage({ page: 'home' })}
              onScoreSubmit={saveUserScore}
              questions={questionsData}
              mode={currentPage.mode}          // pass mode from LandingPage
              timeLimit={currentPage.timeLimit} // pass timeLimit from LandingPage
            />
          );
        case 'profile':
          return (
            <UserProfile
              user={user}
              onBackHome={() => setCurrentPage({ page: 'home' })}
              onViewPerformance={() => setCurrentPage({ page: 'performance' })}
            />
          );
        case 'performance':
          return (
            <PerformanceTracker
              user={user}
              scores={userScores}
              onBackHome={() => setCurrentPage({ page: 'home' })}
              onBackProfile={() => setCurrentPage({ page: 'profile' })}
            />
          );
        default:
          return (
            <LandingPage
              user={user}
              // ✅ pass both exam name and options (mode, timeLimit)
              onExamSelect={(exam, opts) => setCurrentPage({ page: exam, ...opts })}
              onProfileClick={() => setCurrentPage({ page: 'profile' })}
              onLogout={handleLogout}
            />
          );
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      return (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>{error?.message || 'An unexpected error occurred'}</p>
          <button onClick={() => setCurrentPage({ page: 'home' })}>Go Home</button>
        </div>
      );
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
    <div className="App">
      {renderCurrentPage()}
      {/* ✅ Chat only shows when not on home */}
      {user && currentPage.page === 'ssc-cgl' && (
        <ChatSidebar
          isOpen={chatOpen}
          onToggle={() => setChatOpen(!chatOpen)}
          user={user}
        />
      )}
    </div>
  );
}

export default App;
