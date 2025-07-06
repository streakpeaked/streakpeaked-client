import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import LandingPage from './components/LandingPage';
import SSCCGLApp from './components/SSCCGLApp';
import ChatSidebar from './components/ChatSidebar';
import UserProfile from './components/UserProfile';
import PerformanceTracker from './components/PerformanceTracker';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [chatOpen, setChatOpen] = useState(false);
  const [userScores, setUserScores] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadUserScores(currentUser.uid);
      }
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
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setCurrentPage('home');
      setChatOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'ssc-cgl':
        return (
          <SSCCGLApp
            user={user}
            onBackHome={() => setCurrentPage('home')}
            onScoreSubmit={saveUserScore}
          />
        );
      case 'profile':
        return (
          <UserProfile
            user={user}
            onBackHome={() => setCurrentPage('home')}
            onViewPerformance={() => setCurrentPage('performance')}
          />
        );
      case 'performance':
        return (
          <PerformanceTracker
            user={user}
            scores={userScores}
            onBackHome={() => setCurrentPage('home')}
            onBackProfile={() => setCurrentPage('profile')}
          />
        );
      default:
        return (
          <LandingPage
            user={user}
            onExamSelect={(exam) => setCurrentPage(exam)}
            onProfileClick={() => setCurrentPage('profile')}
            onLogout={handleLogout}
          />
        );
    }
  };

  return (
    <div className="App">
      {renderCurrentPage()}
      
      {user && currentPage !== 'home' && (
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