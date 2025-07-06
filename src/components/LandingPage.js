import React, { useEffect, useState } from 'react';
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
          header.style.background = 'rgba(107, 70, 193, 0.95)';
        } else {
          header.style.background = 'linear-gradient(135deg, #8B5FBF 0%, #6B46C1 100%)';
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

    // Cleanup function
    return () => {
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', animateStats);
      buttons.forEach(button => {
        button.removeEventListener('mouseenter', handleButtonHover);
        button.removeEventListener('mouseleave', handleButtonHover);
      });
    };
  }, []);

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
                  <button className="profile-btn" onClick={onProfileClick}>My Profile</button>
                  <button className="logout-btn" onClick={onLogout}>Logout</button>
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
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Be more ruthless and aggressive in exam preparation with STREAKs. Let's not sit in the exam but conquer it!</h1>
            <p>Start preparing for your next test!</p>
            <div className="test-buttons">
              <button className="test-btn" onClick={() => onExamSelect && onExamSelect('ssc-cgl')}>SSC CGL®</button>
              <button className="test-btn" onClick={() => onExamSelect && onExamSelect('neet')}>NEET®</button>
              <button className="test-btn" onClick={() => onExamSelect && onExamSelect('rbi-grade-b')}>RBI Grade B®</button>
              <button className="test-btn">CLAT®</button>
              <button className="test-btn">RRB®</button>
              <button className="test-btn">IBPS PO®</button>
            </div>
            <div className="additional-tests">
              <button className="test-btn">AI Champ®</button>
              <button className="test-btn">Data Scientist®</button>
            </div>
          </div>
          <div className="hero-image">
            <div className="student-image">
              👩‍🎓 Student Success Image
            </div>
          </div>
        </div>
      </section>

      {/* ...rest of your sections remain unchanged... */}
      {/* Stats, SSC, Testimonial, Features, Free Resources, Mission, Footer */}
    </div>
  );
};

export default LandingPage;