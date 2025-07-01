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

function SSCCGLApp({ onBack }) {
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

  const current = filteredQuestions[index];

  if (testComplete) {
    return (
      <div className="score-screen">
        <h1>🎓 Test Complete</h1>
        <p>Streak Score: {score}</p>
        <p>Questions Attempted: {timeSpent.length}</p>
        <p>Accuracy: {((score / timeSpent.length) * 100).toFixed(1)}%</p>
        <button onClick={restartTest}>🔁 Retake Test</button>
        <button onClick={onBack} style={{ marginLeft: '10px' }}>🏠 Back to Homepage</button>
      </div>
    );
  }

  if (!filteredQuestions.length) {
    return <div style={{ padding: 20 }}>Loading questions...</div>;
  }

  return (
    <div style={{ backgroundColor: bgColor, minHeight: '100vh', padding: '30px' }}>
      <header style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1>StreakPeaked SSC CGL Practice</h1>
        <h3>Timer: {seconds}s</h3>
      </header>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <div style={{ flex: 1, maxWidth: '700px', backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px' }}>
          <h2>{current.section} ({current.level})</h2>
          <p>{current.question}</p>

          {current.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleOption(opt)}
              style={{
                margin: '10px 0',
                padding: '10px 16px',
                width: '100%',
                textAlign: 'left',
                backgroundColor: selected === opt ? (opt === current.answer ? '#16a34a' : '#dc2626') : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px'
              }}
            >
              {String.fromCharCode(65 + idx)}. {opt}
            </button>
          ))}

          <div style={{ marginTop: 20 }}>
            <button onClick={onBack}>🏠 Back to Homepage</button>
          </div>
        </div>

        {user && showChat && (
          <div style={{ width: '300px' }}>
            <ChatSidebar user={user} />
          </div>
        )}
      </div>
    </div>
  );
}

export default SSCCGLApp;
