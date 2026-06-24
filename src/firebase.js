import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC3M_Noal2mtFW2ssmWTsapVqNiTzYfGyc",
  authDomain: "zivotube.firebaseapp.com",
  projectId: "zivotube",
  storageBucket: "zivotube.firebasestorage.app",
  messagingSenderId: "686810876076",
  appId: "1:686810876076:web:03b4667fa8cd57c10d3709"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
