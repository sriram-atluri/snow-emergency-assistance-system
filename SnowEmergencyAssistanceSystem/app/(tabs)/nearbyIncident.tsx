import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator, 
} from "react-native";
import SideMenu from './sideMenu';
import MapView, { Marker, Region } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Location from 'expo-location'; 

// 🛑 NEW: FIREBASE IMPORTS 🛑
import { db, collection, getDocs, query, where, orderBy } from '@/firebaseConfig'; 

// --- Constants ---
const INCIDENTS_COLLECTION = "fallReports"; // Assuming fallReports stores incident locations
const SEARCH_RADIUS_KM = 50; 
const KM_PER_DEGREE_LAT = 111.0; // Approximation for latitude
// -----------------

// Fallback/Initial Region
const initial_region: Region = {
    latitude: 40.7484, // NYC
    longitude: -73.9857,
    latitudeDelta: 0.5, 
    longitudeDelta: 0.5,
};

interface MarkerData {
    id: string; // Add ID for key prop
    lat: number;
    lng: number;
    title: string;
    // Add other report data here if needed (e.g., severity)
}

// 🛑 NEW: GEO-QUERY HELPER FUNCTION 🛑
const fetchNearbyIncidents = async (centerLat: number, centerLng: number): Promise<MarkerData[]> => {
    const latDelta = SEARCH_RADIUS_KM / KM_PER_DEGREE_LAT;
    const lngDelta = SEARCH_RADIUS_KM / (KM_PER_DEGREE_LAT * Math.cos(centerLat * (Math.PI / 180)));

    // Define the bounding box for the query
    const minLat = centerLat - latDelta;
    const maxLat = centerLat + latDelta;
    const minLng = centerLng - lngDelta;
    const maxLng = centerLng + lngDelta;

    try {
        // Query 1: Filter by Latitude (Requires latitude to be the first field in a composite index)
        const latQuery = query(
            collection(db, INCIDENTS_COLLECTION),
            where("location.lat", ">=", minLat),
            where("location.lat", "<=", maxLat)
        );
        
        const snapshot = await getDocs(latQuery);
        const incidents: MarkerData[] = [];

        // Manually filter results by Longitude on the client side
        snapshot.forEach(doc => {
            const data = doc.data();
            const lat = data.location?.lat;
            const lng = data.location?.lng;
            const title = `Incident: ${data.severity || 'N/A'} at ${data.time}`;
            
            // Check if coordinates exist and are within the longitude bounds
            if (lat !== undefined && lng !== undefined && lng >= minLng && lng <= maxLng) {
                incidents.push({
                    id: doc.id,
                    lat: lat,
                    lng: lng,
                    title: title,
                });
            }
        });
        
        return incidents;

    } catch (error) {
        console.error("Error fetching nearby incidents:", error);
        return [];
    }
};


export default function NearbyIncidentScreen() {
    const [region, setRegion] = useState<Region>(initial_region);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    
    // State to hold the fetched incidents
    const [incidentsMarkers, setIncidentsMarkers] = useState<MarkerData[]>([]);

    const [isMenuVisible, setIsMenuVisible] = useState(false);
  
    const openSidebar = () => setIsMenuVisible(true);
    const closeSidebar = () => setIsMenuVisible(false);

    const getCurrentLocation = async () => {
        let currentLatitude = initial_region.latitude;
        let currentLongitude = initial_region.longitude;
        
        let { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
            setErrorMsg("Permission to access location was denied. Using fallback location.");
            // If denied, currentLatitude/Longitude remain the fallback values
        } else {
            try {
                let location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });

                currentLatitude = location.coords.latitude;
                currentLongitude = location.coords.longitude;
                setErrorMsg(null); // Clear previous error
            } catch (error) {
                if (error instanceof Error) {
                    setErrorMsg(`Error fetching location: ${error.message}. Using fallback location.`);
                }
            }
        }
        
        // 🛑 STEP 2: Fetch incidents around the determined location 🛑
        const nearbyIncidents = await fetchNearbyIncidents(currentLatitude, currentLongitude);
        setIncidentsMarkers(nearbyIncidents);


        // STEP 3: Update the map region
        setRegion(prevRegion => ({
            ...prevRegion,
            latitude: currentLatitude,
            longitude: currentLongitude,
        }));
        
        setLoading(false);
    };

    useEffect(() => {
        getCurrentLocation();
    }, []);


    // --- Map Zoom Controls (Retained) ---
    const zoomIn = () => { /* ... */ }; // Implementation remains the same
    const zoomOut = () => { /* ... */ }; // Implementation remains the same
    // ------------------------------------

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#b30000" />
                <Text style={styles.loadingText}>Loading current location and incidents...</Text>
            </View>
        );
    }
    
    const errorDisplay = errorMsg ? (
        <Text style={styles.errorText}>⚠️ Error: {errorMsg}</Text>
    ) : null;


    return (
        <View style={styles.container}>
            {/* ... (Menu and Title elements) ... */}
            <View style={styles.topRow}>
                <TouchableOpacity onPress={openSidebar}>
                    <Ionicons name="menu" size={32} color="#b30000" />
                </TouchableOpacity>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isMenuVisible}
                onRequestClose={closeSidebar}
            >
                <SideMenu onClose={closeSidebar} />
            </Modal>
        

          <Image
            source={require("../../assets/images/snow.png")}
            style={styles.logo}
          />

          <Text style={styles.title}>Snow Guard</Text>

          <Text style={styles.subtitle}>Nearby Incident</Text>
          
          {errorDisplay}

          {/* MAP REGION */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={region}
              onRegionChangeComplete={setRegion} 
              showsUserLocation={true} 
              showsMyLocationButton={true} 
            >
              {/* 🛑 DYNAMIC INCIDENT PINS FETCHED FROM FIREBASE 🛑 */}
              {incidentsMarkers.map((m, index) => (
                <Marker
                  key={m.id} // Use Firebase document ID as the key
                  coordinate={{ latitude: m.lat, longitude: m.lng }}
                  pinColor="red"
                  title={m.title}
                />
              ))}
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
          
          <Text style={styles.incidentSummary}>
              Found {incidentsMarkers.length} incidents within {SEARCH_RADIUS_KM} km.
          </Text>

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
    // ... (Your existing styles) ...
    container: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 25,
        backgroundColor: "#fff",
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 18,
        color: '#666',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        paddingVertical: 10,
        fontSize: 14,
        fontWeight: 'bold',
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
        marginBottom: 15,
    },
    mapContainer: {
        height: 360,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#ddd",
        marginBottom: 10,
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
        marginTop: 10,
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
    incidentSummary: { // NEW style for incident count
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500',
        color: '#444',
        marginBottom: 10,
    }
});