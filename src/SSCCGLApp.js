import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

// ... inside your component, after test is complete
useEffect(() => {
  if (testComplete && user) {
    // Save result to Firestore
    addDoc(collection(db, 'results'), {
      uid: user.uid,
      exam: 'SSC CGL',
      streakScore: score,
      avgTime: timeSpent.length > 0 ? (timeSpent.reduce((a, b) => a + b.time, 0) / timeSpent.length) : 0,
      timestamp: Date.now(),
      details: timeSpent
    });
  }
  // eslint-disable-next-line
}, [testComplete]);