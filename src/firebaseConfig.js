import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCE92Z7kCr0DCS9ZgWWbfycOeu0AbRGR6E",
  authDomain: "streakpeaked-auth.firebaseapp.com",
  projectId: "streakpeaked-auth",
  storageBucket: "streakpeaked-auth.appspot.com",
  messagingSenderId: "583097727179",
  appId: "1:583097727179:web:f5b1674fbb64087bcf347d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export default db;
