// Urban Threads Firebase connection.
// This file is the only place where the Firebase project configuration is defined.

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDnJJBeicH16y7mHKR2GKMOFThpwVgabA0",
    authDomain: "q-s-urban-threads.firebaseapp.com",
    projectId: "q-s-urban-threads",
    storageBucket: "q-s-urban-threads.firebasestorage.app",
    messagingSenderId: "943762759954",
    appId: "1:943762759954:web:8337e91b6280c027d1d3cb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
