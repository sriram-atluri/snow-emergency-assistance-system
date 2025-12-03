import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image
} from "react-native";
import { router } from "expo-router";

export default function ReportDetailsScreen() {
  return (
    <View style={styles.container}>

      {/* Logo */}
      <Image 
        source={require("../../assets/images/snow.png")} 
        style={styles.logo}
      />

      {/* App Title */}
      <Text style={styles.appTitle}>Snow Guard</Text>

      {/* Record Title */}
      <View style={styles.recordHeader}>
        <Text style={styles.recordHeaderText}>Record 1, 1st Dec 2024</Text>
      </View>

      {/* DETAILS SECTION */}
      <View style={styles.detailBlock}>
        
        {/* Date */}
        <View style={styles.row}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>1st Dec 2024</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Location */}
        <View style={styles.row}>
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>Fargo, NDSU, ND</Text>
        </View>

        <View style={styles.divider} />

        {/* Time */}
        <View style={styles.row}>
          <Text style={styles.label}>Time</Text>
          <Text style={styles.value}>10:24 AM</Text>
        </View>

        <View style={styles.divider} />

        {/* Incident Type */}
        <View style={styles.row}>
          <Text style={styles.label}>Incident Type/Severity</Text>
          <Text style={styles.value}>Slip/High</Text>
        </View>

        <View style={styles.divider} />

        {/* Measurements */}
        <View style={styles.row}>
          <Text style={styles.label}>Measurements</Text>
          <Text style={styles.value}>270 deg, 10 mph, 30 Hg</Text>
        </View>

        <View style={styles.divider} />

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

/* -------------------------------- STYLES -------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 25,
    backgroundColor: "#fff",
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
    marginBottom: 20,
  },

  recordHeader: {
    backgroundColor: "#ff8a80",
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#d9534f",
    borderRadius: 6,
    marginBottom: 25,
  },

  recordHeaderText: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },

  detailBlock: {
    width: "100%",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
  },

  value: {
    fontSize: 16,
    color: "#444",
  },

  divider: {
    height: 1,
    backgroundColor: "#ccc",
    width: "100%",
  },

  homeButton: {
    marginTop: 30,
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
