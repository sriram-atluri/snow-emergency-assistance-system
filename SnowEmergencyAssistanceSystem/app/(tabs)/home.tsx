import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function HomeScreen() {
  return (
    <View style={styles.container}>

      {/* Top Bar */}
      <View style={styles.topRow}>
        <TouchableOpacity>
          <Ionicons name="menu" size={32} color="#b30000" />
        </TouchableOpacity>
      </View>

      {/* Logo */}
      <Image 
        source={require("../../assets/images/snow.png")}
        style={styles.logo}
      />

      {/* App Title */}
      <Text style={styles.appTitle}>Snow Guard</Text>

      {/* Button Grid */}
      <View style={styles.grid}>
        
        {/* Power Button */}
        <TouchableOpacity style={styles.card}>
          <Ionicons name="power" size={48} color="#ff3b3b" />
        </TouchableOpacity>

        {/* Call Button */}
        <TouchableOpacity style={styles.card}>
          <Ionicons name="call" size={48} color="#ff3b3b" />
        </TouchableOpacity>

        {/* Location Button */}
        <TouchableOpacity style={styles.card}>
          <Ionicons name="location" size={48} color="#ff3b3b" />
        </TouchableOpacity>

        {/* Analytics / Report Button */}
        <TouchableOpacity style={styles.card}>
          <MaterialIcons name="analytics" size={48} color="#ff3b3b" />
        </TouchableOpacity>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 25,
  },
  topRow: {
    width: "100%",
    marginBottom: 20,
  },
  logo: {
    width: 85,
    height: 85,
    alignSelf: "center",
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 40,
  },

  /* GRID */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },

  card: {
    backgroundColor: "#fff",
    width: 130,
    height: 130,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
    shadowColor: "#ff6b6b",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
});
