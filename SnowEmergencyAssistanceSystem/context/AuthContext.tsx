import React, { createContext, useState, useContext } from 'react';
import { Alert } from 'react-native';

// --- A. Define Types ---

// 1. Define the shape of the user data
export interface User {
  id: string;
  email: string;
}

// 2. Define the shape of the context values (what the app consumes)
export interface AuthContextType {
  user: User | null;
  // This function takes credentials and attempts to sign the user in.
  signIn: (email: string, password: string) => Promise<void>; 
  // This function signs the user out.
  signOut: () => Promise<void>; 

  isLoading: boolean; // <-- Added the missing property
}

// 3. Create the Context
// We use 'undefined' as the initial value, which TypeScript enforces checking later.
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- B. Create the Provider Component ---

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const signIn = async (email: string, password: string) => {
    // 📢 Placeholder for your actual API or Firebase call
    console.log(`Attempting sign-in for: ${email}`);
    
    // Simulate a successful sign-in after checking credentials
    if (email === 'test@example.com' && password === 'password') {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      
      const signedInUser: User = { id: 'u123', email: email };
      setUser(signedInUser); // Update the global state
      Alert.alert("Success", "You are now signed in!");

    } else {
      // Throw an error to be caught by the calling component (SignInScreen)
      throw new Error('Invalid email or password.');
    }
  };

  const signOut = async () => {
    // 📢 Placeholder for clearing tokens/sessions
    await new Promise(resolve => setTimeout(resolve, 500)); 
    setUser(null); // Clear the global state
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- C. Custom Hook for Consumption ---

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // This ensures useAuth is only called within the AuthProvider
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};