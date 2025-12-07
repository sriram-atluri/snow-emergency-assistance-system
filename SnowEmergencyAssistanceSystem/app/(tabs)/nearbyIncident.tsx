import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function NearbyIncidentScreen() {
  const [region, setRegion] = useState<Region>({
    latitude: 40.7484,
    longitude: -73.9857,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  });

  const redMarkers = [
    { lat: 40.7484, lng: -73.9870 },
    { lat: 40.7492, lng: -73.9840 },
    { lat: 40.7478, lng: -73.9835 },
    { lat: 40.7468, lng: -73.9860 },
    { lat: 40.7490, lng: -73.9880 },
  ];

  const userLocation = { lat: 40.746, lng: -73.982 };

  const zoomIn = () => {
    setRegion({
      ...region,
      latitudeDelta: region.latitudeDelta / 1.5,
      longitudeDelta: region.longitudeDelta / 1.5,
    });
  };

  const zoomOut = () => {
    setRegion({
      ...region,
      latitudeDelta: region.latitudeDelta * 1.5,
      longitudeDelta: region.longitudeDelta * 1.5,
    });
  };

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

      {/* App Title */}
      <Text style={styles.title}>Snow Guard</Text>

      {/* Page Title */}
      <Text style={styles.subtitle}>Nearby Incident</Text>

      {/* MAP REGION */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
        >
          {/* Red pins */}
          {redMarkers.map((m, index) => (
            <Marker
              key={index}
              coordinate={{ latitude: m.lat, longitude: m.lng }}
              pinColor="red"
            />
          ))}

          {/* Black user pin */}
          <Marker
            coordinate={{
              latitude: userLocation.lat,
              longitude: userLocation.lng,
            }}
            pinColor="black"
          />
        </MapView>

        {/* Zoom Buttons */}
        <View style={styles.zoomButtons}>
          <TouchableOpacity style={styles.zoomBtn} onPress={zoomIn}>
            <Ionicons name="add" size={26} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.zoomBtn} onPress={zoomOut}>
            <Ionicons name="remove" size={26} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Home Button */}
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
    marginBottom: 25,
  },

  mapContainer: {
    height: 360,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#ddd",
  },

  map: {
    flex: 1,
  },

  zoomButtons: {
    position: "absolute",
    bottom: 15,
    right: 15,
  },

  zoomBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
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
