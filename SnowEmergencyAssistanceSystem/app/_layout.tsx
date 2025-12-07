// app/_layout.tsx
import { Stack, Redirect } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native'; // <-- MUST include StyleSheet
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext'; 

// --- Root Layout Component ---
const RootLayout: React.FC = () => {
  const { user, isLoading } = useAuth(); 
  
  // NOTE: If user is detected as non-null by Firebase (stale token), 
  // this is where the app incorrectly jumps to (tabs).

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // --- UNAUTHENTICATED STATE: Force Redirect to Login ---
  if (!user) {
    return (
      <Stack key="auth">
        {/* 1. Register the valid login route */}
        <Stack.Screen name="login" options={{ headerShown: false }} /> 
        
        {/* 2. Block and hide the main app tabs */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false, href: null }} />

        <Stack.Screen name="register" options={{ headerShown: false }} />
        
        {/* 🚨 CRITICAL: Executes if the path is not already /login 🚨 */}
        <Redirect href="/login" /> 
      </Stack>
    );
  }

  // --- AUTHENTICATED STATE: Show Main App ---
  return (
    <Stack key="app">
      {/* 1. Register the main app tabs */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* 2. Block and hide the login route */}
      <Stack.Screen name="login" options={{ headerShown: false, href: null }} />
    </Stack>
  );
};

// ... AuthRoot wrapper and styles ...
export default function AuthRoot() {
  return (
    <AuthProvider>
      <RootLayout />
    </AuthProvider>
  );
}
// ...

// 🚨 ADD THIS STYLESHEET DEFINITION 🚨
const styles = StyleSheet.create({
  loadingContainer: { 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      // Optional: add a background color so it's not transparent/blank
      backgroundColor: '#fff', 
  },
  // Add any other styles used in this file here
});