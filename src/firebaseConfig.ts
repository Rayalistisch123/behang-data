// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; //
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDWWILaAsfTgtdf2kGOXUOzCmFdcq2K2Eg",
  authDomain: "poespas-dashboard.firebaseapp.com",
  projectId: "poespas-dashboard",
  storageBucket: "poespas-dashboard.firebasestorage.app",
  messagingSenderId: "528703897022",
  appId: "1:528703897022:web:444d6f048e6f52c7cfcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };