// index.tsx 
// FINAL: Includes Fall Alert Modal AND Vibration Logic controlled by context

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  Vibration 
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import SideMenu from './sideMenu'; 
import { useAuth } from '@/context/AuthContext';
import { useReport } from '@/context/firebaseService'; // Adjust path if needed


// --- Vibration Pattern Configuration ---
// Pattern: Vibrate for 100ms, pause for 200ms, Vibrate for 100ms, pause for 500ms (Looping)
const FALL_VIBRATION_PATTERN = [0, 100, 200, 100, 500];


export default function HomeScreen() {
  const { logout: firebaseSignOut } = useAuth();
  
  const { 
    triggerManualSave, 
    isMonitoringActive, 
    toggleMonitoring,
    lastFallDetectedTime 
  } = useReport(); 

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  
  // State for the critical Fall Alert
  const [isFallAlertVisible, setIsFallAlertVisible] = useState(false); 


  // 1. EFFECT TO WATCH FOR FALLS AND SHOW MODAL/START VIBRATION 
  useEffect(() => {
      // Show alert only if a new fall time stamp is received
      if (lastFallDetectedTime) {
          setIsFallAlertVisible(true);
      }
  }, [lastFallDetectedTime]);
  
  // 2. EFFECT TO CONTROL VIBRATION LOOP 
  useEffect(() => {
      if (isFallAlertVisible) {
          // Start looping vibration
          Vibration.vibrate(FALL_VIBRATION_PATTERN, true);
      } else {
          // Stop vibration when the modal is dismissed/closed
          Vibration.cancel();
      }
      
      return () => {
          Vibration.cancel();
      };
      
  }, [isFallAlertVisible]);


  const handleOpenDialog = () => setIsDialogOpen(true);
  const openSidebar = () => setIsMenuVisible(true);
  const closeSidebar = () => setIsMenuVisible(false);

  // Power Toggle Handler 
  const handlePowerToggle = async () => {
    
    if (isMonitoringActive) {
        // Turning OFF: Trigger the cleanup save (which passes 'false' to createAndSaveReport)
        try {
            await triggerManualSave(); 
            console.log("Cleanup report triggered and saved successfully.");
        } catch (error) {
            console.error("Failed to save cleanup report:", error);
            Alert.alert("Error", "Failed to save cleanup report. Check console.");
        }
        
    } else {
        // Turning ON: Show the reminder modal
        setIsReminderOpen(true);
    }

    // Toggle the state via the context provider
    toggleMonitoring();
  }

  const navigateToReports = () => router.push('/report'); 
  const navigateToMap = () => router.push('/nearbyIncident'); 
  
  // Function to handle sign out
  const handleSignOut = async () => {
    try {
        if (isMonitoringActive) {
            await triggerManualSave();
        }
        await firebaseSignOut(); 
    } catch (error) {
        console.error("Logout failed:", error);
        Alert.alert("Error", "Failed to sign out.");
    }
  };


  return (
    <View style={styles.container}>

      {/* Top Bar */}
      <View style={styles.topRow}>
        <TouchableOpacity onPress={openSidebar}>
          <Ionicons name="menu" size={32} color="#b30000" />
        </TouchableOpacity>
        
        {/* Sign Out Button */}
        <TouchableOpacity
            onPress={handleSignOut}
            style={styles.signOutButtonContainer}
        >
            <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Side Menu Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isMenuVisible}
        onRequestClose={closeSidebar}
      >
        <SideMenu onClose={closeSidebar} />
      </Modal>

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
        <TouchableOpacity 
        onPress={handlePowerToggle}
        style={styles.card}>
          <Ionicons 
            name={isMonitoringActive ? "power" : "power-outline"} 
            size={48} 
            color={isMonitoringActive ? "#2ECC71" : "#ff3b3b"} 
          />
          <Text style={styles.label}>{isMonitoringActive ? "Monitoring" : "Power"}</Text>
        </TouchableOpacity>

        {/* Call Button */}
        <TouchableOpacity 
        onPress={handleOpenDialog}
        style={styles.card}>
          <Ionicons name="call" size={48} color="#ff3b3b" />
          <Text style={styles.label}>Call</Text>
        </TouchableOpacity>

        {/* Location Button */}
        <TouchableOpacity 
        style={styles.card}
        onPress={navigateToMap}
        >
          <Ionicons name="location" size={48} color="#ff3b3b" />
          <Text style={styles.label}>Location</Text>
        </TouchableOpacity>

        {/* Analytics / Report Button */}
        <TouchableOpacity 
        style={styles.card}
        onPress={navigateToReports}
        >
          <MaterialIcons name="analytics" size={48} color="#ff3b3b" />
          <Text style={styles.label}>Reports</Text>
        </TouchableOpacity>

      </View>
      
      {/* Call Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDialogOpen}
        onRequestClose={() => setIsDialogOpen(false)}> 
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Action Confirmation</Text>
            <Text style={styles.modalText}>
              Would you like to call 911?
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsDialogOpen(false)}
            >
              <Text style={styles.buttonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Snow Fall Detection Status Modal (Reminder for Power ON) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isReminderOpen}
        onRequestClose={() => setIsReminderOpen(false)}> 
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Snow Fall Detection - Active</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsReminderOpen(false)}
            >
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 🛑 FALL DETECTED ALERT MODAL 🛑 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isFallAlertVisible}
        onRequestClose={() => setIsFallAlertVisible(false)}
      >
          <View style={styles.centeredView}>
              <View style={styles.modalView}>
                  <Ionicons name="warning" size={40} color="#FF3B30" style={{ marginBottom: 10 }} />
                  <Text style={styles.modalTitle}>🚨 FALL DETECTED! 🚨</Text>
                  <Text style={styles.modalText}>
                      A fall event was detected and automatically reported to your logs.
                      Do you need immediate assistance?
                  </Text>
                  <View style={styles.buttonRow}>
                      <TouchableOpacity
                          style={[styles.alertButton, { backgroundColor: '#34C759' }]}
                          onPress={() => setIsFallAlertVisible(false)} // Stops modal & vibration
                      >
                          <Text style={styles.buttonText}>I'M OK (Dismiss)</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                          style={[styles.alertButton, { backgroundColor: '#FF3B30', marginLeft: 15 }]}
                          onPress={() => {
                              setIsFallAlertVisible(false); // Stops modal & vibration
                              Alert.alert("Emergency Call", "Initiating call to emergency services...");
                          }}
                      >
                          <Text style={styles.buttonText}>CALL 911</Text>
                      </TouchableOpacity>
                  </View>
              </View>
          </View>
      </Modal>

    </View>
  );
};

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 85,
    height: 85,
    alignSelf: "center",
    marginBottom: 8,
  },
  signOutButtonContainer: {
    position: 'absolute', 
    right: 0, 
    paddingHorizontal: 10, 
    paddingVertical: 5,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 40,
  },
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
  closeButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', 
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 14,
  },
  label: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#444",
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 15,
  },
  alertButton: {
    padding: 10,
    borderRadius: 8,
    minWidth: 110,
    alignItems: 'center',
    flex: 1,
  },
});