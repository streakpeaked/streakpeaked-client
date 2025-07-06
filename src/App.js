import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { auth, provider } from './firebaseConfig';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import LandingPage from './LandingPage';
import SSCCGLApp from './SSCCGLApp';
import ProfileModal from './ProfileModal';
import PerformanceTracker from './PerformanceTracker';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showTracker, setShowTracker] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    signInWithPopup(auth, provider)
      .then(result => setUser(result.user))
      .catch(error => console.error("Login error", error));
  };

  const handleLogout = () => {
    signOut(auth).then(() => setUser(null));
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <LandingPage 
              user={user} 
              onLogin={handleLogin} 
              onLogout={handleLogout}
              onShowProfile={() => setShowProfile(true)}
              onShowTracker={() => setShowTracker(true)}
            />
          } 
        />
        <Route 
          path="/ssc-cgl" 
          element={
            <SSCCGLApp 
              user={user} 
              onShowProfile={() => setShowProfile(true)}
              onShowTracker={() => setShowTracker(true)}
            />
          } 
        />
      </Routes>
      {user && showProfile && (
        <ProfileModal 
          user={user} 
          onClose={() => setShowProfile(false)} 
          onShowTracker={() => {
            setShowProfile(false);
            setShowTracker(true);
          }}
        />
      )}
      {user && showTracker && (
        <PerformanceTracker 
          user={user} 
          onClose={() => setShowTracker(false)} 
        />
      )}
    </Router>
  );
}

export default App;