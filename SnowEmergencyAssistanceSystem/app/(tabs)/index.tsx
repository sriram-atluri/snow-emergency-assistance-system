// index.tsx (The Main Dashboard - UI Only)

import React, {useState} from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

// 🛑 IMPORT THE SEPARATE LOGIC COMPONENT 🛑
import SensorCollatorLogic from './SensorCollatorLogic'; // Adjust path if needed
import SideMenu from './sideMenu'; 
import { useAuth } from '@/context/AuthContext';


export default function HomeScreen() {
  const { signOut: firebaseSignOut } = useAuth(); // Assuming useAuth provides a signOut function

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  
  // State to control sensor logic component mount/unmount
  const [isSensorActive, setIsSensorActive] = useState(false); 

  const handleOpenDialog = () => setIsDialogOpen(true);
  const openSidebar = () => setIsMenuVisible(true);
  const closeSidebar = () => setIsMenuVisible(false);

  // Toggle sensor and show confirmation modal
  const handlePowerToggle = () => {
    // Toggling the state here mounts or unmounts SensorCollatorLogic.tsx
    setIsSensorActive(prev => !prev);
    
    // Show the reminder modal only when turning ON
    if (!isSensorActive) {
        setIsReminderOpen(true);
    }
  }

  const navigateToReports = () => router.push('/report'); 
  const navigateToMap = () => router.push('/nearbyIncident'); 
  
  // Function to handle sign out
  const handleSignOut = async () => {
    try {
        await firebaseSignOut(); 
    } catch (error) {
        console.error("Logout failed:", error);
        Alert.alert("Error", "Failed to sign out.");
    }
  };


  return (
    <View style={styles.container}>

      {/* 🛑 MOUNT/UNMOUNT THE SEPARATE LOGIC COMPONENT 🛑 */}
      {isSensorActive && <SensorCollatorLogic />}

      {/* Top Bar */}
      <View style={styles.topRow}>
        <TouchableOpacity onPress={openSidebar}>
          <Ionicons name="menu" size={32} color="#b30000" />
        </TouchableOpacity>
        
        {/* Sign Out Button (Added for easy access) */}
        <TouchableOpacity
            onPress={handleSignOut}
            style={{ position: 'absolute', right: 0 }}
        >
            <Ionicons name="log-out-outline" size={32} color="#888" />
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
        
        {/* Power Button (Toggles SensorCollatorLogic) */}
        <TouchableOpacity 
        onPress={handlePowerToggle}
        style={styles.card}>
          <Ionicons name={isSensorActive ? "power" : "power-outline"} size={48} color={isSensorActive ? "#2ECC71" : "#ff3b3b"} />
          <Text style={styles.label}>{isSensorActive ? "Monitoring" : "Power"}</Text>
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

      {/* Snow Fall Detection Status Modal (Reminder) */}
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

    </View>
  );
};

// ... (Styles remain the same) ...
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
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  label: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#444",
  }
});