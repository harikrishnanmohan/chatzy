// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD52ggz0U6xjx47cFDfgv79dsupI2Z_nBY",
  authDomain: "chatzy-a1781.firebaseapp.com",
  projectId: "chatzy-a1781",
  storageBucket: "chatzy-a1781.firebasestorage.app",
  messagingSenderId: "979689871603",
  appId: "1:979689871603:web:9ad1242ea0b452290b7f86",
  measurementId: "G-6BY4GJZYEK",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
