import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Image,
  StyleSheet,
  Alert, // 👈 Added for user feedback
  ActivityIndicator // 👈 Added for loading state
} from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
// 🚨 Import Firebase Auth functions
import { signInWithEmailAndPassword } from 'firebase/auth';
// 🚨 Assume your Firebase auth instance is exported from a config file
import { auth } from '../firebaseConfig'; // 👈 ADJUST PATH AS NEEDED

export default function SignInScreen() {
  const [email, setEmail] = useState(''); // 👈 State for email
  const [password, setPassword] = useState(''); // 👈 State for password
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // 👈 State for loading

  // --- 1. HANDLE SIGN IN FUNCTION ---
  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }
    
    setLoading(true);

    try {
      // 2. Call Firebase Auth function
      await signInWithEmailAndPassword(auth, email, password);
      
      // Success: AuthContext handles user state update and navigation to (tabs)
      
    } catch (error) {
      console.error("Firebase Sign In Error:", error);
      
      let message = "An unknown error occurred during sign-in.";
      if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = 'Invalid email or password.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Access temporarily blocked due to too many failed attempts.';
      }

      Alert.alert("Sign In Failed", message);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* Logo */}
      <Image 
        source={require("../assets/images/snow.png")}
        style={styles.logo}
      />

      {/* Title */}
      <Text style={styles.appTitle}>Snow Guard</Text>

      {/* Form Title */}
      <Text style={styles.signInTitle}>Sign In</Text>
      <Text style={styles.subtitle}>Hi there! Nice to see you again.</Text>

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <TextInput 
        style={styles.input}
        placeholder="example@email.com"
        placeholderTextColor="#999"
        keyboardType="email-address"
        value={email} // 👈 Bind state
        onChangeText={setEmail} // 👈 Update state
        autoCapitalize="none"
      />

      {/* Password */}
      <Text style={[styles.label, { marginTop: 15 }]}>Password</Text>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          secureTextEntry={!showPassword}
          placeholder="••••••••••"
          placeholderTextColor="#999"
          value={password} // 👈 Bind state
          onChangeText={setPassword} // 👈 Update state
        />
        <TouchableOpacity 
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
        >
          <Ionicons 
            name={showPassword ? "eye-off" : "eye"} 
            size={22} 
            color="#888" 
          />
        </TouchableOpacity>
      </View>

      {/* Sign In Button */}
      <TouchableOpacity 
        style={styles.signInButton}
        onPress={handleSignIn} // 👈 Call function
        disabled={loading} // 👈 Disable while loading
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.signInText}>Sign in</Text>
        )}
      </TouchableOpacity>

      {/* Bottom Links */}
      <View style={styles.bottomRow}>
      <TouchableOpacity 
          onPress={() => router.push("/forgetPassword")} // 🚨 Use the route path here
        >
        <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>
        {/* Example: Uncomment and adjust route if you have a signup page */}
        {/* <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={styles.signUp}>Sign Up</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (Your existing styles remain unchanged) ...
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 30,
    paddingTop: 80,
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: "center",
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 30,
  },
  signInTitle: {
    fontSize: 26,
    fontWeight: "600",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 15,
    color: "#777",
    marginBottom: 25,
  },
  label: {
    fontSize: 15,
    fontWeight: "500",
    color: "#d9534f",
    marginBottom: 5,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 8,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  signInButton: {
    backgroundColor: "#ff6b6b",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 35,
  },
  signInText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 18,
    textAlign: "center",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  forgot: {
    color: "#8a8a8a",
    fontSize: 14,
  },
  signUp: {
    color: "#ff6b6b",
    fontSize: 14,
    fontWeight: "600",
  },
});