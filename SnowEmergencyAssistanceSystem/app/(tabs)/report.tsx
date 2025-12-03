import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function YourReportsScreen() {
  const reports = [
    "Record 1, 1st Dec 2024",
    "Record 2, 10th Jan 2023",
    "Record 3, 20th Feb 2022",
    "Record 4, 24th May 2022",
  ];

  return (
    <View style={styles.container}>

      {/* Menu Button */}
      <TouchableOpacity style={styles.menuButton}>
        <Ionicons name="menu" size={32} color="#b30000" />
      </TouchableOpacity>

      {/* Logo */}
      <Image
        source={require("../../assets/images/snow.png")}
        style={styles.logo}
      />

      {/* Title */}
      <Text style={styles.appTitle}>Snow Guard</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>Your Reports</Text>

      {/* REPORT BUTTONS */}
      <View style={styles.listWrapper}>
        {reports.map((item, index) => (
          <TouchableOpacity key={index} style={styles.reportBtn}>
            <Text style={styles.reportText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* HOME BUTTON */}
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.push("/home")}
      >
        <Text style={styles.homeText}>Home</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 25,
    backgroundColor: "#fff",
  },

  menuButton: {
    position: "absolute",
    top: 60,
    left: 25,
    zIndex: 100,
  },

  logo: {
    width: 85,
    height: 85,
    alignSelf: "center",
    marginBottom: 5,
  },

  appTitle: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 20,
  },

  listWrapper: {
    width: "100%",
    marginTop: 10,
  },

  reportBtn: {
    backgroundColor: "#ff8a80",
    paddingVertical: 14,
    borderRadius: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#d9534f",
  },

  reportText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    color: "#000",
  },

  homeButton: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    paddingVertical: 10,
    alignSelf: "center",
    width: 200,
  },

  homeText: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
  },
});
