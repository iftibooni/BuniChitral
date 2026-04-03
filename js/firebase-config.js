// Firebase client (web) config. The API key here is not a secret for browser apps—
// restrict abuse in Firebase Console (Authorized domains, App Check) and Firestore rules.

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

// Initialize Storage (optional - only available if storage SDK is loaded)
let storage = null;
try {
    if (typeof firebase.storage === 'function') {
        storage = firebase.storage();
    }
} catch (e) {
    // Storage isn't used in all pages; avoid breaking auth/signup.
    storage = null;
}
