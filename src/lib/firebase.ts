import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBXpRRJEpORgbRLLnYinT27NL44BLvzWzQ",
  authDomain: "carsafe-ar46j.firebaseapp.com",
  projectId: "carsafe-ar46j",
  storageBucket: "carsafe-ar46j.firebasestorage.app",
  messagingSenderId: "995851166967",
  appId: "1:995851166967:web:df3585441131b5675a9ff2"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { app };
