import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyANVk0lRfq_3-hhoZDXGBoTnHY0owMvIlE",
    authDomain: "specmatchai-2089b.firebaseapp.com",
    projectId: "specmatchai-2089b",
    storageBucket: "specmatchai-2089b.firebasestorage.app",
    messagingSenderId: "751491619525",
    appId: "1:751491619525:web:27a5f1565fddd61874aeac",
    measurementId: "G-CS4M04B2J3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);