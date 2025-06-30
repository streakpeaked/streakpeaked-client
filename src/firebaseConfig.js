import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB4B05pFDNjzNk7isUPR9z6OVQzhkJypjg",
  authDomain: "streakpeaked-auth.firebaseapp.com",
  databaseURL: "https://streakpeaked-auth-default-rtdb.firebaseio.com",
  projectId: "streakpeaked-auth",
  storageBucket: "streakpeaked-auth.appspot.com",
  messagingSenderId: "253188628591",
  appId: "1:253188628591:web:cf7965b311a86177d46d9a",
  measurementId: "G-NSZB6E7LF2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { db, auth, provider };
