import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [seconds, setSeconds] = useState(0);
  const [bgColor, setBgColor] = useState('#ADD8E6');

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
      if (seconds < 10) setBgColor('#ADD8E6');
      else if (seconds < 20) setBgColor('#1E90FF');
      else if (seconds < 30) setBgColor('#B0B0B0');
      else if (seconds < 40) setBgColor('#FFA500');
      else if (seconds < 50) setBgColor('#FF0000');
      else {
        const blink = seconds % 2 === 0;
        setBgColor(blink ? '#FF0000' : '#000');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  return (
    <div style={{ backgroundColor: bgColor, height: '100vh', color: 'white', padding: '20px' }}>
      <h1>Timer: {seconds}s</h1>
      <p>Color will change as time increases</p>
    </div>
  );
}

export default App;
