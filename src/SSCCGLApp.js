import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';
import ChatSidebar from './ChatSidebar';
import './App.css';
import { useNavigate } from 'react-router-dom';

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

function SSCCGLApp({ user, setUser }) {
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
  const [showChat, setShowChat] = useState(false);
  const navigate = useNavigate();

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
    const sections = ['GK', 'Maths', 'Reasoning', 'English'];
    const levels = ['Easy', 'Medium', 'Hard'];
    const matrix = {};
    sections.forEach(sec => {
      matrix[sec] = { Easy: 0, Medium: 0, Hard: 0 };
    });
    timeSpent.forEach(item => {
      if (matrix[item.section] && matrix[item.section][item.level] !== undefined) {
        matrix[item.section][item.level]++;
      }
    });
    return matrix;
  };

  const renderMatrixTable = () => {
    const matrix = getMatrix();
    const levels = ['Easy', 'Medium', 'Hard'];
    return (
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
        <thead>
          <tr style={{ backgroundColor: '#e5e7eb' }}>
            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Section</th>
            {levels.map(level => (
              <th key={level} style={{ border: '1px solid #ccc', padding: '8px' }}>{level}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.entries(matrix).map(([section, row]) => (
            <tr key={section}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{section}</td>
              {levels.map(level => (
                <td key={level} style={{ border: '1px solid #ccc', padding: '8px' }}>{row[level]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const getCustomFeedback = () => {
    let baseFeedback = "";
    if (score < 10) {
      baseFeedback = "Your streak score is very low, not even crossing 10. Hope you got a reality check. Now buckle up and grind till you make this streak above 20.";
    } else if (score < 20) {
      baseFeedback = "Your streak score is decent but not crossing 20. Hope you don't want to take things lightly. Check where you went wrong and improve the streak over 30.";
    } else if (score < 40) {
      baseFeedback = "You are doing well! Keep the game tight, take streak beyond 40 now. Don't be lazy like CAT.";
    } else {
      baseFeedback = "You are right there, dark horse! Nail it, then ace it and rock it. Hit consistent 100+ streak now. madMODEon!";
    }

    const sectionCorrect = {};
    timeSpent.forEach(item => {
      if (item.correct) {
        sectionCorrect[item.section] = (sectionCorrect[item.section] || 0) + 1;
      }
    });

    const strongSections = Object.entries(sectionCorrect)
      .filter(([section, correct]) => correct >= 10)
      .map(([section]) => section);

    const strengthMsg = strongSections.length > 0
      ? `\nYour ${strongSections.join(", ")} section${strongSections.length > 1 ? 's are' : ' is'} your strength. Keep it tight and double drill on other weak sections!`
      : "";

    return baseFeedback + strengthMsg;
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

  const Header = () => (
    <header style={{ backgroundColor: '#16a34a', color: 'white', padding: '16px', textAlign: 'center', borderRadius: '8px' }}>
      <h1 style={{ margin: 0, fontSize: '24px' }}>StreakPeaked SSC CGL Practice</h1>
      <button onClick={() => navigate('/')} style={{ marginTop: 8, backgroundColor: 'white', color: '#16a34a', padding: '6px 12px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
        ← Back to Home
      </button>
    </header>
  );

  const Footer = () => (
    <footer style={{ backgroundColor: '#1f2937', color: 'white', padding: '12px', textAlign: 'center', marginTop: 30, borderRadius: '6px' }}>
      <p>© 2025 StreakPeaked | Contact: support@streakpeaked.io | Gurgaon, India</p>
    </footer>
  );

  return (
    <div style={{ backgroundColor: bgColor, minHeight: '100vh', padding: '20px', fontFamily: 'Segoe UI, sans-serif' }}>
      <Header />

      {testComplete ? (
        <div style={{ maxWidth: '800px', margin: '40px auto', backgroundColor: 'white', borderRadius: '12px', padding: '40px', boxShadow: '0 0 15px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '32px', color: '#1e3a8a' }}>🎓 Test Summary</h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', margin: '20px 0' }}>
            <div><strong>Streak Score:</strong> {score}</div>
            <div><strong>Questions Attempted:</strong> {timeSpent.length}</div>
            <div><strong>Accuracy:</strong> {((score / timeSpent.length) * 100).toFixed(1)}%</div>
          </div>
          <h3 style={{ color: '#2563eb' }}>📊 Score Matrix</h3>
          {renderMatrixTable()}
          <h3 style={{ color: '#2563eb', marginTop: '20px' }}>💡 Feedback</h3>
          <p>{getCustomFeedback()}</p>
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button onClick={restartTest} style={{ backgroundColor: '#10b981', color: 'white', padding: '12px 24px', fontSize: '16px', borderRadius: '8px', cursor: 'pointer' }}>🔁 Retake Test</button>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: '800px', margin: '30px auto', backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 0 12px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px' }}>Timer: {seconds}s</h2>
          <div style={{ marginBottom: 20 }}>
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

          <h3>{current.section} ({current.level})</h3>
          <p>{current.question}</p>

          {current.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleOption(opt)}
              style={{
                margin: '10px 0',
                padding: '10px 16px',
                backgroundColor: selected === opt ? (opt === current.answer ? '#16a34a' : '#dc2626') : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left'
              }}
            >
              {String.fromCharCode(65 + idx)}. {opt}
            </button>
          ))}

          {!user && (
            <p style={{ marginTop: 30, fontSize: '14px' }}>
              Want to chat with others and save your history? <strong>Please login from homepage</strong>
            </p>
          )}

          {user && showChat && (
            <div style={{ marginTop: 30 }}>
              <ChatSidebar user={user} />
            </div>
          )}

          {user && (
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button onClick={() => setShowChat(!showChat)} style={{ padding: '10px 20px', fontSize: '14px', backgroundColor: '#1e40af', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                {showChat ? 'Hide Chat' : 'Show Chat'}
              </button>
            </div>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}

export default SSCCGLApp;