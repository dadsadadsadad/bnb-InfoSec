// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC-UBbBwWHLXvY3Bksolkh3ugygFj_e0gg",
    authDomain: "bnb-infosec.firebaseapp.com",
    projectId: "bnb-infosec",
    storageBucket: "bnb-infosec.firebasestorage.app",
    messagingSenderId: "1044755065834",
    appId: "1:1044755065834:web:7348cb8bfbf6ae1140a093",
    measurementId: "G-0ZX5B7FXT1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);