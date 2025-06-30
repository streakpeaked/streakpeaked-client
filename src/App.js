import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth, provider } from './firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import ChatSidebar from './ChatSidebar';
import './App.css';

let streakAudio;

const playStreakMusic = () => {
  if (!streakAudio) {
    streakAudio = new Audio('/music.mp3');
    streakAudio.loop = true;
    streakAudio.play().catch((e) => console.log("Audio failed:", e));
  }
};

const stopStreakMusic = () => {
  if (streakAudio) {
    streakAudio.pause();
    streakAudio.currentTime = 0;
    streakAudio = null;
  }
};

function App() {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState([]);
  const [bgColor, setBgColor] = useState('#f0f8ff');
  const [seconds, setSeconds] = useState(0);
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [sectionFilter, setSectionFilter] = useState("All");
  const [testComplete, setTestComplete] = useState(false);
  const [user, setUser] = useState(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      const snapshot = await getDocs(collection(db, "questions"));
      let qList = snapshot.docs.map(doc => doc.data()).filter(q => !q.image);
      qList = qList.sort(() => Math.random() - 0.5);
      setQuestions(qList);
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    const result = questions.filter(q => {
      const matchSection = sectionFilter === "All" || q.section === sectionFilter;
      const matchDifficulty = difficultyFilter === "All" || q.level === difficultyFilter;
      return matchSection && matchDifficulty;
    });
    setFilteredQuestions(result);
    setIndex(0);
    setScore(0);
    setTimeSpent([]);
    setTestComplete(false);
  }, [questions, difficultyFilter, sectionFilter]);

  useEffect(() => {
    if (testComplete) playStreakMusic();
    return () => stopStreakMusic();
  }, [testComplete]);

  useEffect(() => {
    if (testComplete) return;
    const timer = setInterval(() => {
      const sec = Math.floor((Date.now() - startTime) / 1000);
      setSeconds(sec);
      if (sec < 10) setBgColor('#f0f8ff');
      else if (sec < 20) setBgColor('#dbeafe');
      else if (sec < 30) setBgColor('#e5e7eb');
      else if (sec < 40) setBgColor('#fcd34d');
      else if (sec < 50) setBgColor('#f87171');
      else {
        const blink = sec % 2 === 0;
        setBgColor(blink ? '#ef4444' : '#000');
        if (sec === 51) speak("You may wanna skip this question");
        if (sec === 56) speak("It's eating your time");
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, testComplete]);

  const speak = (msg) => {
    const utter = new SpeechSynthesisUtterance(msg);
    window.speechSynthesis.speak(utter);
  };

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => setUser(result.user))
      .catch((error) => console.log("Login error", error));
  };

  const handleOption = (opt) => {
    if (testComplete) return;
    setSelected(opt);
    const endTime = Date.now();
    const duration = Math.floor((endTime - startTime) / 1000);
    const correct = opt === filteredQuestions[index].answer;
    if (correct) setScore(prev => prev + 1);
    setTimeSpent(prev => [...prev, {
      section: filteredQuestions[index].section,
      level: filteredQuestions[index].level,
      time: duration,
      correct
    }]);
    setTimeout(() => {
      setSelected(null);
      if (!correct || index + 1 >= filteredQuestions.length) {
        setTestComplete(true);
      } else {
        setIndex(index + 1);
        setStartTime(Date.now());
        setSeconds(0);
      }
    }, 1000);
  };

  const getMatrix = () => {
  const matrix = {};
  timeSpent.forEach(item => {
    const band = item.time < 10 ? '0-10s' : item.time < 20 ? '10-20s' : '20s+';
    const key = `${item.section}_${item.level}_${band}`;
    matrix[key] = (matrix[key] || 0) + 1;
  });
  return matrix;
};

  const restartTest = () => {
    stopStreakMusic();
    setIndex(0);
    setScore(0);
    setTimeSpent([]);
    setTestComplete(false);
    setStartTime(Date.now());
    setSeconds(0);
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const result = shuffled.filter(q => {
      const matchSection = sectionFilter === "All" || q.section === sectionFilter;
      const matchDifficulty = difficultyFilter === "All" || q.level === difficultyFilter;
      return matchSection && matchDifficulty;
    });
    setFilteredQuestions(result);
  };

  if (filteredQuestions.length === 0) {
    return <div style={{ padding: 20 }}>Loading questions or no matching questions for selected filters.</div>;
  }

  if (testComplete) {
    return (
      <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '30px', fontFamily: 'Segoe UI, sans-serif' }}>
        <div style={{ maxWidth: '800px', margin: 'auto', backgroundColor: 'white', borderRadius: '12px', padding: '40px', boxShadow: '0 0 15px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '20px', color: '#1e3a8a' }}>🎓 Test Summary</h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', marginBottom: '20px' }}>
            <div><strong>Streak Score:</strong> {score}</div>
            <div><strong>Questions Attempted:</strong> {timeSpent.length}</div>
            <div><strong>Accuracy:</strong> {((score / timeSpent.length) * 100).toFixed(1)}%</div>
          </div>
          <hr style={{ margin: '20px 0' }} />
          <div>
            <h3 style={{ color: '#2563eb' }}>📊 Score Matrix</h3>
            <pre style={{ backgroundColor: '#f3f4f6', padding: '10px', borderRadius: '8px' }}>{JSON.stringify(getMatrix(), null, 2)}</pre>
          </div>
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ color: '#2563eb' }}>💡 Feedback</h3>
            <p>{`You're doing well! Keep practicing and improve time across all sections.`}</p>
          </div>
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button onClick={restartTest} style={{ backgroundColor: '#10b981', color: 'white', padding: '12px 24px', fontSize: '16px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s ease' }}>🔁 Retake Test</button>
          </div>
        </div>
      </div>
    );
  }

  const current = filteredQuestions[index];

  return (
    <div style={{ backgroundColor: bgColor, minHeight: '100vh', padding: '30px', fontFamily: 'Segoe UI, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <img src="/logo.png" alt="Logo" style={{ height: '60px', marginBottom: '10px' }} />
        <h1 style={{ fontSize: '28px', color: '#1e3a8a' }}>StreakPeaked SSC CGL Practice</h1>
      </header>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <div style={{ flex: 1, maxWidth: '700px', backgroundColor: '#ffffff', color: '#000', padding: '30px', borderRadius: '12px', boxShadow: '0 0 12px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '22px', marginBottom: '10px' }}>{current.section} ({current.level})</h2>
          <p style={{ fontSize: '18px' }}>{current.question}</p>

          <div style={{ marginBottom: 20, marginTop: 20 }}>
            <label>
              Difficulty:
              <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
                <option value="All">All</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </label>
            <label style={{ marginLeft: 20 }}>
              Section:
              <select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
                <option value="All">All</option>
                <option value="Maths">Maths</option>
                <option value="GK">GK</option>
                <option value="Reasoning">Reasoning</option>
                <option value="English">English</option>
              </select>
            </label>
          </div>

          {current.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleOption(opt)}
              style={{
                margin: '10px 10px 0 0',
                padding: '10px 16px',
                backgroundColor: selected === opt ? (opt === current.answer ? '#16a34a' : '#dc2626') : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background-color 0.3s ease'
              }}
            >
              {opt}
            </button>
          ))}

          {!user && (
            <p style={{ marginTop: 30, fontSize: '14px' }}>
              Want to chat with others and save your history? <button onClick={signInWithGoogle}>Login with Google</button>
            </p>
          )}
        </div>

        {user && showChat && (
          <div style={{ width: '300px', backgroundColor: '#f3f4f6', borderRadius: '12px', padding: '20px', boxShadow: '0 0 8px rgba(0,0,0,0.1)' }}>
            <ChatSidebar user={user} />
          </div>
        )}
      </div>

      {user && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button onClick={() => setShowChat(!showChat)} style={{ padding: '10px 20px', fontSize: '14px', backgroundColor: '#1e40af', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            {showChat ? 'Hide Chat' : 'Show Chat'}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
