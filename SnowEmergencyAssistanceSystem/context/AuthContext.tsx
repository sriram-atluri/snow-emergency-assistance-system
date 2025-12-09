import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  ReactNode 
} from 'react';
import { 
  initializeAuth, 
  createUserWithEmailAndPassword,
  onAuthStateChanged, 
  //signOut, 
  User as FirebaseUser, 
  Auth 
} from 'firebase/auth'; 
import { useRouter, useSegments } from 'expo-router'; // 🚨 REQUIRED for explicit navigation 🚨
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; import { auth } from '../firebaseConfig'; // Your initialized Firebase Auth instance

// 🚨 Path should be relative to your project root, e.g., '../firebaseConfig' 🚨
import { app, auth as firebaseAuthInstance } from '../firebaseConfig'; 


// --- Define Types ---

// Alias for the Firebase User type
// --- Define Types ---
export type AppUser = FirebaseUser;

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  logout: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Custom Hook ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// --- Helper Component to Handle Navigation (CRITICAL) ---
// This component ensures the router responds to user state changes.
function useProtectedRoute(user: AppUser | null, isLoading: boolean) {
  const segments = useSegments();
  const router = useRouter();

  // Define unauthenticated routes (all routes NOT protected)
  const isAuthRoute = segments[0] === 'signup' || segments[0] === 'signin' || segments[0] === 'forgetPassword';
  
  // Define protected routes (routes only accessible when logged in)
  const inAuthGroup = segments[0] === '(tabs)'; // True if the current path starts with /(tabs)

  useEffect(() => {
    if (isLoading) return; // Wait until Firebase state is known

    // If logged out, redirect to login
    if (!user && inAuthGroup) {
      router.replace('/signup');
    } 
    // If logged in, redirect away from login
    else if (user && !inAuthGroup) {
      // Use replace to prevent the user from hitting the back button to the login screen
      router.replace('/(tabs)'); 
    }
  }, [user, isLoading, inAuthGroup, isAuthRoute, router]);
}


// --- Context Provider Component ---
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Set up the Firebase state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    // Explicit sign out
    //await signOut(auth);
    // The useEffect hook above will handle the navigation to '/login' when the user state turns null.
  };

  const value: AuthContextType = {
    user,
    isLoading,
    logout,
  };

  // 🚨 IMPORTANT: Call the Protected Route hook here 🚨
  // This hook is what tells the router to navigate immediately upon state change.
  useProtectedRoute(user, isLoading); 

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};