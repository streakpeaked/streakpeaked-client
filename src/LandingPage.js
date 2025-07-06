import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = ({ user, onLogin, onLogout, onShowProfile, onShowTracker }) => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="nav-container">
          <div className="logo">StreakPeaked</div>
          <nav>
            <ul className="nav-menu">
              <li><a href="#team">team</a></li>
              <li><a href="#careers">careers</a></li>
              <li><a href="#testimonials">testimonials</a></li>
              <li><a href="#blogs">blogs</a></li>
              <li><a href="#press">press</a></li>
              <li><a href="#contact">contact</a></li>
            </ul>
          </nav>
          <div className="user-actions">
            {user ? (
              <>
                <span className="welcome-text">Welcome, {user.displayName}</span>
                <button className="profile-btn" onClick={onShowProfile}>My Profile</button>
                <button className="profile-btn" onClick={onShowTracker}>Performance Tracker</button>
                <button className="login-btn" onClick={onLogout}>Logout</button>
              </>
            ) : (
              <button className="login-btn" onClick={onLogin}>Login</button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>More than 10 Million Students Have Said Hello to Stress-Free Studying</h1>
            <p>Start preparing for your next test!</p>
            <div className="test-buttons">
              <button className="test-btn" onClick={() => navigate('/ssc-cgl')}>SSC CGL®</button>
              <button className="test-btn" disabled>NEET®</button>
              <button className="test-btn" disabled>RBI Grade B®</button>
              <button className="test-btn" disabled>CLAT®</button>
              <button className="test-btn" disabled>RRB®</button>
              <button className="test-btn" disabled>IBPS PO®</button>
            </div>
            <div className="additional-tests">
              <button className="test-btn" disabled>AI Champ®</button>
              <button className="test-btn" disabled>Data Scientist®</button>
            </div>
          </div>
          <div className="hero-image">
            <div className="student-image">
              👩‍🎓 Student Success Image
            </div>
          </div>
        </div>
      </section>

      {/* (rest of your LandingPage sections remain unchanged...) */}

      <footer className="footer">
        {/* ... */}
      </footer>
    </div>
  );
};

export default LandingPage;