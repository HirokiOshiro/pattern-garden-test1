import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ここを先ほどコピーしたfirebaseConfigに置き換えてください
const firebaseConfig = {
  apiKey: "AIzaSyB8QHtqQ_O6VvP4RIATU7DQw8tP2Va-P3c",
  authDomain: "pattern-garden-test.firebaseapp.com",
  projectId: "pattern-garden-test",
  storageBucket: "pattern-garden-test.firebasestorage.app",
  messagingSenderId: "23676253700",
  appId: "1:23676253700:web:60f77cae910364575be751"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);

// Firestore初期化
export const db = getFirestore(app);

export default app;