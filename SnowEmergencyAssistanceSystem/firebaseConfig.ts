// firebaseConfig.ts 

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Timestamp, Firestore, collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  orderBy } from 'firebase/firestore';

// @ts-ignore is used here to resolve known TypeScript issues with react-native-specific Firebase auth functions
// @ts-ignore
import { 
  initializeAuth, 
  Auth, 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword,
  getReactNativePersistence 
} from 'firebase/auth'; 

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

//  IMPORTANT: Replace with your actual Firebase configuration keys 
const firebaseConfig = {
    apiKey: "AIzaSyDpZDt2T4VzMCGY-r4rURS48ib1s5pLZk4",
    authDomain: "snowguardapp.firebaseapp.com",
    projectId: "snowguardapp",
    storageBucket: "snowguardapp.firebasestorage.app",
    messagingSenderId: "110922008915",
    appId: "1:110922008915:web:dc767fe13caa0c8ea7f9a6"
};

// 1. Initialize the Core Firebase App
const app: FirebaseApp = initializeApp(firebaseConfig);

// 2. Initialize and Export the Firestore service
export const db: Firestore = getFirestore(app);

// 3. Initialize AUTH with ASYNC STORAGE PERSISTENCE
export const auth: Auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage), 
});

// 4. Export all necessary utilities 
export { onAuthStateChanged, signOut, signInWithEmailAndPassword };
export { app };
export { Timestamp };
export { collection, addDoc, getDocs, where, query, orderBy };