// Enhanced firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  // Your Firebase configuration
  apiKey: "AIzaSyB4B05pFDNjzNk7isUPR9z6OVQzhkJypjg",
  authDomain: "streakpeaked-auth.firebaseapp.com",
  databaseURL: "https://streakpeaked-auth-default-rtdb.firebaseio.com",
  projectId: "streakpeaked-auth",
  storageBucket: "streakpeaked-auth.appspot.com",
  messagingSenderId: "253188628591",
  appId: "1:253188628591:web:cf7965b311a86177d46d9a",
  measurementId: "G-NSZB6E7LF2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Google Auth Provider
const provider = new GoogleAuthProvider();

// Authentication Functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Create or update user profile
    await createOrUpdateUserProfile(user);
    
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// User Profile Functions
export const createOrUpdateUserProfile = async (user) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // Create new user profile
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        phone: '',
        dateOfBirth: '',
        address: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      // Update existing profile with latest info
      await updateDoc(userRef, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      throw new Error('User profile not found');
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Score Functions
export const saveUserScore = async (scoreData) => {
  try {
    const scoresRef = collection(db, 'scores');
    const docRef = await addDoc(scoresRef, {
      ...scoreData,
      createdAt: new Date().toISOString()
    });
    
    // Update user's best scores
    await updateUserBestScores(scoreData.userId, scoreData);
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving score:', error);
    throw error;
  }
};

export const getUserScores = async (userId, examType = null, limit_count = 50) => {
  try {
    let q = query(
      collection(db, 'scores'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    if (examType) {
      q = query(
        collection(db, 'scores'),
        where('userId', '==', userId),
        where('examType', '==', examType),
        orderBy('createdAt', 'desc')
      );
    }
    
    if (limit_count) {
      q = query(q, limit(limit_count));
    }
    
    const querySnapshot = await getDocs(q);
    const scores = [];
    
    querySnapshot.forEach((doc) => {
      scores.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return scores;
  } catch (error) {
    console.error('Error getting user scores:', error);
    throw error;
  }
};

export const updateUserBestScores = async (userId, scoreData) => {
  try {
    const bestScoresRef = doc(db, 'bestScores', userId);
    const bestScoresDoc = await getDoc(bestScoresRef);
    
    let bestScores = {};
    if (bestScoresDoc.exists()) {
      bestScores = bestScoresDoc.data();
    }
    
    const examType = scoreData.examType;
    const currentBest = bestScores[examType] || { streakScore: 0, timestamp: null };
    
    // Update if current score is better
    if (scoreData.streakScore > currentBest.streakScore) {
      bestScores[examType] = {
        streakScore: scoreData.streakScore,
        timestamp: scoreData.timestamp,
        totalTime: scoreData.totalTime,
        accuracy: scoreData.accuracy,
        questionsAttempted: scoreData.questionsAttempted,
        correctAnswers: scoreData.correctAnswers,
        averageTimePerQuestion: scoreData.averageTimePerQuestion
      };
      
      await setDoc(bestScoresRef, bestScores);
    }
  } catch (error) {
    console.error('Error updating best scores:', error);
    throw error;
  }
};

export const getUserBestScores = async (userId) => {
  try {
    const bestScoresRef = doc(db, 'bestScores', userId);
    const bestScoresDoc = await getDoc(bestScoresRef);
    
    if (bestScoresDoc.exists()) {
      return bestScoresDoc.data();
    } else {
      return {};
    }
  } catch (error) {
    console.error('Error getting best scores:', error);
    throw error;
  }
};

// Performance Analytics Functions
export const getUserPerformanceAnalytics = async (userId, examType = null, days = 30) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    let q = query(
      collection(db, 'scores'),
      where('userId', '==', userId),
      where('createdAt', '>=', startDate.toISOString()),
      where('createdAt', '<=', endDate.toISOString()),
      orderBy('createdAt', 'asc')
    );
    
    if (examType) {
      q = query(
        collection(db, 'scores'),
        where('userId', '==', userId),
        where('examType', '==', examType),
        where('createdAt', '>=', startDate.toISOString()),
        where('createdAt', '<=', endDate.toISOString()),
        orderBy('createdAt', 'asc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    const scores = [];
    
    querySnapshot.forEach((doc) => {
      scores.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return calculatePerformanceMetrics(scores);
  } catch (error) {
    console.error('Error getting performance analytics:', error);
    throw error;
  }
};

const calculatePerformanceMetrics = (scores) => {
  if (scores.length === 0) {
    return {
      totalAttempts: 0,
      averageStreak: 0,
      averageAccuracy: 0,
      averageTimePerQuestion: 0,
      bestStreak: 0,
      worstStreak: 0,
      improvementTrend: 0,
      dailyAverages: [],
      weeklyAverages: [],
      monthlyAverages: []
    };
  }
  
  const totalAttempts = scores.length;
  const totalStreak = scores.reduce((sum, score) => sum + score.streakScore, 0);
  const totalAccuracy = scores.reduce((sum, score) => sum + score.accuracy, 0);
  const totalTime = scores.reduce((sum, score) => sum + score.averageTimePerQuestion, 0);
  
  const averageStreak = Math.round(totalStreak / totalAttempts);
  const averageAccuracy = Math.round(totalAccuracy / totalAttempts);
  const averageTimePerQuestion = Math.round(totalTime / totalAttempts);
  
  const bestStreak = Math.max(...scores.map(s => s.streakScore));
  const worstStreak = Math.min(...scores.map(s => s.streakScore));
  
  // Calculate improvement trend (last 5 vs first 5 scores)
  const firstFive = scores.slice(0, 5);
  const lastFive = scores.slice(-5);
  
  const firstFiveAvg = firstFive.reduce((sum, score) => sum + score.streakScore, 0) / firstFive.length;
  const lastFiveAvg = lastFive.reduce((sum, score) => sum + score.streakScore, 0) / lastFive.length;
  
  const improvementTrend = Math.round(((lastFiveAvg - firstFiveAvg) / firstFiveAvg) * 100);
  
  // Group by time periods
  const dailyAverages = groupScoresByPeriod(scores, 'day');
  const weeklyAverages = groupScoresByPeriod(scores, 'week');
  const monthlyAverages = groupScoresByPeriod(scores, 'month');
  
  return {
    totalAttempts,
    averageStreak,
    averageAccuracy,
    averageTimePerQuestion,
    bestStreak,
    worstStreak,
    improvementTrend,
    dailyAverages,
    weeklyAverages,
    monthlyAverages
  };
};

const groupScoresByPeriod = (scores, period) => {
  const grouped = {};
  
  scores.forEach(score => {
    const date = new Date(score.createdAt);
    let key;
    
    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = date.toISOString().split('T')[0];
    }
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(score);
  });
  
  return Object.entries(grouped).map(([period, periodScores]) => ({
    period,
    averageStreak: Math.round(
      periodScores.reduce((sum, score) => sum + score.streakScore, 0) / periodScores.length
    ),
    averageAccuracy: Math.round(
      periodScores.reduce((sum, score) => sum + score.accuracy, 0) / periodScores.length
    ),
    averageTimePerQuestion: Math.round(
      periodScores.reduce((sum, score) => sum + score.averageTimePerQuestion, 0) / periodScores.length
    ),
    totalAttempts: periodScores.length,
    bestStreak: Math.max(...periodScores.map(s => s.streakScore))
  }));
};

export default app;
