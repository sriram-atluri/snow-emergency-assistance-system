import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';

// --- Static Profile Data ---
const PROFILE_DATA = {
  name: "John Duet",
  email: "john.duet@example.com",
  memberSince: "November 2024",
  status: "Active",
  emergencyContact: "Jane Duet",
};

export default function ProfileScreen() {

  const handleMenuPress = () => {
    // This is where you would open the SideMenu if it were present on this page
    console.log("Menu button pressed!");
    // For now, you can just navigate home as a placeholder:
    // router.push("/"); 
  };

  return (
    <View style={styles.container}>
      
      {/* 1. TOP BAR */}
      <View style={styles.topRow}>
        <TouchableOpacity onPress={handleMenuPress}>
          <Ionicons name="menu" size={32} color="#b30000" />
        </TouchableOpacity>
      </View>

      {/* 2. HEADER: Logo and Title */}
      <Image
        source={require("../../assets/images/snow.png")}
        style={styles.logo}
      />
      <Text style={styles.title}>Snow Guard</Text>
      <Text style={styles.subtitle}>User Profile</Text>

      {/* 3. PROFILE CARD */}
      <View style={styles.profileCard}>
        <Ionicons name="person-circle-outline" size={80} color="#b30000" style={styles.avatar} />
        <Text style={styles.nameText}>{PROFILE_DATA.name}</Text>
        <Text style={styles.statusText}>Status: {PROFILE_DATA.status}</Text>
        
        <View style={styles.divider} />
        
        {/* Detail Rows */}
        <View style={styles.detailRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{PROFILE_DATA.email}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Member Since:</Text>
          <Text style={styles.value}>{PROFILE_DATA.memberSince}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Emergency Contact:</Text>
          <Text style={styles.value}>{PROFILE_DATA.emergencyContact}</Text>
        </View>

        {/* Placeholder for an Edit/Update button */}
       {/* <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editText}>Edit Profile</Text>
  </TouchableOpacity>*/}
      </View>

      {/* HOME BUTTON */}
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
    backgroundColor: '#fff',
  },
  topRow: {
    position: 'absolute',
    top: 60,
    left: 25,
    zIndex: 100,
    padding: 0,
  },
  logo: {
    width: 85,
    height: 85,
    alignSelf: "center",
    marginBottom: 5,
    marginTop: 10,
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
  profileCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  avatar: {
    marginBottom: 10,
  },
  nameText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 16,
    color: 'green',
    fontWeight: '600',
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    width: '100%',
    marginVertical: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  value: {
    fontSize: 16,
    color: '#333',
    maxWidth: '60%', // Prevent long text from pushing the label too far
    textAlign: 'right',
  },
  editButton: {
    marginTop: 20,
    backgroundColor: '#ff8a80',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  editText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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