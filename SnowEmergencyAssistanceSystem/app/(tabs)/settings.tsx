import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Switch, Modal } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import SideMenu from './sideMenu'; // <-- CORRECT: Import the default export


export default function SettingsScreen() {
  
  // State for the toggle feature (e.g., controlling a preference like notifications)
  const [isFeatureEnabled, setIsFeatureEnabled] = useState(true);

  const [isMenuVisible, setIsMenuVisible] = useState(false);
  
  // Handlers for clarity
  const openSidebar = () => setIsMenuVisible(true);
  const closeSidebar = () => setIsMenuVisible(false);

  const toggleFeature = () => {
    setIsFeatureEnabled(previousState => !previousState);
    // You would typically add logic here to save this setting (e.g., using AsyncStorage or context)
    console.log(`Setting toggled. Is feature enabled? ${!isFeatureEnabled}`);
  };

  return (
    <View style={styles.container}>

        {/* Top Bar */}
      <View style={styles.topRow}>
        <TouchableOpacity
        onPress={openSidebar}>
          <Ionicons name="menu" size={32} color="#b30000" />
        </TouchableOpacity>
      </View>

      {/* 3. MODAL: Render the Modal at the bottom of the component */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={closeSidebar} // Handles Android back button
      >
        {/* 4. PASS PROPS: Render SideMenu, passing the close handler */}
        <SideMenu onClose={closeSidebar} />
      </Modal>
      
      
      {/* Logo */}
      <Image
        source={require("../../assets/images/snow.png")} // Adjust the path if necessary
        style={styles.logo}
      />
      
      {/* App Title */}
      <Text style={styles.title}>Snow Guard</Text>

      {/* Page Title */}
      <Text style={styles.subtitle}>Settings</Text>

      {/* --- Toggle Feature --- */}
      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Incident Notifications</Text>
        <Switch
          trackColor={{ false: "#767577", true: "#ff8a80" }} // Soft red for on state
          thumbColor={isFeatureEnabled ? "#d9534f" : "#f4f3f4"} // Brighter red thumb
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleFeature}
          value={isFeatureEnabled}
        />
      </View>
      {/* ---------------------- */}

      {/* Home Button */}
      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.push("/")}
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
    left: 25,
    top: 60,
    zIndex: 100,
  },
  logo: {
    width: 85,
    height: 85,
    alignSelf: "center",
    marginBottom: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 30,
    color: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  homeButton: {
    marginTop: 50,
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