import {getAuth, GoogleAuthProvider} from "firebase/auth"
import { initializeApp } from "firebase/app";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY || "AIzaSyCR9nG1fQfWymSGLBY7PBM-4pTNVnRkYF4",
  authDomain: "lms21-6e8fe.firebaseapp.com",
  projectId: "lms21-6e8fe",
  storageBucket: "lms21-6e8fe.firebasestorage.app",
  messagingSenderId: "392072195484",
  appId: "1:392072195484:web:3292a6f2ca87f1fd732c59"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
export {auth,provider}