import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth, provider } from './firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import './App.css';

const playStreakMusic = () => {
  const audio = new Audio('/music.mp3');
  audio.play().catch((e) => console.log("Audio failed:", e));
};

function App() {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [mode, setMode] = useState('Practice');
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState([]);
  const [bgColor, setBgColor] = useState('#ADD8E6');
  const [feedback, setFeedback] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [sectionFilter, setSectionFilter] = useState("All");
  const [testComplete, setTestComplete] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      const snapshot = await getDocs(collection(db, "questions"));
      const qList = snapshot.docs.map(doc => doc.data()).filter(q => !q.image);
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
    if (testComplete) return;
    const timer = setInterval(() => {
      const sec = Math.floor((Date.now() - startTime) / 1000);
      setSeconds(sec);
      if (sec < 10) setBgColor('#ADD8E6');
      else if (sec < 20) setBgColor('#1E90FF');
      else if (sec < 30) setBgColor('#B0B0B0');
      else if (sec < 40) setBgColor('#FFA500');
      else if (sec < 50) setBgColor('#FF0000');
      else {
        const blink = sec % 2 === 0;
        setBgColor(blink ? '#FF0000' : '#000');
        if (sec === 51) speak("You may wanna skip this question");
        if (sec === 56) speak("It's eating your time");
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, testComplete]);

  useEffect(() => {
    if (testComplete) {
      playStreakMusic();
    }
  }, [testComplete]);

  const speak = (msg) => {
    const utter = new SpeechSynthesisUtterance(msg);
    window.speechSynthesis.speak(utter);
  };

  const signInWithGoogle = () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      setUser(result.user);
    })
    .catch((error) => {
      console.log("Login error", error);
    });
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

  const getFeedback = () => {
    const correctBySection = {};
    timeSpent.forEach(item => {
      if (item.correct) {
        correctBySection[item.section] = (correctBySection[item.section] || 0) + 1;
      }
    });

    const strong = Object.entries(correctBySection).filter(([sec, val]) => val >= 10);
    const weak = Object.entries(correctBySection).filter(([sec, val]) => val < 3);

    const strongMsg = strong.length > 0 ? `You did well in ${strong.map(s => s[0]).join(", ")} by answering more than 10 correctly.` : "";
    const weakMsg = weak.length > 0 ? `You need to improve in ${weak.map(s => s[0]).join(", ")} where less than 3 were correct.` : "";

    return `${strongMsg} ${weakMsg} Total score: ${score}/${timeSpent.length}`;
  };

  if (filteredQuestions.length === 0) {
    return <div style={{ padding: 20 }}>Loading questions or no matching questions for selected filters.</div>;
  }

  if (testComplete) {
    return (
      <div style={{ backgroundColor: '#111', color: 'white', minHeight: '100vh', padding: '40px' }}>
        <div style={{ maxWidth: '700px', margin: 'auto', backgroundColor: '#222', padding: '30px', borderRadius: '12px' }}>
          <h2>Test Complete ({mode} Mode)</h2>
          <p>Streak Score: {score}</p>
          <p>Total Questions Attempted: {timeSpent.length}</p>
          <p>Overall Score: {score}/{timeSpent.length}</p>
          <h4>Feedback:</h4>
          <p>{getFeedback()}</p>
          <h4>Score Matrix:</h4>
          <pre>{JSON.stringify(getMatrix(), null, 2)}</pre>
        </div>
      </div>
    );
  }

  const current = filteredQuestions[index];

if (!user) {
  return (
    <div style={{ padding: 30, textAlign: 'center' }}>
      <h2>Welcome to StreakPeaked</h2>
      <button onClick={signInWithGoogle}>Login with Google</button>
    </div>
  );
  }
  return (
    <div style={{ backgroundColor: bgColor, minHeight: '100vh', padding: '40px' }}>
      <div style={{ maxWidth: '700px', margin: 'auto', backgroundColor: 'white', color: '#000', padding: '30px', borderRadius: '12px', boxShadow: '0 0 12px rgba(0,0,0,0.2)' }}>
        <h1>{mode} Mode | Timer: {seconds}s</h1>
        <button onClick={() => setMode(mode === 'Practice' ? 'Test' : 'Practice')}>
          Switch to {mode === 'Practice' ? 'Test' : 'Practice'} Mode
        </button>

        <div style={{ marginTop: 20, marginBottom: 20 }}>
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

        <h2>{current.section} ({current.level})</h2>
        <p>{current.question}</p>
        {current.options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleOption(opt)}
            style={{
              margin: 10,
              padding: 10,
              backgroundColor: selected === opt ? (opt === current.answer ? 'green' : 'red') : 'gray',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              minWidth: '60px'
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;