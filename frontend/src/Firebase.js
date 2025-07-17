// Import the functions you need from the SDKs you need

import { getFirestore } from "firebase/firestore";
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQfpHsRugatrOFXsmntEjZfDf_9naxr7E",
  authDomain: "react-clone-firas.firebaseapp.com",
  projectId: "react-clone-firas",
  storageBucket: "react-clone-firas.firebasestorage.app",
  messagingSenderId: "666647957490",
  appId: "1:666647957490:web:e8af225aef068a3a01656b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);