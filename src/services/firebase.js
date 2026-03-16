import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBk5pqgbONOr77kdNjzRH826Y65CfLRj3g",
  authDomain: "multiskinn.firebaseapp.com",
  projectId: "multiskinn",
  storageBucket: "multiskinn.firebasestorage.app",
  messagingSenderId: "54108494377",
  appId: "1:54108494377:web:4af831a3eab0490e9cda38",
  measurementId: "G-H220EYKKXT"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);