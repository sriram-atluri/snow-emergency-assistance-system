import MapView, { Region } from 'react-native-maps';
import { StyleSheet, View, Text, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location'; // Using expo-location

// Type definition for the initial region
const start_region: Region = {
    latitude: 44.9778,
    longitude: -93.2650, // Coordinates for Minneapolis/St. Paul as an example
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
};

const MappingScreen = () => {

    // Holding map's current region state
    const [region, setRegion] = useState<Region>(start_region);

    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const getCurrentLocation = async () => {
        // 1. Request Location Permissions
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg("Permission to access location was denied.");
            setLoading(false);
            return;
        }

        try {
            // 2. Get Current Position
            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const currentLatitude = location.coords.latitude;
            const currentLongitude = location.coords.longitude;

            // 3. Update the map region
            setRegion({
                latitude: currentLatitude,
                longitude: currentLongitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            });
            
            setLoading(false);

        } catch (error) {
            // Handle errors during location fetching
            if (error instanceof Error) {
                setErrorMsg(`Error fetching location: ${error.message}`);
            } else {
                setErrorMsg(`An unknown error occurred while fetching location.`);
            }
            setLoading(false);
        }
    };

    // Call the function when the component mounts
    useEffect(() => {
        getCurrentLocation();
    }, []);

    // --- Render Logic ---

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Loading map and location...</Text>
            </View>
        );
    }

    // Display error message but still show the map with the fallback region
    if (errorMsg) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Error: {errorMsg}</Text>
                {/* Fallback to display the map even on error, using the initial region state */}
                <MapView
                    style={styles.map}
                    initialRegion={start_region} // Use the predefined fallback region
                    showsUserLocation={true}
                />
            </View>
        );
    }

    // Success state: display map centered on the fetched region
    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                region={region} // Controlled component using the region state
                showsUserLocation={true}
                showsMyLocationButton={true}
            />
        </View>
    );
}

// --- Styles ---

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        padding: 20,
        // Make sure error text doesn't overlap the map too much, or use an absolute position
    }
});

export default MappingScreen;