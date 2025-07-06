console.log("🔥 Upload script has started.");
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc } = require("firebase/firestore");
const questions = require("./ssc_cgl_questions_with_filters.json");

// ✅ Your Firebase Config
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

console.log("🚀 Firebase initialized");

async function uploadQuestions() {
  if (!questions || !Array.isArray(questions)) {
    console.log("❌ Failed: questions is not an array");
    return;
  }

  console.log("📦 Total questions loaded from JSON:", questions.length);

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    try {
      await addDoc(collection(db, "questions"), q);
      console.log(`✅ Uploaded (${i + 1}/${questions.length}): ${q.question}`);
    } catch (err) {
      console.error(`❌ Error uploading (${i + 1}):`, err);
    }
  }

  console.log("🎉 Upload complete!");
}

uploadQuestions();
