import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCqBRXsurzF2zCUQrLeACfbmIIyWZidPXo",
  authDomain: "xtremregistration.firebaseapp.com",
  databaseURL: "https://xtremregistration-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "xtremregistration",
  storageBucket: "xtremregistration.firebasestorage.app",
  messagingSenderId: "136229481276",
  appId: "1:136229481276:web:9130e043f62cc876b84c39",
  measurementId: "G-4CJPPL47LK"
}

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const auth = getAuth(app);
