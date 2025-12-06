import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig ={
    apiKey:"AIzaSyBntd95IBy9Aw_Z9lfMXDqvOrpucBIJsQ8",
    authDomain: "",
    projectId : "snowguardapp",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const FIREBASE_APP = getAuth(app);
export const FIREBASE_AUTH;