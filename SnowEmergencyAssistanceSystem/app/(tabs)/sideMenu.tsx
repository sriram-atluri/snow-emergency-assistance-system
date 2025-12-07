import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

interface Props {
  onClose: () => void;
}

export default function SideMenu({ onClose }: Props) {
  return (
    <View style={styles.container}>
      
      {/* Close Icon */}
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Ionicons name="close" size={28} color="#d9534f" />
      </TouchableOpacity>

      {/* User Info */}
      <Image
        source={{ uri: "https://i.pravatar.cc/300" }}
        style={styles.avatar}
      />

      <Text style={styles.name}>John Duet</Text>
      <Text style={styles.email}>joh.duet@gmail.com</Text>

      {/* Menu Items */}
      <View style={styles.menuContainer}>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/home")}>
          <Ionicons name="home-outline" size={24} color="#000" />
          <Text style={styles.menuText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Feather name="user" size={24} color="#000" />
          <Text style={styles.menuText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Feather name="phone-call" size={24} color="#000" />
          <Text style={styles.menuText}>Call Records</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="location-outline" size={24} color="#000" />
          <Text style={styles.menuText}>Nearby Incident</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialIcons name="history" size={24} color="#000" />
          <Text style={styles.menuText}>Report History</Text>
        </TouchableOpacity>

      </View>

      {/* Settings - Bottom aligned */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <Feather name="settings" size={24} color="#000" />
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "75%",
    height: "100%",
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  closeBtn: {
    position: "absolute",
    top: 40,
    left: 20,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 40,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  email: {
    textAlign: "center",
    color: "#777",
    marginBottom: 25,
  },
  menuContainer: {
    marginTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  menuText: {
    marginLeft: 15,
    fontSize: 17,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
  },
});
