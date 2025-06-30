import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import db from './firebaseConfig';
import './App.css';

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

  useEffect(() => {
    const fetchQuestions = async () => {
      const snapshot = await getDocs(collection(db, "questions"));
      const qList = snapshot.docs.map(doc => doc.data());
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
  }, [questions, difficultyFilter, sectionFilter]);

  useEffect(() => {
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
  }, [startTime]);

  const speak = (msg) => {
    const utter = new SpeechSynthesisUtterance(msg);
    window.speechSynthesis.speak(utter);
  };

  const handleOption = (opt) => {
    setSelected(opt);
    const endTime = Date.now();
    const duration = Math.floor((endTime - startTime) / 1000);

    const correct = opt === filteredQuestions[index].answer;
    if (correct) setScore(score + 1);

    setTimeSpent([...timeSpent, {
      section: filteredQuestions[index].section,
      level: filteredQuestions[index].level,
      time: duration
    }]);

    setTimeout(() => {
      setSelected(null);
      setIndex(index + 1);
      setStartTime(Date.now());
      setSeconds(0);
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
    const matrix = getMatrix();
    return `You did well in Maths Easy <10s, and struggled in GK Medium 20s+. Total score: ${score}/${filteredQuestions.length}`;
  };

  if (filteredQuestions.length === 0) {
    return <div style={{ padding: 20 }}>Loading questions or no matching questions for selected filters.</div>;
  }

  if (index >= filteredQuestions.length) {
    return (
      <div style={{ padding: 20, background: '#111', color: 'white' }}>
        <h2>Test Complete ({mode} Mode)</h2>
        <p>Score: {score} / {filteredQuestions.length}</p>
        <h4>Feedback:</h4>
        <p>{getFeedback()}</p>
        <h4>Score Matrix:</h4>
        <pre>{JSON.stringify(getMatrix(), null, 2)}</pre>
        <audio autoPlay>
          <source src="https://upload.wikimedia.org/wikipedia/commons/b/b4/Bayern_Munich_goal_song.ogg" type="audio/ogg" />
        </audio>
      </div>
    );
  }

  const current = filteredQuestions[index];

  return (
    <div style={{ backgroundColor: bgColor, height: '100vh', color: 'white', padding: '20px' }}>
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
            backgroundColor: selected === opt ? (opt === current.answer ? 'green' : 'red') : 'gray'
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default App;
