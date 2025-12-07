import React, {useState} from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet
} from "react-native";
import { Ionicons, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function HomeScreen() {

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [isReminderOpen, setIsReminderOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleReminder = () => {
    setIsReminderOpen(true);
  }

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
        <TouchableOpacity 
        onPress={handleReminder}
        style={styles.card}>
          <Ionicons name="power" size={48} color="#ff3b3b" />
        </TouchableOpacity>

        {/* Call Button */}
        <TouchableOpacity 
        onPress={handleOpenDialog}
        style={styles.card}>
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
        {/* The Custom Modal Dialog */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDialogOpen}
        onRequestClose={() => setIsDialogOpen(false)}> // Handle Android back button
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Action Confirmation</Text>
            <Text style={styles.modalText}>
              Would you like to call 911?
            </Text>

            {/* Button to close the dialog */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsDialogOpen(false)}
            >
              <Text style={styles.buttonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isReminderOpen}
        onRequestClose={() => setIsReminderOpen(false)}> // Handle Android back button
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Snow Fall Detection - Active</Text>

            {/* Button to close the dialog */}
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
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dim background
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
});
