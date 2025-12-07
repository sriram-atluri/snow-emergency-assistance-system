import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function SignUpScreen() {
  const [checked, setChecked] = useState(true);

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require("../../assets/images/snow.png")}
        style={styles.logo}
      />

      {/* Title */}
      <Text style={styles.appTitle}>Snow Guard</Text>

      {/* Form Title */}
      <Text style={styles.signUpTitle}>Sign Up</Text>

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Your email address"
        placeholderTextColor="#999"
        keyboardType="email-address"
      />

      {/* Password */}
      <Text style={[styles.label, { marginTop: 15 }]}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Your password"
        secureTextEntry
        placeholderTextColor="#999"
      />

      {/* Checkbox Row */}
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={() => setChecked(!checked)}
      >
        <Ionicons
          name={checked ? "checkbox" : "square-outline"}
          size={22}
          color="#ff6b6b"
        />
        <Text style={styles.checkboxText}>
          I agree to the{" "}
          <Text style={styles.linkText}>Terms of Services</Text> and{" "}
          <Text style={styles.linkText}>Privacy Policy.</Text>
        </Text>
      </TouchableOpacity>

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
