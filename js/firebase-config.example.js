// Firebase Configuration Template
// IMPORTANT: Update these values with your Firebase project credentials
// Get these from: https://console.firebase.google.com/
// DO NOT commit this file with real credentials to GitHub!

const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Authentication
const auth = firebase.auth();

// Initialize Firestore
const db = firebase.firestore();

// Initialize Storage
const storage = firebase.storage();
