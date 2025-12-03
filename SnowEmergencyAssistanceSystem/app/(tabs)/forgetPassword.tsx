import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { router } from "expo-router";

export default function ForgetPasswordScreen() {
  const [email, setEmail] = useState("");

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
        onChangeText={setEmail}
      />

      {/* Continue Button */}
      <TouchableOpacity style={styles.continueButton}>
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>

      {/* Sign In Link */}
      <View style={styles.bottomRow}>
        <Text style={styles.haveAccount}>Have an Account?</Text>
        <TouchableOpacity onPress={() => router.push("/sign-in")}>
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
    marginBottom: 30,
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
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 35,
  },
  haveAccount: {
    color: "#777",
    fontSize: 14,
  },
  signIn: {
    color: "#ff6b6b",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 6,
  },
});
