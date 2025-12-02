import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported, type Analytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDxhFnegbfAl0G6pMrG0CZnpl5qRRARjlw",
  authDomain: "dna-cafe.firebaseapp.com",
  projectId: "dna-cafe",
  storageBucket: "dna-cafe.firebasestorage.app",
  messagingSenderId: "993243193290",
  appId: "1:993243193290:web:9fcefc712e3fb5feba3933",
  measurementId: "G-LF7JCYQ76P",
} as const;

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

let analytics: Analytics | null = null;

if (typeof window !== "undefined") {
  // Guard analytics for environments where it's not supported (e.g. some browsers)
  void isAnalyticsSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// Firestore instance – use this to read/write your collections
const db = getFirestore(app);

export { app, db, analytics };


