import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDRauMVvkLORtVOYTUU2rMzACLbk20y4fA",
  authDomain: "dong-ho-pomodoro.firebaseapp.com",
  projectId: "dong-ho-pomodoro",
  storageBucket: "dong-ho-pomodoro.firebasestorage.app",
  messagingSenderId: "843132066935",
  appId: "1:843132066935:web:b7fa288ef8ee827814ba72",
  measurementId: "G-MMC1Z6WWVD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
