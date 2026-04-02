// Initialize Firebase
// Replace these values with your Firebase project credentials
// Get these from: https://console.firebase.google.com/

const firebaseConfig = {
    apiKey: "AIzaSyDsYLR4BQUqiYveOlkfAtJKXnBI__WI44g",
    authDomain: "bunichitral-e3e0a.firebaseapp.com",
    projectId: "bunichitral-e3e0a",
    storageBucket: "bunichitral-e3e0a.firebasestorage.app",
    messagingSenderId: "379587297552",
    appId: "1:379587297552:web:73c0b6e119ef16ab106595"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Authentication
const auth = firebase.auth();

// Initialize Firestore
const db = firebase.firestore();

// Initialize Storage
const storage = firebase.storage();
