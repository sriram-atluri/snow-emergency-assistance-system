import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { router } from "expo-router";
import { auth } from '@/firebaseConfig';

export default function SignUpScreen() {
  const [email, setEmail] = useState(''); // State for email
  const [password, setPassword] = useState(''); // State for password
  const [checked, setChecked] = useState(true);
  const [loading, setLoading] = useState(false);

  // --- Handle User Registration ---
  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Password Too Short", "Password must be at least 6 characters long.");
      return;
    }
    if (!checked) {
      Alert.alert("Agreement Required", "You must agree to the Terms of Services and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      // 🚨 CORE FUNCTION: Call the Firebase API to create a user
      await createUserWithEmailAndPassword(auth, email, password);
      
      // Success: Firebase handles setting the user and the AuthContext handles navigation to (tabs)
      Alert.alert("Success!", "Your account has been created. Welcome to Snow Guard!");

    } catch (error) {
      console.error("Firebase Sign Up Error:", error);
      
      let message = "An unknown error occurred during sign-up.";
      if (error.code === 'auth/email-already-in-use') {
        message = 'This email address is already registered.';
      } else if (error.code === 'auth/invalid-email') {
         message = 'The email address is not valid.';
      }
      // Note: 'auth/weak-password' is handled by the client-side check above

      Alert.alert("Sign Up Failed", message);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* ... Logo, Titles ... */}
      <Image
        source={require("@/assets/images/snow.png")}
        style={styles.logo}
      />

      {/* Title */}
      <Text style={styles.appTitle}>Snow Guard</Text>

      {/* Form Title */}
      <Text style={styles.signUpTitle}>Sign Up</Text>

      {/* Email Input */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Your email address"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email} // 👈 Bind state
        onChangeText={setEmail} // 👈 Update state
      />

      {/* Password Input */}
      <Text style={[styles.label, { marginTop: 15 }]}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Your password"
        secureTextEntry
        value={password} // 👈 Bind state
        onChangeText={setPassword} // 👈 Update state
      />

      {/* Checkbox Row */}
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setChecked(!checked)}
      >
        {/* ... Ionicons ... */}
       {/* <Text style={styles.checkboxText}>
          I agree to the terms...
  </Text>*/}
      </TouchableOpacity>

      {/* Continue Button */}
      <TouchableOpacity 
        style={styles.continueButton}
        onPress={handleSignUp} // 👈 Call sign-up function
        disabled={loading} // 👈 Disable while loading
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.continueText}>Continue</Text>
        )}
      </TouchableOpacity>

      {/* Sign In Link */}
      <View style={styles.bottomRow}>
        <Text style={styles.haveAccount}>Have an Account?</Text>
        <TouchableOpacity onPress={() => router.push("/signin")}> 
          <Text style={styles.signIn}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  signUpTitle: {
    fontSize: 26,
    fontWeight: "600",
    marginBottom: 20,
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
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  checkboxText: {
    marginLeft: 10,
    fontSize: 15,
    color: "#444",
    flexShrink: 1,
  },
  linkText: {
    color: "#ff6b6b",
    fontWeight: "600",
  },
  continueButton: {
    backgroundColor: "#ff6b6b",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 35,
  },
  continueText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 18,
    textAlign: "center",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 35,
  },
  haveAccount: {
    fontSize: 14,
    color: "#777",
  },
  signIn: {
    color: "#ff6b6b",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 6,
  },
});
