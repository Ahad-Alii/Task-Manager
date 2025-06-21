// Firebase Configuration
// Your Firebase project credentials

const firebaseConfig = {
    apiKey: "AIzaSyD8Mltk68WNat8zM3931YrbaOt7l6XewhU",
    authDomain: "task-manager-766a6.firebaseapp.com",
    projectId: "task-manager-766a6",
    storageBucket: "task-manager-766a6.appspot.com",
    messagingSenderId: "1027324378024",
    appId: "1:1027324378024:web:24a3723eb80d8afe677b9d",
    measurementId: "G-BB43CFV6TQ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();
const auth = firebase.auth();
window.db = db;
window.auth = auth;

// Enable offline persistence
db.enablePersistence()
    .catch((err) => {
        if (err.code == 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab at a time
            console.log('Persistence failed - multiple tabs open');
        } else if (err.code == 'unimplemented') {
            // The current browser doesn't support persistence
            console.log('Persistence not supported in this browser');
        }
    });

console.log('Firebase initialized successfully'); 
