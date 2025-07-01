import React, { useState } from 'react';
import SSCCGLApp from './SSCCGLApp';
import './App.css';

function App() {
  const [selectedExam, setSelectedExam] = useState(null);

  if (selectedExam === 'SSC CGL') {
    return <SSCCGLApp onBack={() => setSelectedExam(null)} />;
  }

  return (
    <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'Segoe UI, sans-serif' }}>
      <h1 style={{ fontSize: '36px', marginBottom: '40px' }}>Welcome to StreakPeaked</h1>
      <p style={{ fontSize: '18px', marginBottom: '30px' }}>Choose your exam to begin your journey</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '30px' }}>
        {['SSC CGL', 'NEET', 'RBI Grade B'].map(exam => (
          <button
            key={exam}
            onClick={() => setSelectedExam(exam)}
            style={{
              padding: '20px 40px',
              fontSize: '18px',
              borderRadius: '12px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            {exam}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
