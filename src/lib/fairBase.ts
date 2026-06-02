import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth} from "firebase/auth"
import {getFirestore} from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDU-VlUQb-3UOWvO7JURpkfmGesVOod5F4",
  authDomain: "fourthmission.firebaseapp.com",
  projectId: "fourthmission",
  storageBucket: "fourthmission.firebasestorage.app",
  messagingSenderId: "1053633899607",
  appId: "1:1053633899607:web:9ebc2fdb839a82e3628712",
  measurementId: "G-4ZK3ES67LF"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)
export const db = getFirestore(app)
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;