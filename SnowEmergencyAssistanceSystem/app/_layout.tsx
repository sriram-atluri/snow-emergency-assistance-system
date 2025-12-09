// app/_layout.tsx

import { Stack, Redirect } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen'; 

// --- Core Imports ---
import { AuthProvider, useAuth } from '../context/AuthContext'; 
// Use the relative path to your ReportContext file
import { ReportProvider } from '@/context/firebaseService'; 


const splashImageSource = require("../assets/images/snow.png");
SplashScreen.preventAutoHideAsync();

// ------------------------------------------------------------------
// 1. Authenticated Stack (The main navigation stack for logged-in users)
// ------------------------------------------------------------------
const AuthenticatedStack = () => (
    // ReportProvider must wrap the Stack to ensure state persists across all nested screens (tabs, details, etc.)
    <ReportProvider>
        <Stack key="app" initialRouteName="(tabs)" screenOptions={{ headerShown: false }}>
            
            {/* The entry point for your tab navigation */}
            <Stack.Screen name="(tabs)" /> 
            
            {/* 🛑 CRITICAL: This MUST match the file name 'reportDetailsScreen.tsx' exactly 🛑 */}
            <Stack.Screen name="reportDetailsScreen" />
            
            {/* Auth screens are registered here but hidden from the logged-in stack */}
            <Stack.Screen name="signup" options={{ href: null }} />
            <Stack.Screen name="signin" options={{ href: null }} />
            <Stack.Screen name="forgetPassword" options={{ href: null }} />
        </Stack>
    </ReportProvider>
);

// ------------------------------------------------------------------
// 2. Root Layout Component (Handles Splash and Authentication Routing)
// ------------------------------------------------------------------
const RootLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [splashTimeoutComplete, setSplashTimeoutComplete] = useState(false);
  const [appIsReady, setAppIsReady] = useState(false);

  // Splash Screen Timeout Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashTimeoutComplete(true);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  // Application Ready Logic
  useEffect(() => {
    if (!isLoading && splashTimeoutComplete) {
      setAppIsReady(true);
      SplashScreen.hideAsync(); 
    }
  }, [isLoading, splashTimeoutComplete]);


  if (!appIsReady) {
    return (
      <View style={styles.splashContainer}>
        <Image source={splashImageSource} style={styles.icon} />
        <Text style={styles.title}>Snow Guard</Text>
        <Text style={styles.loading}>Loading...</Text>
      </View>
    );
  }

  // --- UNAUTHENTICATED ROUTING ---
  if (!user) {
    return (
      <Stack 
        key="auth"
        initialRouteName="signup" 
        screenOptions={{ headerShown: false, }}
      >
        <Stack.Screen name="signup" /> 
        <Stack.Screen name="signin" /> 
        <Stack.Screen name="forgetPassword" />
        {/* Hide tabs from unauthorized users */}
        <Stack.Screen name="(tabs)" options={{ href: null }} />
        <Redirect href="/signup" />
      </Stack>
    );
  }

  // --- AUTHENTICATED ROUTING ---
  return <AuthenticatedStack />;
};

// ------------------------------------------------------------------
// 3. AuthRoot wrapper (Wraps the whole app in the AuthContext)
// ------------------------------------------------------------------
export default function AuthRoot() {
  return (
    <AuthProvider>
        <RootLayout />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: { fontSize: 18, color: "#666", marginTop: 20, },
  icon: { width: 90, height: 90, marginBottom: 20, },
  title: { fontSize: 26, fontWeight: "600", color: "#444", marginTop: 10, },
  splashContainer: { flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", },
});