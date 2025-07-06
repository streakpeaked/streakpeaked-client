import React, { useEffect, useState, useRef } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Adjust path if needed
import './LandingPage.css';

const LandingPage = ({ user, onLogout, onExamSelect, onProfileClick }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const profileMenuRef = useRef(null);

  // Google login logic
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      alert('Google login failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Smooth scrolling for navigation links
    const handleAnchorClick = (e) => {
      if (e.target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    // Add scroll effect to header
    const handleScroll = () => {
      const header = document.querySelector('.header');
      if (header) {
        if (window.scrollY > 100) {
          header.style.background = 'rgba(44, 35, 97, 0.95)';
        } else {
          header.style.background = 'linear-gradient(135deg, #2C2361 0%, #3C2F7F 100%)';
        }
      }
    };

    // Add hover animations to buttons
    const handleButtonHover = (e) => {
      if (e.type === 'mouseenter') {
        e.target.style.transform = 'translateY(-2px)';
      } else {
        e.target.style.transform = 'translateY(0)';
      }
    };

    // Animate stats on scroll
    const animateStats = () => {
      const stats = document.querySelectorAll('.stat-number');
      stats.forEach(stat => {
        const rect = stat.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          stat.style.animation = 'countUp 2s ease-out';
        }
      });
    };

    // Add event listeners
    document.addEventListener('click', handleAnchorClick);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('scroll', animateStats);

    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      button.addEventListener('mouseenter', handleButtonHover);
      button.addEventListener('mouseleave', handleButtonHover);
    });

    // Close profile dropdown on outside click
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target) &&
        !event.target.classList.contains('user-avatar')
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup function
    return () => {
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', animateStats);
      buttons.forEach(button => {
        button.removeEventListener('mouseenter', handleButtonHover);
        button.removeEventListener('mouseleave', handleButtonHover);
      });
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Button click handler for tests
  const handleTestClick = (testType) => {
    if (!user) {
      alert('Please login to access the test!');
      return;
    }
    if (testType === 'SSC CGL') {
      onExamSelect && onExamSelect('ssc-cgl');
    } else {
      alert(`${testType} test is coming soon!`);
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="nav-container">
          <div className="logo">StreakPeaked</div>
          <nav className="nav-section">
            <ul className="nav-menu">
              <li><a href="#team">team</a></li>
              <li><a href="#careers">careers</a></li>
              <li><a href="#testimonials">testimonials</a></li>
              <li><a href="#blogs">blogs</a></li>
              <li><a href="#press">press</a></li>
              <li><a href="#contact">contact</a></li>
            </ul>
            <div className="auth-section">
              {user ? (
                <div className="user-menu">
                  <div
                    className="user-avatar"
                    onClick={() => setShowProfileMenu((prev) => !prev)}
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.displayName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  {showProfileMenu && (
                    <div className="profile-dropdown" ref={profileMenuRef}>
                      <div className="profile-info">
                        <p>{user.displayName}</p>
                        <p className="user-email">{user.email}</p>
                      </div>
                      <button onClick={onProfileClick}>My Profile</button>
                      <button onClick={onLogout}>Logout</button>
                    </div>
                  )}
                </div>
              ) : (
                <button className="login-btn" onClick={handleGoogleSignIn} disabled={loading}>
                  {loading ? 'Signing in...' : 'Login with Google'}
                </button>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content hero-content-single">
          <div className="hero-text">
            <h1>More than 10 Million Students Have Said Hello to Stress-Free Studying</h1>
            <p>Start preparing for your next test!</p>
            <div className="test-buttons">
              <button
                className="test-btn"
                onClick={() => handleTestClick('SSC CGL')}
              >
                SSC CGL®
              </button>
              <button
                className="test-btn"
                onClick={() => handleTestClick('NEET')}
              >
                NEET®
              </button>
              <button
                className="test-btn"
                onClick={() => handleTestClick('RBI Grade B')}
              >
                RBI Grade B®
              </button>
              <button
                className="test-btn"
                onClick={() => handleTestClick('CLAT')}
              >
                CLAT®
              </button>
              <button
                className="test-btn"
                onClick={() => handleTestClick('IBPS PO')}
              >
                IBPS PO®
              </button>
            </div>
            <div className="additional-tests">
              <button
                className="test-btn"
                onClick={() => handleTestClick('AI Champ')}
              >
                AI Champ®
              </button>
              <button
                className="test-btn"
                onClick={() => handleTestClick('Data Scientist')}
              >
                Data Scientist®
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-icon">📝</div>
            <div className="stat-number">50K+</div>
            <div className="stat-text">Creative questions to build Streak</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">🌍</div>
            <div className="stat-number">1Million+</div>
            <div className="stat-text">students to benefit by ruthless Streak scores</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">📹</div>
            <div className="stat-number">100K+</div>
            <div className="stat-text">hours of video lessons watched</div>
          </div>
        </div>
      </section>

      {/* SSC Section */}
      <section className="ssc-section">
        <div className="ssc-container">
          <h2 className="ssc-title">
            Expert <span className="ssc-highlight">SSC</span> instruction at a fraction of the price
          </h2>
          <button className="ssc-btn">check out our self-study plans</button>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="testimonial" id="testimonials">
        <div className="testimonial-container">
          <div className="testimonial-avatar">👨‍🎓</div>
          <div className="testimonial-content">
            <p className="testimonial-text">
              "StreakPeaked seemed to be by far the best option: a program that helped me become ruthless in questions solving. Started with streak score of 5, reached 55 in 15 days."
            </p>
            <p className="testimonial-author">Arav- Student Success Story</p>
          </div>
          <button className="testimonial-btn">student testimonials</button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <div className="features-grid">
            <div className="feature-column">
              <h2>Web</h2>
              <p style={{ color: '#3C2F7F', fontSize: '1.1rem', marginBottom: '2rem' }}>
                Prep anytime from your desktop with our self-study platform
              </p>
              <ul className="feature-list">
                <li className="feature-item">
                  <div className="feature-icon">⏰</div>
                  <div className="feature-text">Thousands of timed practice questions</div>
                </li>
                <li className="feature-item">
                  <div className="feature-icon">▶️</div>
                  <div className="feature-text">guidance by experts</div>
                </li>
                <li className="feature-item">
                  <div className="feature-icon">📊</div>
                  <div className="feature-text">Track your streak progress</div>
                </li>
                <li className="feature-item">
                  <div className="feature-icon">💬</div>
                  <div className="feature-text">Friendly support team and regular discounts</div>
                </li>
              </ul>
            </div>
            <div className="feature-column">
              <h2>Mobile</h2>
              <p style={{ color: '#3C2F7F', fontSize: '1.1rem', marginBottom: '2rem' }}>
                Study on-the-go with our free mobile apps
              </p>
              <ul className="feature-list">
                <li className="feature-item">
                  <div className="feature-icon">📱</div>
                  <div className="feature-text">performance tracking</div>
                </li>
                <li className="feature-item">
                  <div className="feature-icon">✏️</div>
                  <div className="feature-text">Section wise practice</div>
                </li>
                <li className="feature-item">
                  <div className="feature-icon">👥</div>
                  <div className="feature-text">Play an opponent</div>
                </li>
                <li className="feature-item">
                  <div className="feature-icon">⭐</div>
                  <div className="feature-text">5-star ratings</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Free Resources Section */}
      <section className="free-resources">
        <div className="resources-container">
          <h2 className="resources-title">Free Prep Resources to Help You Study</h2>
          <div className="resources-grid">
            <div className="resource-card">
              <h3 className="resource-title">SSC CGL</h3>
              <p className="resource-subtitle">Practice Test</p>
            </div>
            <div className="resource-card">
              <h3 className="resource-title">NEET</h3>
              <p className="resource-subtitle">Practice Test</p>
            </div>
            <div className="resource-card">
              <h3 className="resource-title">RBI Grade B</h3>
              <p className="resource-subtitle">Practice Test</p>
            </div>
            <div className="resource-card">
              <h3 className="resource-title">IBPS PO</h3>
              <p className="resource-subtitle">Practice Test</p>
            </div>
          </div>
          <p style={{ color: '#333', fontSize: '1.1rem' }}>
            Friends, find out how StreakPeaked can help you become ruthless in conquering the exams and make it fun by competing with opponents!
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission">
        <div className="mission-container">
          <p className="mission-text">
            We believe in making our students aggressive and ruthless in exams preparation and defy all the odds.
          </p>
          <button className="mission-btn">we're hiring!</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-social">Connect with us</div>
          <div className="social-icons">
            <a href="#" className="social-icon">📧</a>
            <a href="#" className="social-icon">📘</a>
            <a href="#" className="social-icon">💼</a>
            <a href="#" className="social-icon">📺</a>
            <a href="#" className="social-icon">📷</a>
          </div>
        </div>
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">StreakPeaked</div>
            <h3>Our Products</h3>
            <ul>
              <li><a href="#">SSC CGL Prep</a></li>
              <li><a href="#">NEET Prep</a></li>
              <li><a href="#">RBI Grade B Prep</a></li>
              <li><a href="#">IBPS PO Prep</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Company</h3>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Mission</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Student Beans Discount!</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Our Blogs</h3>
            <ul>
              <li><a href="#">Company Blog</a></li>
              <li><a href="#">SSC Blog</a></li>
              <li><a href="#">NEET Blog</a></li>
              <li><a href="#">CLAT Blog</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <button className="mission-btn">meet our team</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;