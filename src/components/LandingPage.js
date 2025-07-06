import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import './LandingPage.css';

const LandingPage = ({ user, onExamSelect, onProfileClick, onLogout }) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    } finally {
      setLoading(false);
    }
  };

  const examData = [
    {
      id: 'ssc-cgl',
      title: 'SSC CGL',
      description: 'Staff Selection Commission Combined Graduate Level',
      color: 'blue',
      icon: '📋'
    },
    {
      id: 'neet',
      title: 'NEET',
      description: 'National Eligibility cum Entrance Test',
      color: 'green',
      icon: '🏥'
    },
    {
      id: 'rbi-grade-b',
      title: 'RBI Grade B',
      description: 'Reserve Bank of India Grade B Officer',
      color: 'purple',
      icon: '🏦'
    }
  ];

  const features = [
    {
      icon: '⚡',
      title: 'Real-time streak-based practice',
      description: 'Test your knowledge with our innovative streak system'
    },
    {
      icon: '📊',
      title: 'Instant feedback & visual analytics',
      description: 'Get detailed performance insights and analytics'
    },
    {
      icon: '🎯',
      title: 'Personalized improvement suggestions',
      description: 'Receive tailored recommendations for better performance'
    },
    {
      icon: '⏱️',
      title: 'Smart timer and section-wise insights',
      description: 'Track your time and get section-wise performance data'
    }
  ];

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="nav">
            <div className="logo">
              <h1>StreakPeaked</h1>
            </div>
            <div className="nav-actions">
              {user ? (
                <div className="user-menu">
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName} 
                    className="user-avatar"
                  />
                  <div className="user-dropdown">
                    <span className="user-name">Welcome, {user.displayName}</span>
                    <button 
                      className="profile-btn"
                      onClick={onProfileClick}
                    >
                      My Profile
                    </button>
                    <button 
                      className="logout-btn"
                      onClick={onLogout}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  className="login-btn"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Login with Google'}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h2 className="hero-title">
                Master Your Exams with
                <span className="highlight"> Smart Practice</span>
              </h2>
              <p className="hero-subtitle">
                Experience the future of exam preparation with our AI-powered platform. 
                Track your progress, build streaks, and achieve your goals faster than ever.
              </p>
              <div className="hero-stats">
                <div className="stat">
                  <div className="stat-number">2000+</div>
                  <div className="stat-label">Practice Questions</div>
                </div>
                <div className="stat">
                  <div className="stat-number">50k+</div>
                  <div className="stat-label">Students Helped</div>
                </div>
                <div className="stat">
                  <div className="stat-number">95%</div>
                  <div className="stat-label">Success Rate</div>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <div className="floating-cards">
                <div className="card card-1">
                  <div className="card-icon">📈</div>
                  <div className="card-text">Performance Analytics</div>
                </div>
                <div className="card card-2">
                  <div className="card-icon">🔥</div>
                  <div className="card-text">Streak Building</div>
                </div>
                <div className="card card-3">
                  <div className="card-icon">🎯</div>
                  <div className="card-text">Smart Targeting</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Choose Your Exam Section */}
      <section className="exams-section">
        <div className="container">
          <div className="section-header">
            <h3>Choose Your Exam</h3>
            <p>Start practicing with exam-focused test experiences</p>
          </div>
          <div className="exams-grid">
            {examData.map((exam) => (
              <div 
                key={exam.id} 
                className={`exam-card ${exam.color}`}
                onClick={() => onExamSelect(exam.id)}
              >
                <div className="exam-icon">{exam.icon}</div>
                <div className="exam-content">
                  <h4>{exam.title}</h4>
                  <p>{exam.description}</p>
                </div>
                <div className="exam-arrow">→</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h3>Why StreakPeaked?</h3>
            <p>Discover what makes our platform unique</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h3>Ready to Peak Your Performance?</h3>
            <p>Join thousands of students who are already improving their scores</p>
            {!user && (
              <button 
                className="cta-button"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                Get Started Free
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>StreakPeaked</h4>
              <p>Empowering students to achieve their exam goals</p>
            </div>
            <div className="footer-section">
              <h5>Contact</h5>
              <p>support@streakpeaked.io</p>
              <p>Gurgaon, India</p>
            </div>
            <div className="footer-section">
              <h5>Follow Us</h5>
              <div className="social-links">
                <a href="#" className="social-link">Twitter</a>
                <a href="#" className="social-link">LinkedIn</a>
                <a href="#" className="social-link">Instagram</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 StreakPeaked | All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;