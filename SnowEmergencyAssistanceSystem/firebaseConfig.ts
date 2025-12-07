import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// 🚨 Use initializeAuth and getReactNativePersistence
import { 
  initializeAuth, 
  getAuth,
  Auth, 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword
} from 'firebase/auth'; 

// 🚨 Import the persistence library
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// 🚨 IMPORTANT: Use your Web Config Object here 🚨
const firebaseConfig = {
    apiKey: "AIzaSyDpZDt2T4VzMCGY-r4rURS48ib1s5pLZk4",
    authDomain: "snowguardapp.firebaseapp.com",
    projectId: "snowguardapp",
    storageBucket: "snowguardapp.firebasestorage.app",
    messagingSenderId: "110922008915",
    appId: "1:110922008915:web:dc767fe13caa0c8ea7f9a6"
  // ... rest of your keys
};

// 1. Initialize the Core Firebase App
const app: FirebaseApp = initializeApp(firebaseConfig);

// 2. Initialize Auth using getAuth()
// This defaults to memory persistence when run in Expo Go without explicit configuration.
export const auth: Auth = getAuth(app); 

//export const db = getFirestore(app);

// 3. Export all necessary utilities 
export { onAuthStateChanged, signOut, signInWithEmailAndPassword };
export { app };