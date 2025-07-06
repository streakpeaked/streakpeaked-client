import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from './firebaseConfig';
// For charting, use chart.js or similar, here we use a simple SVG line for demo

function PerformanceTracker({ user, onClose }) {
  const [results, setResults] = useState([]);
  const [examFilter, setExamFilter] = useState('All');

  useEffect(() => {
    const fetchResults = async () => {
      const q = query(
        collection(db, 'results'),
        where('uid', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      setResults(snapshot.docs.map(doc => doc.data()));
    };
    fetchResults();
  }, [user.uid]);

  const filtered = examFilter === 'All' ? results : results.filter(r => r.exam === examFilter);

  // Group by day/month for chart (simple average streak/time per day)
  const chartData = {};
  filtered.forEach(r => {
    const date = (new Date(r.timestamp)).toLocaleDateString();
    if (!chartData[date]) chartData[date] = { streaks: [], times: [] };
    chartData[date].streaks.push(r.streakScore);
    chartData[date].times.push(r.avgTime);
  });
  const labels = Object.keys(chartData).reverse();
  const avgStreaks = labels.map(date => (
    chartData[date].streaks.reduce((a, b) => a + b, 0) / chartData[date].streaks.length
  ));
  const avgTimes = labels.map(date => (
    chartData[date].times.reduce((a, b) => a + b, 0) / chartData[date].times.length
  ));

  const maxStreak = Math.max(...filtered.map(r => r.streakScore), 0);
  const maxStreakObj = filtered.find(r => r.streakScore === maxStreak);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, zIndex: 2000,
      width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff', borderRadius: '12px', padding: '32px', minWidth: 500, maxHeight: '90vh', overflowY: 'auto'
      }}>
        <h2 style={{ margin: 0, marginBottom: 16 }}>Performance Tracker</h2>
        <div style={{ marginBottom: 18 }}>
          <label>
            Filter by Exam:
            <select value={examFilter} onChange={e => setExamFilter(e.target.value)} style={{ marginLeft: 10 }}>
              <option value="All">All</option>
              <option value="SSC CGL">SSC CGL</option>
              <option value="NEET">NEET</option>
              <option value="RBI Grade B">RBI Grade B</option>
              {/* add more exams as you add support */}
            </select>
          </label>
        </div>
        <div>
          <b>Maximum Streak:</b> {maxStreak} 
          {maxStreakObj ? ` (on ${new Date(maxStreakObj.timestamp).toLocaleString()}, ${maxStreakObj.exam})` : ''}
        </div>
        <div style={{ margin: '18px 0' }}>
          <b>Results History:</b>
          <ul>
            {filtered.map((r, i) => (
              <li key={i}>
                {new Date(r.timestamp).toLocaleString()} - {r.exam} - Streak: {r.streakScore} - Avg Time: {r.avgTime?.toFixed(2)}s
              </li>
            ))}
          </ul>
        </div>
        <div>
          <b>Average Streak Score (line):</b>
          <SimpleLineChart labels={labels} data={avgStreaks} color="#8B5FBF" />
          <b>Average Time per Question (line):</b>
          <SimpleLineChart labels={labels} data={avgTimes} color="#10B981" />
        </div>
        <button
          style={{ background: '#e0e7ef', color: '#222', border: 'none', borderRadius: 6, padding: '8px 18px', marginTop: 20 }}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

// Very simple SVG line chart for demonstration
function SimpleLineChart({ labels, data, color }) {
  if (!labels.length || !data.length) return <div>No data</div>;
  const w = 320, h = 70;
  const max = Math.max(...data), min = Math.min(...data);
  const points = data.map((d, i) => [
    (i / (data.length - 1 || 1)) * (w - 16) + 8,
    h - 10 - ((d - min) / Math.max(max - min, 1)) * (h - 28)
  ]);
  const path = points.map((p, i) => (i === 0 ? `M` : `L`) + p.join(',')).join(' ');
  return (
    <svg width={w} height={h} style={{ background: '#f3f3fb', margin: '8px 0' }}>
      <polyline points={points.map(p => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth="2" />
      {points.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={3} fill={color} />
      ))}
    </svg>
  );
}

export default PerformanceTracker;