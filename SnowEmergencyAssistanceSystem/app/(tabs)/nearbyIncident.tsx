// screens/nearbyIncidents.tsx (Final Version with Incident Overlap Filtered)

import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ActivityIndicator, 
  Alert, 
} from "react-native";
import SideMenu from './sideMenu'; // Assuming SideMenu is correctly imported
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons"; // Used for custom markers
import { router } from "expo-router";
import * as Location from 'expo-location'; 

// Import Firestore utilities (Assuming these are correctly set up in '@/firebaseConfig')
import { db, collection, getDocs, query, where } from '@/firebaseConfig'; 

// --- Configuration Constants ---
const INCIDENTS_COLLECTION = "fallReports"; 
const SEARCH_RADIUS_KM = 50; // Defines the 50 km radius (or 30 m)
const CRITICAL_RED = '#FF0000'; 
// Tolerance to filter out the incident at the user's exact location (approx 5 meters)
const COORDINATE_TOLERANCE = 0.00005; 

// Fallback/Initial Region (Fargo coordinates)
const initial_region: Region = {
    latitude: 46.8772, 
    longitude: -96.7898, 
    latitudeDelta: 0.1, 
    longitudeDelta: 0.1,
};

// --- IncidentData interface ---
interface IncidentData {
    id: string; 
    lat: number;
    lng: number;
    title: string;
    distanceKm: number;
    severity: string; 
}

// ----------------------------------------------------
// 🛑 HELPER 1: Calculates the approximate distance between two points (Haversine Formula)
const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

// 🛑 HELPER 2: Calculates the bounding square for the Firestore query
const getBounds = (centerLat: number, centerLng: number, radiusKm: number) => {
    const latDelta = radiusKm / 111.0; 
    const lngDelta = radiusKm / (111.32 * Math.cos(centerLat * (Math.PI / 180))); 

    return {
        latMin: centerLat - latDelta,
        latMax: centerLat + latDelta,
        lngMin: centerLng - lngDelta,
        lngMax: centerLng + lngDelta,
    };
};

// ----------------------------------------------------
/**
 * SIMPLE BOUNDING BOX QUERY (Requires Composite Index)
 */
const fetchNearbyIncidents = async (centerLat: number, centerLng: number): Promise<IncidentData[]> => {
    
    const bounds = getBounds(centerLat, centerLng, SEARCH_RADIUS_KM);
    
    // Firestore Query: Searches within the calculated square 
    const q = query(
        collection(db, INCIDENTS_COLLECTION),
        where('location.lat', '>=', bounds.latMin),
        where('location.lat', '<=', bounds.latMax),
        where('location.lng', '>=', bounds.lngMin),
        where('location.lng', '<=', bounds.lngMax)
    );
    
    const snapshot = await getDocs(q);
    const incidents: IncidentData[] = [];

    snapshot.forEach(doc => {
        const data = doc.data();
        const lat = data.location?.lat;
        const lng = data.location?.lng;
        const severity = data.severity || 'N/A';
        
        // Client-Side Circle Filter (REQUIRED)
        if (typeof lat === 'number' && typeof lng === 'number') {
            
            const distanceInKm = calculateDistanceKm(centerLat, centerLng, lat, lng);
            
            // Only include if within the circular radius
            if (distanceInKm <= SEARCH_RADIUS_KM) {
                incidents.push({
                    id: doc.id,
                    lat: lat,
                    lng: lng,
                    distanceKm: distanceInKm,
                    title: `Incident: ${severity} (${distanceInKm.toFixed(1)} km)`,
                    severity: severity, 
                });
            }
        }
    });

    return incidents;
};
// ----------------------------------------------------


export default function NearbyIncidentScreen() {
    const [region, setRegion] = useState<Region>(initial_region);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [incidentsMarkers, setIncidentsMarkers] = useState<IncidentData[]>([]);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
  
    const openSidebar = () => setIsMenuVisible(true);
    const closeSidebar = () => setIsMenuVisible(false);

    const getCurrentLocationAndFetch = useCallback(async () => {
        setLoading(true);
        let currentLatitude = initial_region.latitude;
        let currentLongitude = initial_region.longitude;
        
        let { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
            const error = "Permission to access location was denied. Showing incidents near default location.";
            setErrorMsg(error);
            Alert.alert("Permission Required", error);
        } else {
            try {
                let location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });

                currentLatitude = location.coords.latitude;
                currentLongitude = location.coords.longitude;
                setErrorMsg(null);
            } catch (error) {
                if (error instanceof Error) {
                    const error = `Error fetching GPS location: ${error.message}. Showing incidents near default location.`;
                    setErrorMsg(error);
                    Alert.alert("GPS Error", error);
                }
            }
        }
        
        try {
            // STEP 1: Fetch incidents around the determined location
            const nearbyIncidents = await fetchNearbyIncidents(currentLatitude, currentLongitude);
            setIncidentsMarkers(nearbyIncidents);
            
            // STEP 2: Update the map region to the center of the search
            setRegion(prev => ({
                ...prev,
                latitude: currentLatitude,
                longitude: currentLongitude,
            }));
        } catch (e) {
            console.error("Firestore fetch error:", e);
            Alert.alert("Data Error", "Failed to load incidents from the database.");
            setIncidentsMarkers([]); 
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        getCurrentLocationAndFetch();
    }, [getCurrentLocationAndFetch]);


    // --- Map Zoom Controls ---
    const zoomDelta = 0.01;
    const zoomIn = () => {
        setRegion(prev => ({
            ...prev,
            latitudeDelta: Math.max(0.005, prev.latitudeDelta - zoomDelta),
            longitudeDelta: Math.max(0.005, prev.longitudeDelta - zoomDelta),
        }));
    };
    const zoomOut = () => {
        setRegion(prev => ({
            ...prev,
            latitudeDelta: Math.min(1.0, prev.latitudeDelta + zoomDelta),
            longitudeDelta: Math.min(1.0, prev.longitudeDelta + zoomDelta),
        }));
    };
    // ------------------------------------

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color="#b30000" />
                <Text style={styles.loadingText}>Loading current location and incidents...</Text>
            </View>
        );
    }
    
    return (
        <View style={styles.container}>
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
          
          {errorMsg && <Text style={styles.errorText}>⚠️ Error: {errorMsg}</Text>}

          {/* Map and Markers */}
          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              region={region}
              onRegionChangeComplete={setRegion} 
              showsUserLocation={true} // Shows the blue pin at your location
            >
              
              {/* 🛑 FILTERING LOGIC: Skip markers that overlap the user's current location 🛑 */}
              {incidentsMarkers
                .filter(m => {
                  // Only show the incident marker if it's outside the small tolerance radius of the user's location (map center)
                  return (
                    Math.abs(m.lat - region.latitude) > COORDINATE_TOLERANCE ||
                    Math.abs(m.lng - region.longitude) > COORDINATE_TOLERANCE
                  );
                })
                .map((m) => (
                  <Marker
                    key={m.id}
                    coordinate={{ latitude: m.lat, longitude: m.lng }}
                    title={m.title}
                    description={`Severity: ${m.severity}, Distance: ${m.distanceKm.toFixed(1)} km`}
                    calloutOffset={{ x: 0, y: 15 }} 
                  >
                    {/* Custom Red Warning Icon */}
                    <View style={{ alignItems: 'center' }}>
                        <Ionicons 
                            name="alert-circle" 
                            size={40} 
                            color={CRITICAL_RED} 
                            style={{ 
                                textShadowColor: 'rgba(0, 0, 0, 0.5)',
                                textShadowOffset: { width: 1, height: 1 },
                                textShadowRadius: 2 
                            }}
                        />
                    </View>
                  </Marker>
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
              Found {incidentsMarkers.length - 1} incidents within **{SEARCH_RADIUS_KM} km**.
          </Text>
          
          <TouchableOpacity
              style={styles.refreshButton}
              onPress={getCurrentLocationAndFetch}
          >
              <Ionicons name="refresh" size={24} color="#fff" />
              <Text style={styles.refreshText}> Refresh Incidents</Text>
          </TouchableOpacity>

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
    incidentSummary: { 
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500',
        color: '#444',
        marginVertical: 10,
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#b30000',
        borderRadius: 8,
        paddingVertical: 10,
        alignSelf: 'center',
        width: 250,
        marginBottom: 10,
    },
    refreshText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    }
});