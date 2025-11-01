import React, { useEffect, useState, useRef } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // Adjust path as needed
import './LandingPage.css';

const SOCIALS = [
  { icon: '📧', name: 'Email', link: '#' },
  { icon: '📘', name: 'Facebook', link: '#' },
  { icon: '💼', name: 'LinkedIn', link: '#' },
  { icon: '📺', name: 'YouTube', link: '#' },
  { icon: '📷', name: 'Instagram', link: '#' },
];

const LandingPage = ({ user, onLogout, onExamSelect, onProfileClick }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const profileMenuRef = useRef(null);
  const [showModeModal, setShowModeModal] = useState(false); //Nov2

  // Google login logic
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      alert('Google login failed');
    } finally {
      setLoading(true);
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
     // return;
    }
    if (testType === 'SSC CGL') {
      setShowModeModal(true);//Nov2
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
      <section className="hero hero-bg-wallpaper">
        <div className="hero-content hero-content-single">
          <div className="hero-text">
            <h1>Crack Exams with Ruthless STREAKs </h1>
            <h1>Compete LIVE. Dominate the Leaderboard </h1>            
            <p>Login & Start with your test STREAK!</p>
            <div className="test-buttons">
              <button
                className="pill-btn active"
                onClick={() => handleTestClick('SSC CGL')}
              >
                SSC CGL®
              </button>
              <button
                className="pill-btn"
                onClick={() => handleTestClick('NEET')}
              >
                NEET®
              </button>
              <button
                className="pill-btn"
                onClick={() => handleTestClick('RBI Grade B')}
              >
                RBI Grade B®
              </button>
              <button
                className="pill-btn"
                onClick={() => handleTestClick('CLAT')}
              >
                CLAT®
              </button>
              <button
                className="pill-btn"
                onClick={() => handleTestClick('IBPS PO')}
              >
                IBPS PO®
              </button>
            </div>
            <div className="additional-tests">
              <button
                className="pill-btn"
                onClick={() => handleTestClick('Learn AI')}
              >
                Learn AI®
              </button>
              <button
                className="pill-btn"
                onClick={() => handleTestClick('Learn Data Science')}
              >
                Learn Data Science®
              </button>
              <button
                className="pill-btn"
                onClick={() => handleTestClick('Build AI Agents')}
              >
                Build AI Agents®
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
            <div className="stat-text">Creative questions to build genuine STREAKs</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">🌍</div>
            <div className="stat-number">1Mn+</div>
            <div className="stat-text">Students to benefit by ruthless Streak scores</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">📹</div>
            <div className="stat-number">10K+</div>
            <div className="stat-text">Competive users to challenge each other in live STREAK competition</div>
          </div>
        </div>
      </section>

      {/* SSC Section */}
      <section className="ssc-section">
        <div className="ssc-container">
          <h2 className="ssc-title">
            Expert to share how to ruthlessly increase<span className="ssc-highlight"> EXAM STREAK SCORES</span> and practical instructions at a fraction of the price
          </h2>
          <button className="ssc-btn">check out STREAK maximizer roadmap and connect to an expert</button>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="testimonial" id="testimonials">
        <div className="testimonial-container">
          <div className="testimonial-avatar">
            <div className="testimonial-icon">🎓</div>
          </div>
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
            We believe in making our students aggressive and ruthless in exams preparation and teach the strategic & tactical war like approach to exams
          </p>
          <button className="mission-btn">we're hiring!</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-social">Connect with us</div>
          <div className="social-icons">
            {SOCIALS.map((s, i) => (
              <a
                key={s.name}
                href={s.link}
                className="social-icon"
                target="_blank"
                rel="noopener noreferrer"
                data-tooltip={s.name}
              >
                {s.icon}
              </a>
            ))}
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
            <button className="mission-btn">Meet our team</button>
          </div>
        </div>
      </footer>

      {showModeModal && (
        <ModeSelectModal
          onClose={() => setShowModeModal(false)}
          onSelectMode={(mode, timeLimit) => {
            setShowModeModal(false);
            onExamSelect('ssc-cgl', { mode, timeLimit });
          }}
        />
      )}
    </div>
  );
};

export default LandingPage;