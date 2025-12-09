import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  Alert,
  ActivityIndicator
} from "react-native";
import { router } from "expo-router";
// 🚨 Import necessary Firebase function
import { sendPasswordResetEmail } from 'firebase/auth'; 
// 🚨 Import your auth instance (ADJUST PATH AS NEEDED)
import { auth } from '../firebaseConfig'; 


export default function ForgetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      // 🚨 CORE FUNCTION: Call the Firebase API
      await sendPasswordResetEmail(auth, email);

      // Success feedback
      Alert.alert(
        "Success!",
        `A password reset link has been sent to ${email}. Check your inbox.`
      );
      
      // Navigate the user back to the sign-in screen after success
      router.replace('/signin'); 

    } catch (error) {
      console.error("Password Reset Error:", error);
      
      let message = "Could not send reset email. Please check the email address.";
      if (error.code === 'auth/user-not-found') {
        message = 'The email address is not registered.';
      } else if (error.code === 'auth/invalid-email') {
         message = 'The email address is not valid.';
      }

      Alert.alert("Reset Failed", message);
      
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.container}>

      {/* Title */}
      <Text style={styles.title}>Forget Password</Text>

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Your email address"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail} // 👈 BINDING STATE
      />

      {/* Continue Button */}
      <TouchableOpacity
        onPress={handlePasswordReset} // 👈 CALL RESET FUNCTION
        disabled={loading} // 👈 DISABLE WHILE LOADING
        style={styles.continueButton}
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
  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 40,
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
    marginBottom: 30,
  },
  continueButton: {
    backgroundColor: "#ff6b6b",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
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
    marginTop: 25,
  },
  haveAccount: {
    color: "#8a8a8a",
    fontSize: 14,
    marginRight: 5,
  },
  signIn: {
    color: "#ff6b6b",
    fontSize: 14,
    fontWeight: "600",
  },
});