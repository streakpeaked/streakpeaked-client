import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import SSCCGLApp from './SSCCGLApp';
import { auth, provider } from './firebaseConfig';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import './App.css';

const HomePage = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    signInWithPopup(auth, provider)
      .then(result => setUser(result.user))
      .catch(err => console.error("Login error:", err));
  };

  const handleLogout = () => {
    signOut(auth).then(() => setUser(null));
  };

  return (
    <div style={{ fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f0fdf4', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ backgroundColor: '#16a34a', color: 'white', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>StreakPeaked</h1>
        <nav>
          {user ? (
            <>
              <span style={{ marginRight: 10 }}>Welcome, {user.displayName}</span>
              <button onClick={handleLogout} style={navBtnStyle}>Logout</button>
            </>
          ) : (
            <button onClick={handleLogin} style={navBtnStyle}>Login with Google</button>
          )}
        </nav>
      </header>

      <main style={{ flex: 1, padding: '40px 20px' }}>
        <section style={{ textAlign: 'center', marginBottom: 50 }}>
          <h2 style={{ fontSize: '28px', marginBottom: 10 }}>Choose Your Exam</h2>
          <p style={{ fontSize: '16px', color: '#4b5563' }}>Start practicing with exam-focused test experiences</p>
        </section>

        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '30px' }}>
          <ExamCard title="SSC CGL" color="#1d4ed8" onClick={() => navigate('/ssc-cgl')} />
          <ExamCard title="NEET" color="#059669" />
          <ExamCard title="RBI Grade B" color="#7c3aed" />
        </div>

        <section style={{ marginTop: 80, padding: '30px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: 15 }}>Why StreakPeaked?</h3>
          <ul style={{ listStyle: 'none', paddingLeft: 0, color: '#374151', fontSize: '16px' }}>
            <li>✅ Real-time streak-based practice</li>
            <li>✅ Instant feedback & visual analytics</li>
            <li>✅ Personalized improvement suggestions</li>
            <li>✅ Smart timer and section-wise insights</li>
          </ul>
        </section>
      </main>

      <footer style={{ backgroundColor: '#1f2937', color: 'white', padding: '20px 40px', textAlign: 'center' }}>
        <p>© 2025 StreakPeaked | Contact: support@streakpeaked.io | Gurgaon, India</p>
      </footer>
    </div>
  );
};

const ExamCard = ({ title, color, onClick }) => (
  <div
    onClick={onClick}
    style={{
      cursor: onClick ? 'pointer' : 'not-allowed',
      width: '220px',
      height: '130px',
      backgroundColor: color,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '10px',
      fontSize: '20px',
      fontWeight: '600',
      transition: 'transform 0.2s ease',
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
  >
    {title}
  </div>
);

const navBtnStyle = {
  backgroundColor: '#ffffff22',
  color: 'white',
  padding: '8px 16px',
  border: '1px solid white',
  borderRadius: '5px',
  cursor: 'pointer',
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage user={user} setUser={setUser} />} />
        <Route path="/ssc-cgl" element={<SSCCGLApp user={user} setUser={setUser} />} />
      </Routes>
    </Router>
  );
}

export default App;